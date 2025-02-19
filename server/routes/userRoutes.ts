import express from 'express';
import {SignUp} from '../controller/userController';
import {VerifyEmail} from '../controller/userController';
import {Logout} from '../controller/userController';
import {forgetPassword} from '../controller/userController';
import {ResetPassword } from '../controller/userController';
import {ProfileUpdate} from '../controller/userController';
import {AuthenticatedUser} from '../middlewares/isAuthenticated';
const router=express.Router();

router.route("/signup").post(SignUp);
router.route("/Logout").post(Logout);
router.route("/VerifyEmail").post(VerifyEmail);
router.route("/forgetPassword").post(forgetPassword);
router.route("/ResetPassword/:token").post(ResetPassword);
router.route("/ProfileUpdate").put(AuthenticatedUser,ProfileUpdate);