import { Router, Request, Response } from 'express';
import { getAnalytics } from '../controllers/analytics.controller.js';

const router = Router();


router.get("/overview", getAnalytics);

export default router;