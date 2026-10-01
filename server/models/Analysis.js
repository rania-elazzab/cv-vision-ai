const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    profile: {
      fullName: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      location: {
        type: String,
        default: "",
      },

      summary: {
        type: String,
        default: "",
      },
    },

    skills: [
      {
        name: {
          type: String,
          required: true,
        },

        category: {
          type: String,
          default: "other",
        },

        level: {
          type: String,
          default: "unknown",
        },
      },
    ],

    experience: [
      {
        jobTitle: {
          type: String,
          default: "",
        },

        company: {
          type: String,
          default: "",
        },

        location: {
          type: String,
          default: "",
        },

        startDate: {
          type: String,
          default: "",
        },

        endDate: {
          type: String,
          default: "",
        },

        description: {
          type: String,
          default: "",
        },
      },
    ],

    education: [
      {
        degree: {
          type: String,
          default: "",
        },

        institution: {
          type: String,
          default: "",
        },

        location: {
          type: String,
          default: "",
        },

        startDate: {
          type: String,
          default: "",
        },

        endDate: {
          type: String,
          default: "",
        },
      },
    ],

    certifications: [
      {
        name: {
          type: String,
          default: "",
        },

        issuer: {
          type: String,
          default: "",
        },

        date: {
          type: String,
          default: "",
        },
      },
    ],

    languages: [
      {
        name: {
          type: String,
          required: true,
        },

        level: {
          type: String,
          default: "unknown",
        },
      },
    ],

    projects: [
      {
        name: {
          type: String,
          default: "",
        },

        description: {
          type: String,
          default: "",
        },

        technologies: {
          type: [String],
          default: [],
        },
      },
    ],

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    careerInsight: {
      headline: {
        type: String,
        default: "",
      },

      professionalProfile: {
        type: String,
        default: "",
      },

      strongestCareerDirection: {
        type: String,
        default: "",
      },

      keySkills: {
        type: [String],
        default: [],
      },

      areasToImprove: {
        type: [String],
        default: [],
      },

      nextSteps: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);