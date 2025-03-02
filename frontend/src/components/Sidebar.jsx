import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal"; // Import CreateGroupModal


const Sidebar = () => {
  const {
    getUsers,
    getGroups, // Fetch groups
    users,
    groups, // Store groups
    selectedChat,
    setSelectedChat,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    getUsers();
    getGroups(); // Fetch groups as well
  }, [getUsers, getGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chats</span>
        </div>

        {/* Create Group Button */}
        <button
          onClick={() => setIsCreateGroupModalOpen(true)} // Open modal on click
          className="btn btn-circle bg-blue-500 text-white"
        >
          <Plus className="size-5 text-white" />
        </button>
      </div>

      {/* Online Users Toggle */}
      <div className="mt-3 hidden lg:flex items-center gap-2 p-5">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm">Show online only</span>
        </label>
        <span className="text-xs text-zinc-500">
          ({onlineUsers.length - 1} online)
        </span>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Group Chats */}
        {groups.length > 0 && (
          <>
            <h4 className="text-sm font-semibold px-5 text-zinc-500">Groups</h4>
            {groups.map((group) => (
              <button
                key={group._id}
                onClick={() => setSelectedChat(group)}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${
                    selectedChat?._id === group._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <Users className="size-12 text-gray-500" /> {/* Group icon */}
                </div>

                {/* Group info */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{group.groupName}</div>
                  <div className="text-sm text-zinc-400">
                    {group.members.length} members
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* Individual Chats */}
        <h4 className="text-sm font-semibold px-5 text-zinc-500 mt-3">
          Contacts
        </h4>
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedChat(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedChat?._id === user._id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
