import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  console.log('=== FRONTEND API ROUTE CALLED ===');
  
  try {
    const formData = await request.formData();
    const logo = formData.get('logo');
    const folderName = formData.get('folderName');
    const fileName = formData.get('fileName');
    
    console.log('Received data:', {
      folderName,
      fileName,
      logoName: logo?.name,
      logoSize: logo?.size,
      logoType: logo?.type
    });
    
    if (!logo || !folderName || !fileName) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: { hasLogo: !!logo, hasFolder: !!folderName, hasFile: !!fileName }
      }, { status: 400 });
    }

    // Create directory structure
    const publicDir = process.cwd();
    const logosDir = path.join(publicDir, 'public', 'images', folderName, 'logos');
    
    console.log('Creating directory:', logosDir);
    
    // Create directories recursively
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
      console.log('Directory created successfully');
    }

    // Save the file
    const bytes = await logo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(logosDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log('File saved successfully to:', filePath);
    
    // Verify file was saved
    if (fs.existsSync(filePath)) {
      console.log('File verified at:', filePath);
      console.log('File size:', fs.statSync(filePath).size);
    }
    
    return NextResponse.json({ 
      success: true, 
      path: `/images/${folderName}/logos/${fileName}`,
      message: 'Logo saved successfully'
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ 
      error: 'Failed to save logo', 
      details: error.message 
    }, { status: 500 });
  }
}