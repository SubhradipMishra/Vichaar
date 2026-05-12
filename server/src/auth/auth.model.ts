import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IAuth } from "./auth.interface";

const AuthSchema = new Schema<IAuth>(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
            trim: true,
        },

        mobileNumber: {
            type: String,
            required: true,
            trim: true,
        },

        bio: {
            type: String,
            trim: true,
        },

        profileImage: {
            type: String,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        role: {
            type: String,
            enum: ["user", "admin", "superadmin"],
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

AuthSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
});



const AuthModel = model("Auth", AuthSchema);

export default AuthModel;