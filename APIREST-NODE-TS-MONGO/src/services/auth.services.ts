import { Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { LoginDto } from "@dtos/auth.dto";
import User from "@models/user.model";
import { generateAccestoken, generateRefreshToken } from "@utils/jwt";
import { NODE_ENV } from "@config/enviroments";
import { LoginResponse } from "@interfaces/loginResponse.interfaces";
import { LogoutResponse } from "@interfaces/logoutResponse";



const COOKIE_CONFIG = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
};
const COOKIE_CONFIG_LOGOUT = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 0, 
};

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const loginServices = async (data: LoginDto, res: Response): Promise<LoginResponse> => {
  const { email, password } = data;
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      throw new AuthError("Credenciales incorrectas");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthError("Credenciales incorrectas");
    }

    const accessToken = generateAccestoken(user);
    const refreshToken = generateRefreshToken(user);
    
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accestoken", accessToken, COOKIE_CONFIG);
    res.cookie("refreshToken", refreshToken, COOKIE_CONFIG);
    return { token: accessToken };
  } catch (error) {
    console.error(`Error en loginServices: ${error}`);
    throw new AuthError("Error al iniciar sesión");
  }
}



// En tu función de cierre de sesión (logout)
export const logoutServices = async (userId: string, res: Response): Promise<LogoutResponse> => {
  try {
    const user = await User.findByIdAndUpdate(
      userId, 
      { refreshToken: "" }, 
      { new: true }
    ).exec();
    if (!user) throw new AuthError("Usuario no encontrado");
  
    res.clearCookie("accestoken")
    // Eliminar la cookie de refresco
    res.clearCookie("refreshToken");
    
    return { message: "Sesión cerrada" };
  } catch (error) {
    console.error(`Error en logoutServices: ${error}`);
    throw new AuthError("Error al cerrar sesión");
  }
}

