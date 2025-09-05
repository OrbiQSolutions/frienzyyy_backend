import jwt from 'jsonwebtoken';

export const generateToken = (payload: object, expiresIn: number = 1000 * 60 * 60 * 24 * 7): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn: expiresIn });
};