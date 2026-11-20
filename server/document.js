const { Schema, model } = require("mongoose");

const DocumentSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, default: "Untitled Document" },
    data: { type: Object, default: "" },
    ownerId: { type: String, default: "usr_admin" },
    ownerName: { type: String, default: "Alex Vance" },
    ownerEmail: { type: String, default: "alex.vance@docora.internal" },
    workspaceId: { type: String, default: "ws_default" },
    folderId: { type: String, default: null },
    isStarred: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    tags: { type: [String], default: [] },
    icon: { type: String, default: "📄" },
    coverImage: { type: String, default: "" },
    wordCount: { type: Number, default: 0 },
    characterCount: { type: Number, default: 0 },
    sharing: {
      isPublic: { type: Boolean, default: false },
      publicRole: { type: String, default: "viewer", enum: ["viewer", "commenter", "editor"] },
      shareToken: { type: String, default: "" },
      password: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      allowComments: { type: Boolean, default: true },
      allowDownload: { type: Boolean, default: true },
      collaborators: [
        {
          userId: { type: String },
          email: { type: String },
          name: { type: String },
          role: { type: String, default: "editor", enum: ["viewer", "commenter", "editor", "admin"] },
          addedAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = model("Document", DocumentSchema);
