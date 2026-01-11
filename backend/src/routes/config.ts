import type { Request, Response } from 'express';
import { getContracts } from '../config/contracts.js';

export function configHandler(req: Request, res: Response) {
  const contracts = getContracts();
  res.json({ contracts });
}