const { Schema, model } = require("mongoose");

const WorkspaceSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, default: "Acme Product Workspace" },
    slug: { type: String, required: true, default: "acme-workspace" },
    ownerId: { type: String, required: true },
    logo: { type: String, default: "" },
    plan: { type: String, default: "pro", enum: ["free", "pro", "business"] },
    storageLimitBytes: { type: Number, default: 21474836480 }, // 20 GB for Pro
    storageUsedBytes: { type: Number, default: 4823449600 }, // ~4.5 GB used
    members: [
      {
        userId: { type: String, required: true },
        name: { type: String },
        email: { type: String },
        avatar: { type: String },
        role: { type: String, default: "editor", enum: ["owner", "admin", "editor", "commenter", "viewer"] },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Workspace", WorkspaceSchema);
