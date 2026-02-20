import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { extractText } from './text-extraction.service';

// For now, we'll store files locally (in production, use S3)
// This is a simplified version - we'll store the buffer as base64
export async function uploadFile(data: {
  resourceId: string;
  userId: string;
  file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  };
}) {
  const { resourceId, userId, file } = data;

  // Verify resource exists and user owns it
  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  if (resource.userId !== userId) {
    throw new AppError(
      'You can only upload files to your own resources',
      403,
      'FORBIDDEN'
    );
  }

  if (resource.type !== 'NOTES') {
    throw new AppError(
      'Can only upload files to NOTES resources',
      400,
      'INVALID_TYPE'
    );
  }

  // Validate file size (10MB max)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new AppError('File too large (max 10MB)', 400, 'FILE_TOO_LARGE');
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(
      'Invalid file type. Only PDF, DOCX, and TXT allowed',
      400,
      'INVALID_FILE_TYPE'
    );
  }

  // Extract text from file
  let extractedText: string | null = null;
  try {
    extractedText = await extractText(file.buffer, file.mimetype);
  } catch (error) {
    console.error('Text extraction failed:', error);
    // Continue anyway - we'll store the file without extracted text
  }

  // In production, upload to S3 and get URL
  // For now, we'll use a placeholder URL
  const fileUrl = `local://${resourceId}/${file.originalname}`;

  // Create file record
  const uploadedFile = await prisma.uploadedFile.create({
    data: {
      resourceId,
      fileName: file.originalname,
      fileUrl,
      extractedText,
      fileSize: file.size,
      mimeType: file.mimetype,
    },
  });

  return uploadedFile;
}

// Delete uploaded file
export async function deleteFile(fileId: string, userId: string) {
  const file = await prisma.uploadedFile.findUnique({
    where: { id: fileId },
    include: {
      resource: true,
    },
  });

  if (!file) {
    throw new AppError('File not found', 404, 'NOT_FOUND');
  }

  if (file.resource.userId !== userId) {
    throw new AppError(
      'You can only delete your own files',
      403,
      'FORBIDDEN'
    );
  }

  // In production, also delete from S3
  await prisma.uploadedFile.delete({
    where: { id: fileId },
  });

  return { message: 'File deleted successfully' };
}