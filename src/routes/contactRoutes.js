import express from "express";
import contactController from "../controllers/contactController.js";

const router = express.Router();

router.post("/create-contact", contactController.createContext);
router.get("/contacts", contactController.getAllContacts);

export default router;
