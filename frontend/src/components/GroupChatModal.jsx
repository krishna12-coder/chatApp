import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const GroupChatModal = ({ onClose }) => {
  const { authUser } = useAuthStore();
  const { createGroupChat } = useChatStore();
  const [name, setName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const handleCreateGroup = async () => {
    if (!name || selectedParticipants.length === 0) {
      alert("Please enter a group name and select participants.");
      return;
    }

    try {
      await createGroupChat(name, selectedParticipants);
      onClose();
    } catch (error) {
      console.error("Failed to create group chat:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Create Group Chat</h2>
        <input
          type="text"
          placeholder="Group Name"
          className="input input-bordered w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="mb-4">
          <h3 className="font-medium mb-2">Select Participants</h3>
          {/* Render list of friends here */}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={handleCreateGroup} className="btn btn-primary">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;