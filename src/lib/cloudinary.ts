import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET_KEY || process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && apiKey && apiSecret);
}

// Generate server-side signed parameters for direct secure uploads from client
export function generateSignedUploadParams(folder: string = 'sunpathlab') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not properly configured.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret!);

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  };
}

// Upload file directly from server buffer / base64
export async function uploadImageServerSide(fileBuffer: Buffer, folder: string = 'sunpathlab', publicId?: string) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

// Delete image from Cloudinary
export async function deleteCloudinaryImage(publicId: string) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  return await cloudinary.uploader.destroy(publicId);
}

// Generate optimized responsive URL
export function getOptimizedImageUrl(publicIdOrUrl: string, width?: number, height?: number): string {
  if (!publicIdOrUrl) return '/images/logo.jpeg';
  if (publicIdOrUrl.startsWith('/') || publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }
  return cloudinary.url(publicIdOrUrl, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
    secure: true,
  });
}
