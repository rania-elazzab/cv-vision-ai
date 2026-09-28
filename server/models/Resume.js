const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "uploaded",
        "extracting",
        "analyzing",
        "completed",
        "failed",
      ],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);