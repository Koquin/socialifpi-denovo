import { Router } from 'express';
import * as postagemController from '../controller/postagemController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', postagemController.getAllPosts);
router.get('/:id', postagemController.getPostById);
router.post('/', autenticarToken, postagemController.createPost);
router.put('/:id', postagemController.updatePost); // Considerar proteger esta rota
router.delete('/:id', autenticarToken, postagemController.deletePost);
router.post('/compartilhar/:id', postagemController.compartilharPostagem); // Considerar proteger esta rota

router.post('/:id/comentarios', autenticarToken, postagemController.addCommentToPost);
router.post('/:id/curtir', autenticarToken, postagemController.toggleLike); // <-- NOVA ROTA PARA CURTIDAS

export default router;