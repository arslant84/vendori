import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('database') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No database file provided' },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file to the public directory
    const publicDir = join(process.cwd(), 'public');
    const filePath = join(publicDir, 'vendors.db');
    
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving database:', error);
    return NextResponse.json(
      { error: 'Failed to save database file' },
      { status: 500 }
    );
  }
} 