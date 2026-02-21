import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listSchools(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json(schools);
  } catch (error) {
    next(error);
  }
}