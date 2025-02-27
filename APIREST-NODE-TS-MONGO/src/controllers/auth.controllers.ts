import { AuthRequest } from "@middlewares/auth.middleware";
import { loginServices, logoutServices } from "@services/auth.services";
import { Request, Response } from "express";


export const loginController = async (req: AuthRequest, res: Response) => {

    try {
        const result = await loginServices(req.body, res);
        res.status(200).json({message: "User logged in", result:result});

        //res.status(200).json({message: "User logged in", token: user.token});

    } catch (error) {
        console.error(`Error en loginController: ${error}`);
        res.status(500).json({message: "Controller: Error al iniciar sesion"});
    }

}


export const logoutController = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id
        if (!user) throw new Error("Usuario no autenticado"); 
        const result = await logoutServices(user, res);

        res.status(200).json(result);
    } catch (error) {
        console.error(`Error en logoutController: ${error}`);
        res.status(500).json({message: "Controller: Error al cerrar sesion"});
    }
}