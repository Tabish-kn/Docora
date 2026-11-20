const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    role: { type: String, default: "admin", enum: ["admin", "member", "guest"] },
    twoFactorEnabled: { type: Boolean, default: false },
    bio: { type: String, default: "Product Lead & Workspace Administrator" },
    preferences: {
      theme: { type: String, default: "light", enum: ["light", "dark", "system"] },
      emailNotifications: { type: Boolean, default: true },
      compactView: { type: Boolean, default: false },
      autoSaveIntervalMs: { type: Number, default: 2000 },
    },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
