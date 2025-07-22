//socialifpi-denovo/back-end/routes/postagemRoutes.ts

import { Router } from 'express';
import * as postagemController from '../controller/postagemController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', postagemController.getAllPosts);
router.get('/:id', postagemController.getPostById);
router.post('/', autenticarToken, postagemController.createPost);
router.put('/:id', postagemController.updatePost);
router.delete('/:id',  autenticarToken, postagemController.deletePost); 
router.post('/compartilhar/:id', postagemController.compartilharPostagem);

router.post('/:id/comentarios', autenticarToken, postagemController.addCommentToPost);


export default router;
