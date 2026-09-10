import express from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import repositoryRoutes from './repositoryRoutes.js';
import { repositoryScansRouter, scansRouter } from './scanRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/repositories', repositoryRoutes);
router.use('/api/repositories/:repoId/scans', repositoryScansRouter);
router.use('/api/scans', scansRouter);

export default router;
