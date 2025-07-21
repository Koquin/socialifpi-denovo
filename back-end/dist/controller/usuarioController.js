"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.loginUser = void 0;
const usuarioRepository = __importStar(require("../repositories/usuarioRepository"));
/// POST /usuarios/login
const loginUser = async (req, res) => {
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
    }
    catch (error) {
        console.error('POST /usuarios/login: Erro no login:', error);
        return res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
};
exports.loginUser = loginUser;
// GET /usuarios
const getAllUsers = async (req, res) => {
    console.log('GET /usuarios: Buscando todos os usuários...');
    try {
        const usuarios = await usuarioRepository.findAll();
        console.log('GET /usuarios: Usuários encontrados:', usuarios.length);
        res.status(200).json(usuarios);
    }
    catch (error) {
        console.log('GET /usuarios: Erro ao buscar usuários.');
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
};
exports.getAllUsers = getAllUsers;
// GET /usuarios/:id
const getUserById = async (req, res) => {
    console.log(`GET /usuarios/:id: Buscando usuário com ID: ${req.params.id}`);
    try {
        const usuario = await usuarioRepository.findById(req.params.id);
        if (!usuario) {
            console.log('GET /usuarios/:id: Usuário não encontrado.');
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        console.log('GET /usuarios/:id: Usuário encontrado.');
        res.status(200).json(usuario);
    }
    catch (error) {
        console.log('GET /usuarios/:id: Erro na busca por ID.');
        res.status(500).json({ message: 'Erro ao buscar usuário', error });
    }
};
exports.getUserById = getUserById;
// POST /usuarios
const createUser = async (req, res) => {
    console.log('POST /usuarios: Recebida requisição de criação de usuário.');
    try {
        const usuarioData = req.body;
        console.log('Dados recebidos para criação:', usuarioData);
        const novoUsuario = await usuarioRepository.create(usuarioData);
        console.log('POST /usuarios: Usuário criado com sucesso! ID:', novoUsuario._id);
        res.status(201).json(novoUsuario);
    }
    catch (error) {
        console.log('POST /usuarios: Erro na criação de usuário.');
        res.status(500).json({ message: 'Erro ao criar usuário', error });
    }
};
exports.createUser = createUser;
// PUT /usuarios/:id
const updateUser = async (req, res) => {
    console.log(`PUT /usuarios/:id: Tentativa de atualização do usuário com ID: ${req.params.id}`);
    try {
        const usuarioData = req.body;
        console.log('Dados recebidos para atualização:', usuarioData);
        const usuarioAtualizado = await usuarioRepository.update(req.params.id, usuarioData);
        if (!usuarioAtualizado) {
            console.log('PUT /usuarios/:id: Usuário não encontrado para atualização.');
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        console.log('PUT /usuarios/:id: Usuário atualizado com sucesso.');
        res.status(200).json(usuarioAtualizado);
    }
    catch (error) {
        console.log('PUT /usuarios/:id: Erro na atualização de usuário.');
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
};
exports.updateUser = updateUser;
// DELETE /usuarios/:id
const deleteUser = async (req, res) => {
    console.log(`DELETE /usuarios/:id: Tentativa de remoção do usuário com ID: ${req.params.id}`);
    try {
        const usuarioRemovido = await usuarioRepository.remove(req.params.id);
        if (!usuarioRemovido) {
            console.log('DELETE /usuarios/:id: Usuário não encontrado para remoção.');
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        console.log('DELETE /usuarios/:id: Usuário removido com sucesso.');
        res.status(200).json({ message: 'Usuário removido com sucesso' });
    }
    catch (error) {
        console.log('DELETE /usuarios/:id: Erro na remoção de usuário.');
        res.status(500).json({ message: 'Erro ao remover usuário', error });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=usuarioController.js.map