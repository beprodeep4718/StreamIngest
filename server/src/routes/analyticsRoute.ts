import { Router, Request, Response } from 'express';
import { getAnalytics } from '../controllers/analytics.controller';

const router = Router();


router.get("/overview", getAnalytics);

export default router;