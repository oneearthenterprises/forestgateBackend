import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();


router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.sendForgotOtp);
router.post("/verify-otp", authController.verifyForgotOtp);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-forgot-otp", authController.resendForgotOtp);
router.post("/logout", authController.logoutUser);

export default router;