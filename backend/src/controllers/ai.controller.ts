import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service';

export async function generateFlashcards(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sourceText, courseContext, examTag, count } = req.body;

    const result = await aiService.generateFlashcards({
      sourceText,
      courseContext,
      examTag,
      count,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateFlashcardsFromResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const resourceId = req.params.resourceId as string;
    const count = req.body.count;

    const result = await aiService.generateFlashcardsFromResource({
      resourceId,
      count,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateStudyGuide(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { resourceIds, courseContext, examTag } = req.body;

    const result = await aiService.generateStudyGuide({
      resourceIds,
      courseContext,
      examTag,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateQuiz(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { resourceIds, questionCount, difficulty, questionTypes } = req.body;

    const result = await aiService.generateQuiz({
      resourceIds,
      questionCount,
      difficulty,
      questionTypes,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function summarizeNotes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const resourceId = req.params.resourceId as string;
    const { length } = req.body;

    const result = await aiService.summarizeNotes({
      resourceId,
      length,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}