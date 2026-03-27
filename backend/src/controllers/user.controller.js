
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { uploadFile } from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
import { Otp } from "../models/otp.model.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    // Extract user details from the request body
    // check if user submit empty fields
    //check if user already exists
    //upload avatar and cover image to cloudinary
    //store user in db
    //send response
    const { username, email, password, currency } = req.body;

    if ([username, email, password, currency].some(field => field?.trim() === "")) {
        res.status(400).json(new ApiError(400, "All fields are required"));
        return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(409).json(new ApiError(409, "User with this email already exists"));
        return;
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        res.status(409).json(new ApiError(409, "User with this username already exists"));
        return;
    }

    const avatarFile = req.file ? req.file.path : null;


    if (!avatarFile) {
        res.status(400).json(new ApiError(400, "Avatar image is required"));
        return;
    }

    // Upload files to Cloudinary
    const uploadedAvatar = await uploadFile(avatarFile);


    if (!uploadedAvatar) {
        res.status(500).json(new ApiError(500, "Failed to upload avatar image"));
        return;
    }
    // Create new user
    const newUser = await User.create({
        username,
        email,
        password,
        avatar: uploadedAvatar.url,
        currency
    });


    const user = await User.findById(newUser._id).select("-password -refreshToken");

    if (!user) {
        res.status(500).json(new ApiError(500, "User registration failed"));
        return;
    }

    return res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // Extract login credentials from the request body
    // Validate input
    // Check if user exists
    // Verify password
    // Generate tokens
    //store refresh token in db
    //return cookie and access token
    // Send response
    const { username, password } = req.body;

    if ([username, password].some(field => field?.trim() === "")) {
        res.status(400).json(new ApiError(400, "All fields are required"));
        return;
    }
    const user = await User.findOne({ username });
    if (!user) {
        res.status(404).json(new ApiError(404, "User not found please sign up"));
        return;
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        res.status(401).json(new ApiError(401, "Invalid password"));
        return;
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken.push(refreshToken);
    const len = user.refreshToken.length;
    
    if(len > 3){
        user.refreshToken.shift();
    }
    await user.save({ validateBeforeSave: false });

    const userWithoutPassword = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true, // Set to true in production when using HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "none" // Adjust based on your frontend domain and requirements
    };
    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, { ...options, maxAge: 15 * 60 * 1000 })
        .json(new ApiResponse(200, { user: userWithoutPassword, accessToken }, "Login successful"));
});

const logOutUser = asyncHandler(async (req, res) => {
    // Clear cookies
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshToken: req.cookies.refreshToken } }, { new: true })
        .then(() => {
            return res.status(200)
                .clearCookie("refreshToken")
                .clearCookie("accessToken")
                .json(new ApiResponse(200, {}, "Logged out successfully"));
        })
        .catch((error) => {
            throw new ApiError(500, "Failed to log out");
        });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const newRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!newRefreshToken) {
        res.status(400).json(new ApiError(400, "Refresh token is required"));
        return;
    }
    try {
        const decoded = jwt.verify(newRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if (!user || !user.refreshToken.includes(newRefreshToken)) {
            res.status(401).json(new ApiError(401, "Invalid refresh token, please log in again"));
            return;
        }
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken.push(refreshToken);
        const len = user.refreshToken.length;
        if(len > 3){
            user.refreshToken.shift();
        }
        await user.save({ validateBeforeSave: false });
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: "none"
        };
        return res.status(200)
            .cookie("accessToken", accessToken, {...options, maxAge: 15 * 60 * 1000})
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully"));
    } catch (error) {
        console.log(error)
        if (error.name === "TokenExpiredError") {
            res.status(401).json(new ApiError(401, "Refresh token expired, please log in again"));
            return;
        }
        res.status(401).json(new ApiError(401, "Something went wrong, please try again"));
        return;
    }

});

const generateOtp = asyncHandler(async (req, res) => {
    // extract email 
    // validate email
    // check if user exists
    // generate OTP
    // store OTP in db with expiration time
    // send OTP to user's email
    const { email } = req.body;
    if (!email || email.trim() === "") {
        res.status(400).json(new ApiError(400, "Email is required"));
        return;
    }
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json(new ApiError(404, "User not found , Incorrect email"));
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp });
    // Here you would send the OTP to the user's email using your email service
    // For example: await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);
    const mailoptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
    };
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    transporter.sendMail(mailoptions);
    return res.status(200).json(new ApiResponse(200, {}, "OTP generated and sent to email"));
});

const verifyOtp = asyncHandler(async (req, res) => {
    // extract otp from request body
    // validate otp
    // check if otp exists in db and is not expired
    // if valid, allow user to reset password or perform the intended action
    const { otp, newPassword, confirmPassword } = req.body;
    if (!otp || otp.trim() === "") {
        res.status(400).json(new ApiError(400, "OTP is required"));
        return;
    }
    const otpRecord = await Otp.findOne({ otp });
    if (!otpRecord) {
        res.status(400).json(new ApiError(400, "Invalid OTP"));
        return;
    }
    if (!newPassword || !confirmPassword || newPassword.trim() === "" || confirmPassword.trim() === "") {
        res.status(400).json(new ApiError(400, "New password and confirm password are required"));
        return;
    }
    if (newPassword !== confirmPassword) {
        res.status(400).json(new ApiError(400, "New password and confirm password do not match"));
        return;
    }
    const user = await User.findOne({ email: otpRecord.email });
    if (!user) {
        res.status(404).json(new ApiError(404, "User not found"));
        return;
    }
    user.password = newPassword;
    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id })
    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {
        res.status(404).json(new ApiError(404, "User not found"));
        return;
    }
    return res.status(200).json(new ApiResponse(200, "User profile retrieved successfully", user));
});

export { registerUser, loginUser, logOutUser, refreshAccessToken, generateOtp, verifyOtp, getUserProfile };