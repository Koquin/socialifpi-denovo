import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

export interface AuthenticatedRequest extends Request {
    usuarioId?: string;
}

export const autenticarToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: string };
        req.usuarioId = payload.id;
        next();
    } catch (err) {
        return res.status(403).json({ mensagem: 'Token inválido' });
    }
};
