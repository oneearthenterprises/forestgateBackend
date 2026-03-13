import express from "express";
import {
  newsletter,
  getNewsletter,
} from "../controllers/NewslatterController.js";
const router = express.Router();

router.post("/newsletteremail", newsletter);
router.get("/getnewsletter", getNewsletter);

export default router;
