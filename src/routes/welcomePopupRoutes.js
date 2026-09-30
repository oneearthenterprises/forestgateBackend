import express from 'express';
import { getPopupData, updatePopupData, deletePopupImage } from '../controllers/welcomePopupController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getPopupData);
router.put('/', upload.single('image'), updatePopupData);
router.delete('/image', deletePopupImage);

export default router;
