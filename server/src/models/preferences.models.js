import mongoose, { Schema } from "mongoose";

const viewPreferencesSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    viewMode: {
      type: String,
      enum: ["list", "grid"],
      default: "grid",
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const ViewPreferences = mongoose.model(
  "ViewPreferences",
  viewPreferencesSchema
);
