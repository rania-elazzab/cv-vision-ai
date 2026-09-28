const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    matchingSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    matchingExperience: {
      type: [String],
      default: [],
    },

    missingExperience: {
      type: [String],
      default: [],
    },

    matchingEducation: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Match", matchSchema);