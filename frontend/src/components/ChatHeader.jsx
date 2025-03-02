import { X, Users } from "lucide-react"; // Users icon for group chat
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat } = useChatStore(); // Now it can be a user or a group
  const { onlineUsers } = useAuthStore();

  const isGroupChat = selectedChat?.isGroup;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {isGroupChat ? (
                <Users className="size-10 text-gray-500" /> // Group icon
              ) : (
                <img
                  src={selectedChat?.profilePic || "/avatar.png"}
                  alt={selectedChat?.fullName}
                />
              )}
            </div>
          </div>

          {/* Chat info */}
          <div>
            <h3 className="font-medium">
              {isGroupChat ? selectedChat?.groupName : selectedChat?.fullName}
            </h3>
            {!isGroupChat && (
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedChat?._id) ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedChat(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
