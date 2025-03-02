import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js"; // Import Group model

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get users for the sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Groups for Sidebar
export const getGroupsForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const groups = await Group.find({ members: loggedInUserId });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroupsForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { groupName, members } = req.body; // Group name and members selected by the user
    const createdBy = req.user._id;

    // Ensure the logged-in user is included as a member
    if (!members.includes(createdBy)) {
      members.push(createdBy);
    }

    // Create a new group document
    const newGroup = new Group({
      groupName,
      members,
      createdBy,
    });

    await newGroup.save();

    // Return the created group details
    res.status(201).json(newGroup);
  } catch (error) {
    console.log("Error in createGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages (supports individual and group chats)
export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { isGroup } = req.query;

    let messages;

    if (isGroup === "true") {
      messages = await Message.find({ groupId: chatId });
    } else {
      const myId = req.user._id;
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: chatId },
          { senderId: chatId, receiverId: myId },
        ],
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send message (supports individual and group chats)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, isGroup } = req.body;
    const { id: chatId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      text,
      image: imageUrl,
    });

    if (isGroup === "true") {
      newMessage.groupId = chatId;
    } else {
      newMessage.receiverId = chatId;
    }

    await newMessage.save();

    // Send message to the correct recipients
    if (isGroup === "true") {
      const group = await Group.findById(chatId).populate("members");
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      group.members.forEach((member) => {
        if (member._id.toString() !== senderId.toString()) {
          const receiverSocketId = getReceiverSocketId(member._id);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
          }
        }
      });
    } else {
      const receiverSocketId = getReceiverSocketId(chatId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
