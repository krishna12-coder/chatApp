import mongoose from "mongoose";

const groupChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("GroupChat", groupChatSchema);