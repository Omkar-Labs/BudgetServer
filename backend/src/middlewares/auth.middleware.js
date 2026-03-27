import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError  from "../utils/apiError.js";
// res replace with _ because it's not used
export const verifyToken = asyncHandler(async (req,res, next) => {
    // Logic to verify JWT token from request headers or cookies
    // If valid, attach user info to req object and call next()
    // If invalid, throw an error
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     if(!token){
         res.status(401).json(new ApiError(401, "No token provided"));
         return;
     }
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
     const user = await User.findById(decodedToken._id).select("-password -refreshTokens");
     if(!user){
         res.status(401).json(new ApiError(401, "Invalid token"));
         return;
     }
     req.user = user;
     next();
   } 
   catch (error) {
    if(error.name === "TokenExpiredError"){
        res.status(401).json(new ApiError(401, "Access Token expired"));
        return;
    }
     res.status(401).json(new ApiError(401, "Invalid token"));
     return;
   }

});