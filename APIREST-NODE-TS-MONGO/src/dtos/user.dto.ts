
import { ERoles } from "@enums/role.enum";
import { IUser } from "@interfaces/user.interfaces";




export interface CreateUserDto extends IUser {
    documento: string;
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    roles: ERoles[]
    refreshToken?: string  
}

export interface UpdateUserDto {
    documento?: string;
    nombres?: string;
    apellidos?: string;
    email?: string;
    password?: string;
    roles?: ERoles[]
    refreshToken?: string
}