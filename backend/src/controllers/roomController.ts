import { Request, Response } from 'express';
import * as RoomModel from '../models/Room';

export async function getAllRooms(req: Request, res: Response) {
  try {
    const rooms = await RoomModel.getAllRooms();
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getRoomById(req: Request, res: Response) {
  try {
    console.log('Getting room by ID:', req.params.id);
    const room = await RoomModel.getRoomById(Number(req.params.id));
    console.log('Room found:', room);
    if (!room) {
      console.log('Room not found for ID:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error(`Error fetching room ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function createRoom(req: Request, res: Response) {
  try {
    const room = await RoomModel.createRoom(req.body);
    res.status(201).json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function updateRoom(req: Request, res: Response) {
  try {
    const updated = await RoomModel.updateRoom(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    res.json({
      success: true,
      data: updated,
      message: 'Room updated successfully'
    });
  } catch (error) {
    console.error(`Error updating room ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function deleteRoom(req: Request, res: Response) {
  try {
    await RoomModel.deleteRoom(Number(req.params.id));
    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting room ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
