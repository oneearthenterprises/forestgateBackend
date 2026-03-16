import express from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.sendForgotOtp);
router.post("/verify-otp", authController.verifyForgotOtp);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-forgot-otp", authController.resendForgotOtp);
router.post("/logout", authController.logoutUser);
router.post("/admin-login", authController.adminLogin);
router.get("/users", authController.getAllUsers);
router.put("/update-user/:id", authController.updateUser);
router.delete("/delete-user/:id", authController.deleteUser);
router.post("/verify-otp-register", authController.verifyOtpRegister);

// Profile routes
router.get("/me", authMiddleware, authController.getProfile);
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profileImage"),
  authController.updateProfile,
);

export default router;
