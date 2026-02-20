import { Request, Response, NextFunction } from 'express';
import * as resourceService from '../services/resource.service';
import { AppError } from '../utils/errors';

export async function createFlashcardSet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const courseId = req.params.courseId as string;
    const { title, examTag, flashcards } = req.body;

    const resource = await resourceService.createFlashcardSet({
      userId,
      courseId,
      title,
      examTag,
      flashcards,
    });

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
}

export async function getFlashcardSet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const resourceId = req.params.resourceId as string;
    const userId = req.user?.id;

    const resource = await resourceService.getFlashcardSet(resourceId, userId);

    res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
}

export async function listFlashcardSets(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.courseId as string;
    const examTag = req.query.examTag as string | undefined;
    const sort = req.query.sort as 'popular' | 'recent' | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const userId = req.user?.id;

    const result = await resourceService.listFlashcardSets({
      courseId,
      examTag,
      sort,
      page,
      limit,
      userId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateFlashcardSet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const resourceId = req.params.resourceId as string;
    const { title, examTag, flashcards } = req.body;

    const resource = await resourceService.updateFlashcardSet({
      resourceId,
      userId,
      title,
      examTag,
      flashcards,
    });

    res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
}

export async function deleteFlashcardSet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const resourceId = req.params.resourceId as string;

    const result = await resourceService.deleteFlashcardSet(resourceId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function upvoteResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const resourceId = req.params.resourceId as string;

    const result = await resourceService.upvoteResource(resourceId, userId);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeUpvote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const resourceId = req.params.resourceId as string;

    const result = await resourceService.removeUpvote(resourceId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function incrementUsage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const resourceId = req.params.resourceId as string;

    const result = await resourceService.incrementUsage(resourceId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function uploadNotes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const courseId = req.params.courseId as string;
    const { title, examTag } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400, 'NO_FILES');
    }

    const resource = await resourceService.uploadNotes({
      userId,
      courseId,
      title,
      examTag,
      files,
    });

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
}

export async function listNotes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.courseId as string;
    const examTag = req.query.examTag as string | undefined;
    const sort = req.query.sort as 'popular' | 'recent' | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const userId = req.user?.id;

    const result = await resourceService.listNotes({
      courseId,
      examTag,
      sort,
      page,
      limit,
      userId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}