const { Schema, model } = require("mongoose");

const VersionSchema = new Schema(
  {
    _id: { type: String, required: true },
    documentId: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    data: { type: Object, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Version", VersionSchema);
