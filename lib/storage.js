// lib/storage.js

// Untuk Vercel Blob Storage
import { put } from '@vercel/blob';

export class ImageStorage {
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'vercel-blob';
  }

  async uploadImage(fileBuffer, fileName, contentType) {
    try {
      switch (this.storageType) {
        case 'vercel-blob':
          return await this.uploadToVercelBlob(fileBuffer, fileName, contentType);
        case 'cloudinary':
          return await this.uploadToCloudinary(fileBuffer, fileName);
        case 'aws-s3':
          return await this.uploadToS3(fileBuffer, fileName, contentType);
        default:
          return await this.uploadToVercelBlob(fileBuffer, fileName, contentType);
      }
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Method 1: Vercel Blob Storage (Recommended for Vercel)
  async uploadToVercelBlob(fileBuffer, fileName, contentType) {
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      contentType: contentType
    });

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname
    };
  }

  // Method 2: Cloudinary (Alternative)
  async uploadToCloudinary(fileBuffer, fileName) {
    // Cloudinary implementation
    const cloudinary = require('cloudinary').v2;
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: fileName.split('.')[0],
          folder: 'photo-hosting'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      ).end(fileBuffer);
    });
  }

  // Method 3: AWS S3 (Alternative)
  async uploadToS3(fileBuffer, fileName, contentType) {
    const AWS = require('aws-sdk');
    
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${fileName}`,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    
    return {
      url: result.Location,
      key: result.Key
    };
  }

  // Generate unique filename
  generateFileName(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'jpg';
    
    return `${timestamp}-${randomString}.${extension}`;
  }

  // Validate file type
  validateImageType(mimeType) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    return allowedTypes.includes(mimeType);
  }

  // Validate file size (max 10MB)
  validateFileSize(size) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return size <= maxSize;
  }
}

// Singleton instance
export const imageStorage = new ImageStorage();
