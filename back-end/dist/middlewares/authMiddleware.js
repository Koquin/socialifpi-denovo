"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticarToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = 'segredo_super_secreto';
const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        console.warn('Authentication Warning: Token not provided in request header.');
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.usuarioId = payload.id;
        console.log(`Authentication Success: Token for user ID ${req.usuarioId} verified.`);
        next();
    }
    catch (err) { // Type 'any' for the error object to easily access its properties
        // Log the specific error that occurred during token verification
        console.error('Authentication Error: Token verification failed.');
        console.error('Error Details:', err.name, ' - ', err.message);
        // More specific error handling based on JWT error types
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ mensagem: 'Token expirado', erro: err.message });
        }
        else if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ mensagem: 'Token inválido', erro: err.message });
        }
        else {
            // Catch any other unexpected errors
            return res.status(500).json({ mensagem: 'Erro de autenticação interno', erro: err.message });
        }
    }
};
exports.autenticarToken = autenticarToken;
//# sourceMappingURL=authMiddleware.js.map