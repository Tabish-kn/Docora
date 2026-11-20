const { Schema, model } = require("mongoose");

const FolderSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, default: "#7657E8" },
    icon: { type: String, default: "📁" },
    parentId: { type: String, default: null },
    workspaceId: { type: String, default: "ws_default" },
    ownerId: { type: String, default: "usr_admin" },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Folder", FolderSchema);
