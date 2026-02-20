import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export async function getUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const profile = await userService.getUserProfile(userId);

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

export async function getUserReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const reviews = await userService.getUserReviews(userId);

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}

export async function getUserResources(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const type = req.query.type as 'FLASHCARDS' | 'NOTES' | undefined;

    const resources = await userService.getUserResources({
      userId,
      type,
    });

    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
}

export async function getSavedResources(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const resources = await userService.getSavedResources(userId);

    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
}

export async function getReputationBreakdown(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const breakdown = await userService.getReputationBreakdown(userId);

    res.status(200).json(breakdown);
  } catch (error) {
    next(error);
  }
}

export async function getUserActivityStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const stats = await userService.getUserActivityStats(userId);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

export async function saveResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const resourceId = req.params.resourceId as string;

    const result = await userService.saveResource(resourceId, userId);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function unsaveResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const resourceId = req.params.resourceId as string;

    const result = await userService.unsaveResource(resourceId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}