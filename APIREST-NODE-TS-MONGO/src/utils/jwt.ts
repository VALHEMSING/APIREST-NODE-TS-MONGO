import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "@config/enviroments";
import { IUser } from "@interfaces/user.interfaces";
import jwt from "jsonwebtoken";


if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("Faltan variables de entorno para los tokens JWT");
}


// Generar Acces Token
export const generateAccestoken = (user: IUser) => {
    return jwt.sign({id: user._id, role: user.roles}, ACCESS_TOKEN_SECRET, {
        expiresIn: '16m'
    })
}


// Generar Refresh Token
export const generateRefreshToken = (user: IUser) => {
    return jwt.sign({id: user._id, role: user.roles}, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })
}