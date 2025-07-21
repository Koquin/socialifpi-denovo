import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'segredo_super_secreto';

export interface AuthenticatedRequest extends Request {
    usuarioId?: string;
}

export const autenticarToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        console.warn('Authentication Warning: Token not provided in request header.');
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: string };
        req.usuarioId = payload.id;
        console.log(`Authentication Success: Token for user ID ${req.usuarioId} verified.`);
        next();
    } catch (err: any) { // Type 'any' for the error object to easily access its properties
        // Log the specific error that occurred during token verification
        console.error('Authentication Error: Token verification failed.');
        console.error('Error Details:', err.name, ' - ', err.message);

        // More specific error handling based on JWT error types
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ mensagem: 'Token expirado', erro: err.message });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ mensagem: 'Token inválido', erro: err.message });
        } else {
            // Catch any other unexpected errors
            return res.status(500).json({ mensagem: 'Erro de autenticação interno', erro: err.message });
        }
    }
};