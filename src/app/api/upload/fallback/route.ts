import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Fallback upload endpoint when UploadThing fails
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'contracts');
    await mkdir(uploadsDir, { recursive: true });

    for (const file of files) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Only PDF files are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size (4MB max)
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: `File too large: ${file.name}. Maximum size is 4MB.` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
      const filename = `${timestamp}-${originalName}`;
      const filepath = path.join(uploadsDir, filename);

      // Convert file to buffer and save
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);

      // Create public URL
      const fileUrl = `/uploads/contracts/${filename}`;

      uploadedFiles.push({
        url: fileUrl,
        name: originalName,
        size: file.size,
        uploadedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    });

  } catch (error) {
    console.error('Fallback upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
