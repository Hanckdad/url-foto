// api/upload.js
import { imageStorage } from '../../lib/storage.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Check if image data is provided
    const { image: base64Image, filename: originalFilename } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided'
      });
    }

    // Extract base64 data
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format'
      });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Validate image type
    if (!imageStorage.validateImageType(mimeType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image type. Only JPG, PNG, GIF, and WebP are allowed.'
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Validate file size
    if (!imageStorage.validateFileSize(imageBuffer.length)) {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      });
    }

    // Generate filename
    const fileName = imageStorage.generateFileName(originalFilename || 'image');

    // Upload to storage
    const uploadResult = await imageStorage.uploadImage(
      imageBuffer, 
      fileName, 
      mimeType
    );

    // Return success response
    res.status(200).json({
      success: true,
      url: uploadResult.url,
      filename: fileName,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload API error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during upload'
    });
  }
}
