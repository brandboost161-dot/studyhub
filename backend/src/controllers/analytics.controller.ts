import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

export async function getUserStudyStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const stats = await analyticsService.getUserStudyStats(userId);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

export async function getStudyStreak(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const streak = await analyticsService.getStudyStreak(userId);

    res.status(200).json(streak);
  } catch (error) {
    next(error);
  }
}

export async function getWeakAreas(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const weakAreas = await analyticsService.getWeakAreas(userId);

    res.status(200).json(weakAreas);
  } catch (error) {
    next(error);
  }
}

export async function getSchoolLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schoolId = req.user!.schoolId;
    const timeframe = req.query.timeframe as 'week' | 'month' | 'all' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const leaderboard = await analyticsService.getSchoolLeaderboard({
      schoolId,
      timeframe,
      limit,
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    next(error);
  }
}

export async function getCourseInsights(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schoolId = req.user!.schoolId;

    const insights = await analyticsService.getCourseInsights(schoolId);

    res.status(200).json(insights);
  } catch (error) {
    next(error);
  }
}

export async function getUserRank(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const rank = await analyticsService.getUserRank(userId);

    res.status(200).json(rank);
  } catch (error) {
    next(error);
  }
}