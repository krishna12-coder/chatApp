import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  getGroupsForSidebar,
  sendMessage,
  createGroup, // Added createGroup route
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/groups", protectRoute, getGroupsForSidebar); // Get groups for sidebar
router.post("/create-group", protectRoute, createGroup); // POST route to create a group
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
