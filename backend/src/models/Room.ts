import db from '../db/knex';

export interface Room {
  id: number;
  number: string;
  type: string;
  status: 'available' | 'occupied' | 'complet';
  maxOccupancy: number;
  floor?: number;
  rent?: number;
}

export async function getAllRooms(): Promise<Room[]> {
  return db<Room>('rooms').select('*');
}

export async function getRoomById(id: number): Promise<Room | undefined> {
  return db<Room>('rooms').where({ id }).first();
}

export async function createRoom(room: Omit<Room, 'id'>): Promise<Room> {
  const [created] = await db<Room>('rooms').insert(room).returning('*');
  return created;
}

export async function updateRoom(id: number, room: Partial<Room>): Promise<Room | undefined> {
  const [updated] = await db<Room>('rooms').where({ id }).update(room).returning('*');
  return updated;
}

export async function deleteRoom(id: number): Promise<void> {
  await db<Room>('rooms').where({ id }).del();
}
