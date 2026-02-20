import { Request, Response, NextFunction } from 'express';
import * as fileService from '../services/file.service';
import * as resourceService from '../services/resource.service';

export async function createNotesResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { courseId, title, examTag } = req.body;

    const resource = await resourceService.createNotesResource({
      userId,
      courseId,
      title,
      examTag,
    });

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
}

export async function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const resourceId = req.params.resourceId as string;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
    }

    const uploadedFile = await fileService.uploadFile({
      resourceId,
      userId,
      file: {
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      },
    });

    res.status(201).json(uploadedFile);
  } catch (error) {
    next(error);
  }
}

export async function deleteFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const fileId = req.params.fileId as string;

    const result = await fileService.deleteFile(fileId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}