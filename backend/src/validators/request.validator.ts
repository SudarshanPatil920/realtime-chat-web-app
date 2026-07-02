import type { NextFunction, Request, Response } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  return next();
};

export const runValidation = (validations: ValidationChain[]) => async (req: Request, res: Response, next: NextFunction) => {
  for (const validation of validations) {
    await validation.run(req);
  }
  validateRequest(req, res, next);
};
