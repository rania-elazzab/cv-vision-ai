const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");

const { getAiCareerMatches } = require("../services/careerService");

/*
 * Career Matches are decided by Groq from the CV text itself.
 * The AI selects the roles; there is no static role list involved.
 */
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

    if (!resume.extractedText || !resume.extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No CV text is available. Please upload the CV again.",
      });
    }

    const hasAnalysis = await Analysis.exists({
      resume: resume._id,
      user: req.user._id,
    });

    if (!hasAnalysis) {
      return res.status(400).json({
        success: false,
        message:
          "Please analyze this CV before searching for career matches.",
      });
    }

    const jobs = await getAiCareerMatches(resume.extractedText);

    return res.status(200).json({
      success: true,
      resumeId: resume._id,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("Get AI career matches error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to generate AI career matches for this CV.",
    });
  }
};

module.exports = {
  getRecommendedJobs: getRecommendedJobsForResume,
};
