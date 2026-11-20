const { Schema, model } = require("mongoose");

const FileAttachmentSchema = new Schema(
  {
    _id: { type: String, required: true },
    documentId: { type: String, default: null },
    workspaceId: { type: String, default: "ws_default" },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: String, default: "Alex Vance" },
    uploadedById: { type: String, default: "usr_admin" },
  },
  { timestamps: true }
);

module.exports = model("FileAttachment", FileAttachmentSchema);
