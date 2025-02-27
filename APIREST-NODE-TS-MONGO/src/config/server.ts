import express, { Application } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { PORT } from "./enviroments";
import connectDB from "./db";


import userRoutes from "@routes/user.routes";
import authRoutes from "@routes/auth.routes";


class Server {
    private app: Application;
    private port: number;
    private apiPaths = {
        users: "/api/users",
        auth: "/api/auth"
    }
  

    constructor(){
        this.app = express()
        this.port = Number(PORT)
        this.app.use(express.json()) // Para que todo lo reciba en formato json
        this.app.use(cookieParser()) // Para que pueda leer las cookies


        // Métodos iniciales
        this.middlewares()
        this.routes()
    }


    routes(){
        this.app.use(this.apiPaths.users, userRoutes, )
        this.app.use(this.apiPaths.auth,  authRoutes,)

    }



    // Middlewares
    middlewares(){
        this.app.use(cors({
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }))

        this.app.use(rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100, // Limite de peticiones
            message: "Has hecho demasiadas peticiones, intenta de nuevo en 15 minutos"
        }))

        this.app.use(morgan("dev"))
    }




    // Método para iniciar el servidor
    async start(){
        // Conectar a la db antes de iniciar el servidor
        await connectDB()
        this.app.listen(this.port, () => {
            console.log(`Server on port ${this.port}`);
        })
    }
}


export default new Server;