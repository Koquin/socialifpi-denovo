import { Router } from 'express';
import * as usuarioController from '../controller/usuarioController';

const router = Router();

router.post('/login', usuarioController.loginUser);
router.get('/', usuarioController.getAllUsers);
router.get('/:id', usuarioController.getUserById);
router.post('/', usuarioController.createUser);
router.put('/:id', usuarioController.updateUser);
router.delete('/:id', usuarioController.deleteUser);

export default router;