import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: "USD"
    },
    avatar: {
        type: String,

    },
    refreshToken: [{
        type: String,
    }]
}, {
    timestamps: true
});



userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        next;
    } catch (error) {
        throw new ApiError(500, "Error hashing password", error);
    }
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, username: this.username, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
    );
}
const User = mongoose.model("User", userSchema);
export { User };