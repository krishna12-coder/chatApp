import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios"; // Import axios for API request
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { users, getUsers, getGroups } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getUsers();
    }
  }, [isOpen, getUsers]);

  const handleCreateGroup = async () => {
    if (!groupName || selectedMembers.length === 0) {
      toast.error(
        "Please provide a group name and select at least one member."
      );
      return;
    }

    console.log("Creating Group with Data:", {
      groupName,
      members: selectedMembers,
    });

    try {
      const response = await axiosInstance.post("/messages/create-group", {
        groupName,
        members: selectedMembers,
      });

      console.log("Group Created Successfully:", response.data);

      toast.success("Group created successfully!");
      getGroups(); // Refresh the groups in the sidebar
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h2 className="text-xl font-semibold">Create a New Group</h2>

        <input
          type="text"
          className="input input-bordered mt-2"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="mt-4">
          <h3>Select Members</h3>
          {users.map((user) => (
            <label key={user._id} className="block mt-2">
              <input
                type="checkbox"
                value={user._id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMembers((prev) => [...prev, user._id]);
                  } else {
                    setSelectedMembers((prev) =>
                      prev.filter((id) => id !== user._id)
                    );
                  }
                }}
              />
              {user.fullName}
            </label>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreateGroup}
            disabled={!groupName || selectedMembers.length === 0}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
