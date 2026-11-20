const { Schema, model } = require("mongoose");

const NotificationSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info", enum: ["info", "mention", "comment", "share", "system"] },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = model("Notification", NotificationSchema);
