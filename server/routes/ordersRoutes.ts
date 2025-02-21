import express from "express"
import {AuthenticatedUser} from "../middlewares/isAuthenticated";
import { createCheckoutSession, getOrders } from "../controller/orderController";
const router = express.Router();

router.route("/").get(AuthenticatedUser, getOrders);
router.route("/checkout/create-checkout-session").post(AuthenticatedUser, createCheckoutSession);

export default router;