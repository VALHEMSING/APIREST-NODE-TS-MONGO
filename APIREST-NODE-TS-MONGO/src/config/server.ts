import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true, // Habilitar el envío de cookies a través de CORS
        }))
        this.app.use(cookieParser()) // Para que pueda leer las cookies
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


export default Server;