const { Schema, model } = require("mongoose");

const CommentSchema = new Schema(
  {
    _id: { type: String, required: true },
    documentId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    content: { type: String, required: true },
    highlightedText: { type: String, default: "" },
    position: {
      index: { type: Number, default: 0 },
      length: { type: Number, default: 0 },
    },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: String, default: null },
    replies: [
      {
        _id: { type: String, required: true },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        userAvatar: { type: String, default: "" },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Comment", CommentSchema);
