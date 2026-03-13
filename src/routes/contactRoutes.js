import express from "express";
import {
  createContext,
  getAllContacts,
  replyToContact,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/create-contact", createContext);
router.get("/contacts", getAllContacts);
router.post("/reply-contact", replyToContact);

export default router;
