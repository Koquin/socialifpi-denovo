import { Request, Response } from 'express';
import * as usuarioRepository from '../repositories/usuarioRepository';
import { ICreateUsuarioDto, IUpdateUsuarioDto } from '../repositories/usuarioRepository';



/// POST /usuarios/login
export const loginUser = async (req: Request, res: Response) => {
    console.log('POST /usuarios/login: Tentativa de login.');
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
        }

        // Busca usuário pelo email 
        const usuario = await usuarioRepository.findByEmail(email);

        if (!usuario) {
            console.log('POST /usuarios/login: Usuário não encontrado.');
            return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
        }

        // Verifica senha (se ainda for texto puro)
        if (usuario.senha !== senha) {
            console.log('POST /usuarios/login: Senha incorreta.');
            return res.status(401).json({ mensagem: 'Senha incorreta.' });
        }

        // Login OK
        console.log('POST /usuarios/login: Login efetuado com sucesso.');
        return res.json({ autenticado: true, mensagem: 'Login efetuado com sucesso.' });

    } catch (error) {
        console.error('POST /usuarios/login: Erro no login:', error);
        return res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
};

// GET /usuarios
export const getAllUsers = async (req: Request, res: Response) => {
    console.log('GET /usuarios: Buscando todos os usuários...');
    try {
        const usuarios = await usuarioRepository.findAll();
        console.log('GET /usuarios: Usuários encontrados:', usuarios.length);
        res.status(200).json(usuarios);
    } catch (error) {
        console.log('GET /usuarios: Erro ao buscar usuários.');
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
};

// GET /usuarios/:id
export const getUserById = async (req: Request, res: Response) => {
    console.log(`GET /usuarios/:id: Buscando usuário com ID: ${req.params.id}`);
    try {
        const usuario = await usuarioRepository.findById(req.params.id as string);
        if (!usuario) {
            console.log('GET /usuarios/:id: Usuário não encontrado.');
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        console.log('GET /usuarios/:id: Usuário encontrado.');
        res.status(200).json(usuario);
    } catch (error) {
        console.log('GET /usuarios/:id: Erro na busca por ID.');
        res.status(500).json({ message: 'Erro ao buscar usuário', error });
    }
};

// POST /usuarios
export const createUser = async (req: Request, res: Response) => {
    console.log('POST /usuarios: Recebida requisição de criação de usuário.');
    try {
        const usuarioData: ICreateUsuarioDto = req.body;
        console.log('Dados recebidos para criação:', usuarioData);
        const novoUsuario = await usuarioRepository.create(usuarioData);
        console.log('POST /usuarios: Usuário criado com sucesso! ID:', novoUsuario._id);
        res.status(201).json(novoUsuario);
    } catch (error) {
        console.log('POST /usuarios: Erro na criação de usuário.');
        res.status(500).json({ message: 'Erro ao criar usuário', error });
    }
};

// PUT /usuarios/:id
export const updateUser = async (req: Request, res: Response) => {
    console.log(`PUT /usuarios/:id: Tentativa de atualização do usuário com ID: ${req.params.id}`);
    try {
        const usuarioData: IUpdateUsuarioDto = req.body;
        console.log('Dados recebidos para atualização:', usuarioData);
        const usuarioAtualizado = await usuarioRepository.update(req.params.id as string, usuarioData);
        if (!usuarioAtualizado) {
            console.log('PUT /usuarios/:id: Usuário não encontrado para atualização.');
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        console.log('PUT /usuarios/:id: Usuário atualizado com sucesso.');
        res.status(200).json(usuarioAtualizado);
    } catch (error) {
        console.log('PUT /usuarios/:id: Erro na atualização de usuário.');
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
};

// DELETE /usuarios/:id
export const deleteUser = async (req: Request, res: Response) => {
    console.log(`DELETE /usuarios/:id: Tentativa de remoção do usuário com ID: ${req.params.id}`);
    try {
        const usuarioRemovido = await usuarioRepository.remove(req.params.id as string);
        if (!usuarioRemovido) {
            console.log('DELETE /usuarios/:id: Usuário não encontrado para remoção.');
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        console.log('DELETE /usuarios/:id: Usuário removido com sucesso.');
        res.status(200).json({ message: 'Usuário removido com sucesso' });
    } catch (error) {
        console.log('DELETE /usuarios/:id: Erro na remoção de usuário.');
        res.status(500).json({ message: 'Erro ao remover usuário', error });
    }
};