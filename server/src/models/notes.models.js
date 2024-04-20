import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    content: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bgColor: {
      type: String,
    },
    bgTheme: {
      type: String,
    },
    images: [String], // cloudinary url
    labels: [String],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    reminder: [Date],
    isPinned: {
      type: Boolean,
      default: false,
    },
    formatting: {
      bold: {
        type: Boolean,
        default: false,
      },
      italics: {
        type: Boolean,
        default: false,
      },
      underlined: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);
