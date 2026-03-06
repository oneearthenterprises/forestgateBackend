import express from "express";
import isAdmin from "../middlewares/adminMiddleware.js";
import authController from "../controllers/authController.js";
const router = express.Router();

router.get("/dashboard", isAdmin, (req, res) => {
    res.json({ message: "Admin access granted" });
});
router.post("/admin-login", authController.adminLogin);

export default router;