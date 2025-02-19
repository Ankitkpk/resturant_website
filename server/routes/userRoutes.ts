import express from "express";
import { checkAuth,SignUp,Login,VerifyEmail,forgetPassword,ResetPassword,Logout,ProfileUpdate} from "../controller/userController";
import { AuthenticatedUser} from "../middlewares/isAuthenticated";

const router = express.Router();

router.route("/check-auth").get(AuthenticatedUser, checkAuth);
router.route("/SignUp").post(SignUp);
router.route("/Login").post(Login);
router.route("/Logout").post(Logout);
router.route("/verify-email").post(VerifyEmail);
router.route("/forgetPassword ").post(forgetPassword);
router.route("/reset-password/:token").post(ResetPassword);
router.route("/profile/update").put(AuthenticatedUser,ProfileUpdate);

export default router;