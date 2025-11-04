import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const payload = { id };
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign(payload, secret, { expiresIn } as any);
};

