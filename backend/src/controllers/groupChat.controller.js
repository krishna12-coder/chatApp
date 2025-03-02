import GroupChat from "../models/groupChat.model.js";
import Message from "../models/message.model.js";

export const createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const groupChat = await GroupChat.create({ name, participants });
    res.status(201).json(groupChat);
  } catch (error) {
    res.status(500).json({ error: "Failed to create group chat" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ groupChatId: groupId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    const message = await Message.create({
      senderId: req.user._id,
      groupChatId: groupId,
      text,
      image,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to send group message" });
  }
};