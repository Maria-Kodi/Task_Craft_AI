import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include the decoded user info
export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Expect header format: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided, authorization denied' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // Attach userId to the request so controllers can use it
    req.userId = decoded.id;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};