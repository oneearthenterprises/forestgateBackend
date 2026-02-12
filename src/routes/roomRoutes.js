import express from "express";
import roomController from "../controllers/roomController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Create room route with error handling
router.post("/create-room",
    (req, res, next) => {
        upload.fields([
            { name: "images", maxCount: 10 },
            { name: "videos", maxCount: 5 }
        ])(req, res, (err) => {
            if (err) {
                // Handle multer errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        message: 'File too large. Maximum size is 50MB per file.'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        message: 'Too many files. Maximum 15 files allowed.'
                    });
                }
                return res.status(400).json({
                    message: err.message || 'File upload error'
                });
            }
            next();
        });
    },
    roomController.createRoom
);

// Update room route with error handling
router.put("/update-room/:id",
    (req, res, next) => {
        upload.fields([
            { name: "images", maxCount: 10 },
            { name: "videos", maxCount: 5 }
        ])(req, res, (err) => {
            if (err) {
                // Handle multer errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        message: 'File too large. Maximum size is 50MB per file.'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        message: 'Too many files. Maximum 15 files allowed.'
                    });
                }
                return res.status(400).json({
                    message: err.message || 'File upload error'
                });
            }
            next();
        });
    },
    roomController.updateRoom
);

// Other routes (no file upload, so no error handling needed)
router.get("/rooms", roomController.getAllRooms);
router.get("/room/:id", roomController.getSingleRoom);
router.delete("/delete-room/:id", roomController.deleteRoom);
router.delete("/room/:roomId/image/:imageId", roomController.deleteRoomImage);
router.delete("/room/:roomId/video/:videoId", roomController.deleteRoomVideo);

export default router;