import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroupChat,
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/groupChat.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroupChat);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/send", protectRoute, sendGroupMessage);

export default router;