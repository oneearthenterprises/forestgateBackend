import express from "express";
import {
  newsletter,
  getNewsletter,
  sendNewsletter,
} from "../controllers/NewslatterController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/newsletteremail", newsletter);
router.get("/getnewsletter", getNewsletter);
router.post("/send", 
    (req, res, next) => {
        upload.fields([
            { name: "images", maxCount: 1 }
        ])(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        message: 'File too large. Maximum size is 50MB per file.'
                    });
                }
                return res.status(400).json({
                    message: err.message || 'File upload error'
                });
            }
            next();
        });
    },
    sendNewsletter
);

export default router;
