import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  submitQuestionOption,
} from "../controllers/questions.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();


router.use(verifyJwt)
// GET all questions, POST a new question, DELETE a question
router
  .route("/")
  .get(getAllQuestions)
  .post(createQuestion)
  .delete(deleteQuestion);

// POST a question option
router.route("/submit").post(submitQuestionOption);

export default router;
