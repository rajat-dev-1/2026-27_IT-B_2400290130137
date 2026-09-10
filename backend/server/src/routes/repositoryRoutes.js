import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRepository } from '../middleware/authorizeRepository.js';
import { listRepositories, getRepository, getRepositoryFiles, getRepositoryIssues, getRepositoryRecommendations } from '../controllers/repositoryController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { repositoryParamsSchema, issuesQuerySchema } from '../validators/repositoryValidators.js';

const router = Router();

// All repository routes require authentication
router.use(authenticate);

// List and sync all repositories for current user
router.get('/', listRepositories);

// Get a specific repository
router.get('/:repoId', validateRequest({ params: repositoryParamsSchema }), authorizeRepository, getRepository);

// Get files for the latest completed scan
router.get('/:repoId/files', validateRequest({ params: repositoryParamsSchema }), authorizeRepository, getRepositoryFiles);

// Get issues for the latest completed scan
router.get('/:repoId/issues', validateRequest({ params: repositoryParamsSchema, query: issuesQuerySchema }), authorizeRepository, getRepositoryIssues);

// Get recommendations for the latest completed scan
router.get('/:repoId/recommendations', validateRequest({ params: repositoryParamsSchema }), authorizeRepository, getRepositoryRecommendations);

export default router;
