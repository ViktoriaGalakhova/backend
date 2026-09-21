import { SessionUser } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      currentUser?: SessionUser | null;
    }
  }
}

export {};
