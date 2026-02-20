import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password, schoolDomain } = req.body;

    const result = await authService.register({
      name,
      email,
      password,
      schoolDomain,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.body;

    const result = await authService.verifyEmail(token);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}