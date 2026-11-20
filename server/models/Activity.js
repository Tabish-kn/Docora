const { Schema, model } = require("mongoose");

const ActivitySchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, default: "ws_default" },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    action: {
      type: String,
      required: true,
      enum: ["created", "edited", "commented", "starred", "shared", "restored", "deleted", "uploaded"],
    },
    targetType: { type: String, required: true, enum: ["document", "folder", "file", "workspace"] },
    targetId: { type: String, required: true },
    targetTitle: { type: String, required: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = model("Activity", ActivitySchema);
