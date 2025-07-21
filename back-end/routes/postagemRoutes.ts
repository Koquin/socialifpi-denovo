import { Router } from 'express';
import * as postagemController from '../controller/postagemController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', postagemController.getAllPosts);
router.get('/:id', postagemController.getPostById);
router.post('/', autenticarToken, postagemController.createPost);
router.put('/:id', postagemController.updatePost);
router.delete('/:id', postagemController.deletePost);

export default router;
