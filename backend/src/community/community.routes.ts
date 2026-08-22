import { Router } from 'express';
import { CommunityController } from './community.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.get('/', CommunityController.getPosts);
router.post('/', requireAuth, CommunityController.createPost);
router.delete('/:postId', requireAuth, CommunityController.deletePost);

export default router;
