// Authentication service - handles register, login, email verification
import crypto from 'crypto';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/hash';
import { isValidEduEmail, extractDomain } from '../utils/email-validation';

// ============================================
// REGISTER NEW USER
// ============================================
export async function register(data: {
  name: string;
  email: string;
  password: string;
  schoolDomain: string;
}) {
  const { name, email, password, schoolDomain } = data;

  // Validate .edu email
  if (!isValidEduEmail(email)) {
    throw new AppError(
      'Only .edu email addresses are allowed',
      400,
      'INVALID_EMAIL'
    );
  }

  // Check if email domain matches school domain
  const emailDomain = extractDomain(email);
  if (emailDomain !== schoolDomain.toLowerCase()) {
    throw new AppError(
      'Email domain does not match selected school',
      400,
      'DOMAIN_MISMATCH'
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // Find school by domain
  const school = await prisma.school.findUnique({
    where: { domain: schoolDomain.toLowerCase() },
  });

  if (!school) {
    throw new AppError(
      'School not found. Contact support to add your school.',
      404,
      'SCHOOL_NOT_FOUND'
    );
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate verification token (random 32-byte hex string)
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      schoolId: school.id,
      verificationToken,
      emailVerified: false,
      reputationScore: 0,
    },
    select: {
      id: true,
      name: true,
      email: true,
      schoolId: true,
      emailVerified: true,
      reputationScore: true,
    },
  });

  // TODO: Send verification email (we'll implement this later)
  console.log(`📧 Verification token for ${email}: ${verificationToken}`);

  return {
    user,
    message: 'Registration successful. Please check your email to verify your account.',
  };
}

// ============================================
// LOGIN USER
// ============================================
export async function login(data: { email: string; password: string }) {
  const { email, password } = data;

  // Find user with school info
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    schoolId: user.schoolId,
  });

  // Return user data (without password hash) and token
  const { passwordHash, verificationToken, ...userData } = user;

  return {
    token,
    user: userData,
  };
}

// ============================================
// VERIFY EMAIL
// ============================================
export async function verifyEmail(token: string) {
  // Find user with this verification token
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      emailVerified: true, // Auto-verify .edu emails,
    },
  });

  if (!user) {
    throw new AppError(
      'Invalid or expired verification token',
      400,
      'INVALID_TOKEN'
    );
  }

  // Update user - mark email as verified and clear token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  });

  return {
    message: 'Email verified successfully. You can now login.',
  };
}

   // ============================================
// GET CURRENT USER
// ============================================
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      schoolId: true,
      emailVerified: true,
      reputationScore: true,
      createdAt: true,
      school: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}