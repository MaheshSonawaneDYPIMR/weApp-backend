import { Router } from "express";
import { publishPost } from "../controllers/post.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = new Router();

router.use(verifyJwt);

//routes regarding post

router.route("/").post(upload.single('postPic'), publishPost);

export default router;
