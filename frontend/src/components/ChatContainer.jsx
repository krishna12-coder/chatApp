import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedChat, // Can be a user (for individual) or a group
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      const isGroup = selectedChat.hasOwnProperty("members"); // Detect if it's a group
      getMessages(selectedChat._id, isGroup);
    }

    subscribeToMessages();

    return () =>
      unsubscribeFromMessages(selectedChat?._id, selectedChat.isGroup);
  }, [selectedChat, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isSentByAuthUser = message.senderId === authUser._id;
          const sender = isSentByAuthUser
            ? authUser
            : selectedChat.isGroup
            ? selectedChat.members.find((m) => m._id === message.senderId)
            : selectedChat;

          return (
            <div
              key={message._id}
              className={`chat ${isSentByAuthUser ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={sender?.profilePic || "/avatar.png"}
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                {!isSentByAuthUser && selectedChat.isGroup && (
                  <span className="text-sm font-semibold">
                    {sender?.username}
                  </span>
                )}
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
