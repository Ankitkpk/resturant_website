import express from "express"
import { createRestaurant, getRestaurant, getRestaurantOrder, getSingleRestaurant, searchRestaurant, updateOrderStatus, updateRestaurant } from "../controller/resturantController";
import upload from "../middlewares/multer";
import {AuthenticatedUser} from '../middlewares/isAuthenticated';

const router = express.Router();

router.route("/").post(AuthenticatedUser, upload.single("imageFile"), createRestaurant);
router.route("/").get(AuthenticatedUser, getRestaurant);
router.route("/").put(AuthenticatedUser, upload.single("imageFile"), updateRestaurant);
router.route("/order").get(AuthenticatedUser,  getRestaurantOrder);
router.route("/order/:orderId/status").put(AuthenticatedUser, updateOrderStatus);
router.route("/search/:searchText").get(AuthenticatedUser, searchRestaurant);
router.route("/:id").get(AuthenticatedUser, getSingleRestaurant);

export default router;
