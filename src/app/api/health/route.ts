import { connectDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    return NextResponse.json(
      { 
        status: 'success',
        message: 'MongoDB connected successfully!',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
