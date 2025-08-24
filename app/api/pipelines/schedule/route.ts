import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005';

export async function POST(request: NextRequest) {
  console.log('Schedule POST - BACKEND_URL:', BACKEND_URL);
  console.log('Environment variables:', {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  });
  
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    console.log('Scheduling pipeline at:', `${BACKEND_URL}/api/pipelines/schedule`);
    const response = await fetch(`${BACKEND_URL}/api/pipelines/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to schedule pipeline' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error scheduling pipeline:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}