import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const {
      courseId,
      workloadRating,
      difficultyRating,
      overallRating,
      examStyle,
      attendanceRequired,
      reviewText,
    } = req.body;

    const review = await reviewService.createReview({
      userId,
      courseId,
      workloadRating,
      difficultyRating,
      overallRating,
      examStyle,
      attendanceRequired,
      reviewText,
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

export async function listReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.query.courseId as string;
    const sort = req.query.sort as 'helpful' | 'recent' | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const userId = req.user?.id;

    const result = await reviewService.listReviews({
      courseId,
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

export async function getReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const reviewId = req.params.reviewId as string;
    const userId = req.user?.id;

    const review = await reviewService.getReview(reviewId, userId);

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
}

export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const reviewId = req.params.reviewId as string;
    const {
      workloadRating,
      difficultyRating,
      overallRating,
      examStyle,
      attendanceRequired,
      reviewText,
    } = req.body;

    const review = await reviewService.updateReview({
      reviewId,
      userId,
      workloadRating,
      difficultyRating,
      overallRating,
      examStyle,
      attendanceRequired,
      reviewText,
    });

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const reviewId = req.params.reviewId as string;

    const result = await reviewService.deleteReview(reviewId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function voteHelpful(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const reviewId = req.params.reviewId as string;

    const result = await reviewService.voteHelpful(reviewId, userId);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeHelpfulVote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const reviewId = req.params.reviewId as string;

    const result = await reviewService.removeHelpfulVote(reviewId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCourseStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.courseId as string;

    const stats = await reviewService.getCourseStats(courseId);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}