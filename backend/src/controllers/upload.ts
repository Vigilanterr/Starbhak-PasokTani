import { v2 as cloudinary } from 'cloudinary';
import { sendSuccess, sendError } from '../utils/response.js';
import type { Context } from 'hono';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return sendError(c, 'No file provided', 400);
    }

    if (!file.type.startsWith('image/')) {
      return sendError(c, 'File must be an image', 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return sendError(c, 'File size must be less than 5MB', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'pasoktani/products',
          public_id: `${file.name}-${Date.now()}`,
          resource_type: 'auto',
          quality: 'auto:good',
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve({
              public_id: result!.public_id,
              secure_url: result!.secure_url,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });

    return sendSuccess(
      c,
      {
        publicId: result.public_id,
        secureUrl: result.secure_url,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return sendError(c, message, 400);
  }
};

export const deleteImage = async (c: Context) => {
  try {
    const publicId = c.req.param('publicId');

    if (!publicId) {
      return sendError(c, 'Public ID is required', 400);
    }

    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          reject(new Error(`Cloudinary delete failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    return sendSuccess(c, null, 'Image deleted successfully');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete image';
    return sendError(c, message, 400);
  }
};
