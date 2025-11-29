// api/upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Untuk Vercel, kita bisa menggunakan Vercel Blob Storage
    // Atau alternatif lain seperti Cloudinary, AWS S3, dll.
    
    // Contoh dengan Base64 (sementara)
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Generate unique filename
    const fileId = generateFileId();
    const fileExtension = getFileExtension(req.headers['content-type'] || 'image/jpeg');
    const filename = `${fileId}.${fileExtension}`;

    // Simpan file (dalam implementasi nyata, simpan ke storage service)
    // Untuk demo, kita return URL placeholder
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const imageUrl = `${baseUrl}/api/images/${filename}`;

    res.status(200).json({
      success: true,
      url: imageUrl,
      filename: filename,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateFileId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function getFileExtension(contentType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  return extensions[contentType] || 'jpg';
}
