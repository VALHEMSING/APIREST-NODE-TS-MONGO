import { ERoles } from "@enums/role.enum";
import { Document } from "mongoose";


export interface IUser extends Document {
    
    documento:string
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    estado?: boolean;
    roles: ERoles[];
    refreshToken?: string
}