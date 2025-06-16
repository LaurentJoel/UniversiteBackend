import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiConfig, API_ENDPOINTS } from '../config/api';
import { Room, Student, Payment, PaymentStatus, User } from '../types';
import { 
  transformBackendRoom, 
  transformBackendStudent, 
  transformBackendPayment,
  transformFrontendRoom,
  transformFrontendStudent 
} from '../utils/dataTransforms';
import {
  generateMockRooms,
  generateMockStudents
} from '../utils/mockData';

// Interface for ApiService to expose its methods for TypeScript
export interface IApiService {  // Authentication
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<LoginResponse>;
  getCurrentUser(): Promise<User>;
  updateUser(userData: Partial<User>): Promise<User>;
  
  // Room APIs
  getRooms(): Promise<Room[]>;
  getRoomsByStatus(status: string): Promise<Room[]>;
  getRoomsByFloor(floor: number): Promise<Room[]>;
  createRoom(room: Omit<Room, 'id'>): Promise<Room>;
  updateRoom(id: string, room: Partial<Room>): Promise<Room>;
  updateRoomStatus(code: string, status: string): Promise<void>;
  deleteRoom(id: string): Promise<void>;
  getRoomById(id: string): Promise<Room>;
  addStudentToRoom(roomCode: string, studentId: string): Promise<void>;
  removeStudentFromRoom(roomCode: string, matricule: string): Promise<void>;
  
  // Student APIs
  getStudents(): Promise<Student[]>;
  createStudent(student: Omit<Student, 'id'>): Promise<Student>;
  updateStudent(id: string, student: Partial<Student>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  getStudentById(id: string): Promise<Student>;
  getStudentByMatricule(matricule: string): Promise<Student>;
  getStudentRemainingRent(studentId: string): Promise<{ totalRentDue: number; totalPaid: number; remainingRent: number; monthsStayed: number; roomRent: number }>;

  assignStudentToRoom(studentId: string, roomCode: string): Promise<void>;
  unassignStudentFromRoom(studentId: string): Promise<void>;  // Payment APIs
  getPayments(): Promise<Payment[]>;
  getStudentPayments(studentId: string): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment>;
  createPayment(payment: Omit<Payment, 'id'>): Promise<Payment>;
  updatePayment(id: string, payment: Partial<Payment>): Promise<Payment>;
  updatePaymentStatus(id: string, status: string, paidDate?: string): Promise<Payment>;
  deletePayment(id: string): Promise<void>;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// For direct backend responses that include token and user
interface LoginResponseDirect {
  token: string;
  user: User;
  expiresIn: number;
  success?: boolean;
}

// For responses wrapped in ApiResponse format
interface LoginResponse extends LoginResponseDirect {
  success: boolean;
}

class ApiService implements IApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    const config = getApiConfig();
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      console.log(`API Request: ${endpoint}`, options.method || 'GET');
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);      // First try to parse the response as JSON
      let data;
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        } else {
          // For 204 No Content responses or empty responses
          data = { success: response.ok };
        }
      } catch (err) {
        // If response is not JSON, create a basic object
        data = { success: response.ok, message: 'No content' };
      }
      
      if (!response.ok) {
        // Enhanced error object with more information
        const error = new Error(data.message || `HTTP Error ${response.status}`);
        Object.assign(error, { 
          status: response.status, 
          data,
          endpoint 
        });
        throw error;
      }

      // Normalize the response format to match ApiResponse interface
      if (typeof data === 'object' && data !== null) {
        if (!('data' in data) && !('success' in data)) {
          // If the response is directly the data (common pattern), wrap it
          return { data: data as T, success: true };
        }
        // If it already has a success field but not data (for empty responses)
        if (!('data' in data) && 'success' in data) {
          return { ...data, data: {} as T };
        }
      }
      
      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Request timeout for ${endpoint} after ${this.timeout}ms`);
        const timeoutError = new Error('Request timeout');
        Object.assign(timeoutError, { 
          isTimeout: true,
          endpoint 
        });
        throw timeoutError;
      }
      
      // If it's a network error (offline, etc.)
      const err = error as Error & { status?: number };
      if (!err.status) {
        console.error(`Network error for ${endpoint}:`, error);
      }
      
      throw error;
    }
  }
  
  // Authentication APIs
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('API login attempt with:', email);
      const response = await this.request<any>(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Raw login response:', JSON.stringify(response));
      
      // Handle different response formats
      let loginData: Partial<LoginResponseDirect> = {};
      
      if (typeof response === 'object' && response !== null) {
        if (response.data && typeof response.data === 'object' && 'token' in response.data) {
          // If the response has a nested data property with token
          loginData = response.data as Partial<LoginResponseDirect>;
        } else if ('token' in response && 'user' in response) {
          // If the token is directly on the response
          loginData = {
            token: (response as any).token,
            user: (response as any).user,
            expiresIn: (response as any).expiresIn || 3600
          };
        } else {
          console.error('Invalid login response format:', response);
          throw new Error('Invalid login response format');
        }
      } else {
        console.error('Response is not an object:', response);
        throw new Error('Invalid response format');
      }
      
      // Ensure the response has the expected shape
      if (!loginData.user || !loginData.token) {
        console.error('Missing user or token in login response');
        throw new Error('Invalid login response: missing user or token');
      }
      
      // Create a proper LoginResponse with success property
      const loginResponse: LoginResponse = {
        token: loginData.token,
        user: loginData.user as User,
        expiresIn: loginData.expiresIn || 3600,
        success: true
      };
      console.log('Processed login response:', JSON.stringify(loginResponse));
      return loginResponse;
    } catch (error: unknown) {
      console.error('Login request error:', error);
      const err = error as Error & { isTimeout?: boolean };
      if (err.isTimeout) {
        console.warn('Login request timed out. Using mock login flow.');
        // If in development mode, we can provide a mock login for testing
        if (__DEV__ && (email.includes('admin') || email.includes('student'))) {
          // Create a mock user for development testing
          const mockUser: User = {
            id: '1',
            name: email.includes('admin') ? 'Admin User' : 'Student User',
            email,
            role: email.includes('admin') ? 'admin' : 'student',
          };
          
          // Store the mock token and user
          await AsyncStorage.setItem('token', 'mock-token-for-dev');
          await AsyncStorage.setItem('user', JSON.stringify(mockUser));
          
          // Return a properly formatted LoginResponse
          return {
            token: 'mock-token-for-dev',
            user: mockUser,
            expiresIn: 3600,
            success: true
          };
        }
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error: unknown) {
      const err = error as Error & { isTimeout?: boolean };
      if (err.isTimeout) {
        console.warn('Logout request timed out. Proceeding with local logout.');
      } else {
        console.error('Logout failed:', error);
      }
    } finally {
      // Always clear local storage regardless of API success
      await AsyncStorage.multiRemove(['token', 'user']);
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await this.request<any>(API_ENDPOINTS.REFRESH, {
        method: 'POST',
      });
      
      // Handle different response formats similarly to login
      let tokenData: Partial<LoginResponseDirect> = {};
      
      if (typeof response === 'object' && response !== null) {
        if (response.data && typeof response.data === 'object' && 'token' in response.data) {
          tokenData = response.data as Partial<LoginResponseDirect>;
        } else if ('token' in response && 'user' in response) {
          tokenData = {
            token: (response as any).token,
            user: (response as any).user,
            expiresIn: (response as any).expiresIn || 3600
          };
        } else {
          throw new Error('Invalid refresh token response format');
        }
      } else {
        throw new Error('Response is not an object');
      }
      
      if (!tokenData.token || !tokenData.user) {
        throw new Error('Missing token or user in refresh response');
      }
      
      // Create a proper LoginResponse
      return {
        token: tokenData.token,
        user: tokenData.user as User,
        expiresIn: tokenData.expiresIn || 3600,
        success: true
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.request<any>(API_ENDPOINTS.ME);
      
      // Handle different response formats
      if (typeof response === 'object' && response !== null) {
        if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          // If user is in data property
          return response.data as User;
        } else if ('user' in response && typeof (response as any).user === 'object') {
          // If user is in user property
          return (response as any).user as User;
        } else if ('id' in response && 'role' in response && 'name' in response && 'email' in response) {
          // If response is the user directly, ensure it has all User properties
          return response as unknown as User;
        }
      }
      
      throw new Error('Invalid user response format');
    } catch (error) {      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      console.log('Updating user with data:', userData);
      
      const response = await this.request<any>(API_ENDPOINTS.ME, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      // Handle different response formats
      if (typeof response === 'object' && response !== null) {
        if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          return response.data as User;
        } else if ('user' in response && typeof (response as any).user === 'object') {
          return (response as any).user as User;
        } else if ('id' in response && 'role' in response && 'name' in response && 'email' in response) {
          return response as unknown as User;
        }
      }
      
      throw new Error('Invalid user update response format');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Room APIs
  async getRooms(): Promise<Room[]> {
    const response = await this.request<any[]>(API_ENDPOINTS.ROOMS);
    // Backend returns data directly, not wrapped in a data property
    const rooms = Array.isArray(response) ? response : (response.data || []);
    return rooms.map(transformBackendRoom);
  }

  async getRoomsByStatus(status: string): Promise<Room[]> {
    const response = await this.request<any[]>(API_ENDPOINTS.ROOMS_BY_STATUS(status));
    return response.data.map(transformBackendRoom);
  }

  async getRoomsByFloor(floor: number): Promise<Room[]> {
    const response = await this.request<any[]>(API_ENDPOINTS.ROOMS_BY_FLOOR(floor));
    return response.data.map(transformBackendRoom);
  }
  async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    // Transform to backend format, including occupantCount and maxOccupancy
    const backendRoom = transformFrontendRoom(room);
    
    console.log('Creating room with data:', backendRoom);
    
    try {
      const response = await this.request<any>(API_ENDPOINTS.ROOMS, {
        method: 'POST',
        body: JSON.stringify(backendRoom),
      });
      
      // If the response is an array or doesn't have a data property, handle it appropriately
      const responseData = response.data || response;
      return transformBackendRoom(responseData);
    } catch (error) {
      console.error('Error in createRoom:', error);
      throw error;
    }
  }
  async updateRoom(id: string, room: Partial<Room>): Promise<Room> {
    const backendRoom = transformFrontendRoom(room);
    console.log('Updating room with data:', backendRoom);
    
    const response = await this.request<any>(API_ENDPOINTS.ROOM_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(backendRoom),
    });
    return transformBackendRoom(response.data);
  }

  async updateRoomStatus(code: string, status: string): Promise<void> {
    await this.request(`/chambres/update-status/${code}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteRoom(id: string): Promise<void> {
    await this.request(API_ENDPOINTS.ROOM_BY_ID(id), {
      method: 'DELETE',
    });
  }  async getRoomById(id: string): Promise<Room> {
    console.log('getRoomById called with id:', id);
    const response = await this.request<any>(API_ENDPOINTS.ROOM_BY_ID(id));
    console.log('getRoomById raw response:', response);
    const roomData = response.data || response;
    console.log('getRoomById room data to transform:', roomData);
    const transformed = transformBackendRoom(roomData);
    console.log('getRoomById transformed:', transformed);
    return transformed;
  }

  async addStudentToRoom(roomCode: string, studentId: string): Promise<void> {
    await this.request(`/chambres/${roomCode}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  }

  async removeStudentFromRoom(roomCode: string, matricule: string): Promise<void> {
    await this.request(`/chambres/${roomCode}/students/${matricule}`, {
      method: 'DELETE',
    });
  }

  // Student APIs
  async getStudents(): Promise<Student[]> {
    const response = await this.request<any[]>(API_ENDPOINTS.STUDENTS);
    // Backend returns data directly, not wrapped in a data property
    const students = Array.isArray(response) ? response : (response.data || []);
    return students.map(transformBackendStudent);
  }  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    try {
      console.log('Creating student with data:', student);
      const backendStudent = transformFrontendStudent(student);
      console.log('Transformed student data for backend:', backendStudent);
      
      // Validate required fields
      if (!backendStudent.name || !backendStudent.email) {
        throw new Error('Le nom et l\'email sont obligatoires');
      }
      
      const response = await this.request<any>(API_ENDPOINTS.STUDENTS, {
        method: 'POST',
        body: JSON.stringify(backendStudent),
      });
      
      // Handle response.data if the response is wrapped, otherwise use response directly
      const studentData = response.data || response;
      console.log('Student data received from backend:', studentData);
      
      return transformBackendStudent(studentData);} catch (error: any) {
      console.error('Error in createStudent:', error);
      
      // Provide more specific error messages
      if (error.data && error.data.errors) {
        const fieldErrors = error.data.errors.map((err: any) => 
          `${err.path}: ${err.msg}`
        ).join(', ');
        throw new Error(`Validation error: ${fieldErrors}`);
      }
      
      // Check for database schema errors
      if (error.message && (
          error.message.includes('column') && error.message.includes('does not exist') ||
          error.message.includes('relation')
      )) {
        throw new Error(`Database schema error: ${error.message}. Please contact your administrator.`);
      }
      
      throw error;
    }
  }
  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const backendStudent = transformFrontendStudent(student);
    const response = await this.request<any>(API_ENDPOINTS.STUDENT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(backendStudent),
    });
    
    // Handle response.data if the response is wrapped, otherwise use response directly
    const studentData = response.data || response;
    
    return transformBackendStudent(studentData);
  }
  async deleteStudent(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting student with ID:', id);
      await this.request(API_ENDPOINTS.STUDENT_BY_ID(id), {
        method: 'DELETE',
      });
      console.log('✅ Student deleted successfully from backend');
    } catch (error: any) {
      console.error('❌ Error deleting student from backend:', error);
      // Check if the error is actually a successful 204 response
      if (error.status === 204 || (error.data && error.data.success)) {
        console.log('✅ Delete was actually successful (204 response)');
        return;
      }
      throw error;
    }
  }
  async getStudentById(id: string): Promise<Student> {
    console.log('Calling getStudentById with ID:', id);
    const response = await this.request<any>(API_ENDPOINTS.STUDENT_BY_ID(id));
    console.log('Raw API response:', response);
    const studentData = response.data || response;
    console.log('Student data to transform:', studentData);
    return transformBackendStudent(studentData);
  }

  async getStudentByMatricule(matricule: string): Promise<Student> {
    const response = await this.request<any>(API_ENDPOINTS.STUDENT_BY_MATRICULE(matricule));
    return transformBackendStudent(response);
  }

  async getStudentRemainingRent(studentId: string): Promise<{ totalRentDue: number; totalPaid: number; remainingRent: number; monthsStayed: number; roomRent: number }> {
    const response = await this.request<any>(API_ENDPOINTS.STUDENT_REMAINING_RENT(studentId));
    return response.data;
  }

  async assignStudentToRoom(studentId: string, roomCode: string): Promise<void> {
    await this.request(`/etudiants/${studentId}/assign-room`, {
      method: 'PUT',
      body: JSON.stringify({ roomCode }),
    });
  }

  async unassignStudentFromRoom(studentId: string): Promise<void> {
    await this.request(`/etudiants/${studentId}/remove-room`, {
      method: 'PUT',
    });
  }

  // Payment APIs
  async getPayments(): Promise<Payment[]> {
    const response = await this.request<any[]>(API_ENDPOINTS.PAYMENTS);
    // Backend returns data directly, not wrapped in a data property
    const payments = Array.isArray(response) ? response : (response.data || []);
    return payments.map(transformBackendPayment);
  }

  async getStudentPayments(studentId: string): Promise<Payment[]> {
    const response = await this.request<any[]>(
      API_ENDPOINTS.STUDENT_PAYMENTS(studentId)
    );    // Backend returns data directly, not wrapped in a data property
    const payments = Array.isArray(response) ? response : (response.data || []);
    return payments.map(transformBackendPayment);
  }

  async getPaymentById(id: string): Promise<Payment> {
    const response = await this.request<any>(API_ENDPOINTS.PAYMENT_BY_ID(id));
    // Handle both wrapped and unwrapped responses
    const paymentData = response.data || response;
    return transformBackendPayment(paymentData);
  }  async createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    try {
      console.log('Creating payment with data:', payment);
      const backendPayment = {
        studentId: parseInt(payment.studentId),
        studentName: payment.studentName, // Include student name
        amount: payment.amount,
        dueDate: payment.dueDate,
        paidDate: payment.paidDate || null,
        status: payment.status,
        description: payment.description,
        roomNumber: payment.roomNumber
      };
      console.log('Transformed payment data for backend:', backendPayment);

      const response = await this.request<any>(API_ENDPOINTS.PAYMENTS, {
        method: 'POST',
        body: JSON.stringify(backendPayment),
      });
      
      // Handle both wrapped and unwrapped responses
      const paymentData = response.data || response;
      
      return transformBackendPayment(paymentData);
    } catch (error) {
      console.error('Error in createPayment:', error);
      throw error;
    }
  }
  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
    try {
      console.log('🔄 Updating payment with data:', payment);
      
      // Validate required fields
      if (!payment.studentId || payment.studentId.trim() === '') {
        throw new Error('Student ID is required');
      }
      
      if (!payment.amount || payment.amount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      
      if (!payment.dueDate || payment.dueDate.trim() === '') {
        throw new Error('Due date is required');
      }
      
      const backendPayment = {
        studentId: parseInt(payment.studentId),
        studentName: payment.studentName || '',
        amount: payment.amount,
        dueDate: payment.dueDate,
        paidDate: payment.paidDate || null,
        status: payment.status || 'pending',
        description: payment.description || '',
        roomNumber: payment.roomNumber || null
      };
      console.log('📤 Transformed payment data for backend:', backendPayment);

      const response = await this.request<any>(API_ENDPOINTS.PAYMENT_BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(backendPayment),
      });
      
      // Handle both wrapped and unwrapped responses
      const paymentData = response.data || response;
      
      return transformBackendPayment(paymentData);
    } catch (error) {
      console.error('❌ Error in updatePayment:', error);
      throw error;
    }
  }
  async updatePaymentStatus(
    id: string,
    status: string,
    paidDate?: string
  ): Promise<Payment> {
    try {
      // First get the current payment to get all required fields
      const currentPayment = await this.getPaymentById(id);
      
      // Update only the status and paidDate while preserving other fields
      const updatedPayment = {
        studentId: parseInt(currentPayment.studentId),
        studentName: currentPayment.studentName,
        amount: currentPayment.amount,
        dueDate: currentPayment.dueDate,
        paidDate: paidDate || currentPayment.paidDate || null,
        status: status as PaymentStatus,
        description: currentPayment.description,
        roomNumber: currentPayment.roomNumber
      };
      
      console.log('Updating payment status with full data:', updatedPayment);
      
      const response = await this.request<any>(API_ENDPOINTS.PAYMENT_BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(updatedPayment),
      });
      
      const paymentData = response.data || response;
      return transformBackendPayment(paymentData);
    } catch (error) {      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting payment with ID:', id);
      await this.request(API_ENDPOINTS.PAYMENT_BY_ID(id), {
        method: 'DELETE',
      });
      console.log('✅ Payment deleted successfully');
    } catch (error) {
      console.error('❌ Error in deletePayment:', error);
      throw error;
    }
  }
}

// Create an instance of the ApiService class
const apiServiceInstance: IApiService = new ApiService();

// Export both the class and the instance
export { ApiService };
export default apiServiceInstance;
