import { ERoles } from "@enums/role.enum";
import { IUser } from "@interfaces/user.interfaces";
import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";


// Definimos el esquema de la colección User
// con los campos name y email
const UserSchema = new Schema<IUser>(
    {
        documento: { 
            type: String, 
            required: true },
        nombres: { 
            type: String, 
            required: true },
        apellidos: { 
            type: String, 
            required: true },
        email: { 
            type: String, 
            required: true },
        password: { 
            type: String, 
            required: true },
        roles: { 
            type: [String], 
            enum:Object.values(ERoles), 
            default: [ERoles.USER] },
        estado:{
            type: Boolean,
            default: true
        },
        refreshToken: {
            type: String, 
            default: ""}
    },
    {
        timestamps: true,
    }
)


UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


export default model<IUser>("User", UserSchema);