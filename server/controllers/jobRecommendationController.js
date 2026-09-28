const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");

const {
  getRecommendedJobs,
} = require("../services/jobRecommendationService");

const getRecommendedJobsForResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    const analysis = await Analysis.findOne({
      resume: resume._id,
      user: req.user._id,
    }).sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(400).json({
        success: false,
        message: "Please analyze this CV before searching for jobs.",
      });
    }

    const jobs = getRecommendedJobs(analysis, 10);

    return res.status(200).json({
      success: true,
      resumeId: resume._id,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("Get recommended jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get recommended jobs.",
    });
  }
};

module.exports = {
  getRecommendedJobs: getRecommendedJobsForResume,
};