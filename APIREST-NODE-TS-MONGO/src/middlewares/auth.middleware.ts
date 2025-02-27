import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "@models/user.model";
import { generateAccestoken } from "@utils/jwt";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "@config/enviroments";
import { IUser } from "@interfaces/user.interfaces";

export interface AuthRequest extends Request {
    user?: IUser; // Agregar el usuario autenticado al request
}
export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | any> => {
    try {
        let token: string | undefined;

        // 🔹 Intentar obtener el accessToken desde las cookies o headers
        if (req.cookies?.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // 🔹 Si no hay token y es la ruta de logout, no renovar el token
        if (!token && req.path === "/logout") {
            return next(); // Permitir que se cierre la sesión sin renovar el token
        }

        if (!token) {
            return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
        }

        try {
            // 🔹 Verificar el accessToken
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string };
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Usuario no encontrado." });
            }
            req.user = user;
            return next(); // El accessToken es válido, continuar
        } catch (error: any) {
            // 🔹 Si el accessToken ha expirado, intentar renovarlo con el refreshToken
            if (error.name === "TokenExpiredError") {
                return await handleTokenRenewal(req, res, next);
            }
            throw error; // Otros errores de JWT
        }
    } catch (error: any) {
        console.error(`Error en authMiddleware: ${error.message}`);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido." });
        }
        return res.status(500).json({ message: "Error de autenticación." });
    }
};

// Función para manejar la renovación del accessToken
const handleTokenRenewal = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token no proporcionado." });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string };
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado." });
        }

        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: "Refresh token inválido o expirado." });
        }

        // Generar un nuevo accessToken
        const newAccessToken = generateAccestoken(user);
        req.user = user;

        return res.json({ message: "Token renovado", accessToken: newAccessToken });
    } catch (error: any) {
        console.error(`Error en handleTokenRenewal: ${error.message}`);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Refresh token expirado." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Refresh token inválido." });
        }
        return res.status(500).json({ message: "Error al renovar el token." });
    }
};