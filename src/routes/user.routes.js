import { Router } from "express";
import { getSomeData, googleAuth, googleCallback, googleLogOut } from "../controllers/user.controllers.js";

const router = Router();
router.route('/').get((req, res) => {
    res.send('logged out')
})
router.route('/auth/google').get(googleAuth)
router.route('/auth/call_back').get(googleCallback)
router.route('/auth/get_some_data').get(getSomeData)
router.route('/auth/logOut').get(googleLogOut)





export default router;