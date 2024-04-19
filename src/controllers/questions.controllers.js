import { Questions } from "../models/questions.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//for Admin
const createQuestion = asyncHandler(async (req, res) => {
  const { question, options, userDBKey } = req.body;

  if (!userDBKey || !question || !options) {
    return res
      .status(400)
      .json(new ApiError(400, "Please provide all the required fields"));
  }

  try {
    const newQuestion = await Questions.create({
      question,
      options,
      userDBKey,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, newQuestion, "Question created successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Failed to create question"));
  }
});


//for user
const submitQuestionOption = asyncHandler(async (req, res) => {
  console.log("Starting submitQuestionOption function...");

  let { option, userDBKey } = req.body;
  if (userDBKey === 'age' || userDBKey === 'diseasePeriod') {
    option = parseInt(option); // Use parseInt for converting string to integer
}
  // Changed to userDBKey

  if (!option || !userDBKey) { // Changed to userDBKey
    console.log("Missing option or userDBKey in request body.");
    return res
      .status(400)
      .json(new ApiError(400, "Please provide all the required fields"));
  }

  const user = req.user;
  console.log("USER: " + user);

  if (!user) {
    console.log("User not authenticated.");
    return res
      .status(401)
      .json(new ApiError(401, "Please login to submit an option"));
  }

  try {
    console.log("Finding user data...");
    const userData = await User.findById(user._id);

    if (!userData) {
      console.log("User data not found.");
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    console.log("Updating userData...");

    console.log("User data", userData);
    // Assuming userDBKey is a new field, set it directly
    userData[userDBKey] = option; // Changed to userDBKey
    await userData.save();

    console.log("UserData updated successfully.");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userData,
          "userData updated successfully through question"
        )
      );
  } catch (error) {
    console.log("Error caught:", error);
    return res.status(500).json(new ApiError(500, "Internal server error" ));
  }
});

 
  
//for Admin  
const deleteQuestion = asyncHandler(async (req, res) => {

    console.log("body", req.body);
const {id }= req.body || req.params 

console.log("id: " + id);

  if (!id) {
    console.log("i am here")
    return res
      .status(400)
      .json(new ApiError(400, "Please provide a valid question ID"));
  }

  // Assuming Questions is your Mongoose model
  const deletedQuestion = await Questions.findByIdAndDelete(id);

  if (!deletedQuestion) {
    return res.status(404).json(new ApiError(404, "Question not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "", "Question deleted successfully"));
});


//for user
const getAllQuestions = asyncHandler(async (req, res) => {
    try {
      const allQuestions = await Questions.find();
  
      return res.status(200).json(new ApiResponse(200, allQuestions, "All questions retrieved successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, "Failed to fetch questions"));
    }
  });
  

export { createQuestion, submitQuestionOption, deleteQuestion , getAllQuestions};
