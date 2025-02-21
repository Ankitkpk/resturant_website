import express from "express" 
import upload from "../middlewares/multer";
import {AuthenticatedUser} from "../middlewares/isAuthenticated";
import { addMenu, editMenu } from "../controller/menuController";

const router = express.Router();

router.route("/").post(AuthenticatedUser, upload.single("image"), addMenu);
router.route("/:id").put(AuthenticatedUser, upload.single("image"), editMenu);
 
export default router;