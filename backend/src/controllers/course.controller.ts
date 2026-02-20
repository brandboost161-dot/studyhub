import { Request, Response, NextFunction } from 'express';
import * as courseService from '../services/course.service';

export async function listCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schoolId = req.user!.schoolId;
    const departmentId = req.query.departmentId as string | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const result = await courseService.listCourses({
      schoolId,
      departmentId,
      search,
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCourseDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.courseId as string;
    const userId = req.user?.id;

    const course = await courseService.getCourseDetails({
      courseId,
      userId,
    });

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
}

export async function saveCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const courseId = req.params.courseId as string;

    const result = await courseService.saveCourse(courseId, userId);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function unsaveCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const courseId = req.params.courseId as string;

    const result = await courseService.unsaveCourse(courseId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listDepartments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schoolId = req.user!.schoolId;

    const departments = await courseService.listDepartments(schoolId);

    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
}

export async function getSavedCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    const courses = await courseService.getSavedCourses(userId);

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
}