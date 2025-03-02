import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [], // Store groups
  selectedChat: null, // Can be a user or a group
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    try {
      console.log("Fetching users from API..."); // Debugging log
      const res = await axiosInstance.get("/messages/users");
      console.log("Fetched Users:", res.data); // Debugging log
      set({ users: res.data });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  },

  getGroups: async () => {
    try {
      console.log("Fetching Groups...");
      const res = await axiosInstance.get("/messages/groups");
      console.log("Groups Fetched:", res.data);
      set({ groups: res.data });
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  },

  getMessages: async (chatId, isGroup = false) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(
        `/messages/${chatId}?isGroup=${isGroup}`
      );
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedChat, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedChat._id}?isGroup=${selectedChat.isGroup}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: (chatId, isGroup = false) => {
    if (!chatId) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.chatId !== chatId) return; // Ensure message belongs to selected chat

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: (chatId) => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));
