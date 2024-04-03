import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import validateEmail from  "../validators/email.validator.js"
import validatePhone from "../validators/phone.validator.js"

const validateEmailAndPhone = (email, phone) => {
    const emailValidationResult = validateEmail(email);
    if (emailValidationResult.error) {
      return emailValidationResult;
    }
  
    const phoneValidationResult = validatePhone(phone);
    return phoneValidationResult;
  };
  


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log("user found", user);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: true });
    console.log("user after refreshToken saved", user);
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Error while generating Tokens", error);
    throw new ApiError(500, "Error while generating Tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, phone, password } = req.body;
  
    // Check for empty fields
    if ([username, email, phone, password].some((field) => field.trim() === "")) {
      throw new ApiError(400, "Please fill all the fields");
    }
  
    // Validate email and phone together
    const { error } = validateEmailAndPhone(email, phone);
    if (error) {
      throw new ApiError(400, error.message);
    }
  
    const isUserExist = await User.findOne({ $or: [{ username }, { email }, { phone }] });
    if (isUserExist) {
      throw new ApiError(400, "User already exists");
    }
  
    const user = await User.create({
      username,
      email,
      phone,
      password,
    });
  
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
      throw new ApiError(500, "Error while creating user");
    }
  
    return res.status(200).json(new ApiResponse(201, createdUser, "User created"));
  });
  
  // Combined validation function for email and phone





export {registerUser} ;