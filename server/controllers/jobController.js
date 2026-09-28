const Job = require("../models/Job");
const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");
const Match = require("../models/Match");

const { calculateJobMatch } = require("../services/matchingService");

const createJob = async (req, res) => {
  try {
    const { title, company, location, description, source, url } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Job title and description are required.",
      });
    }

    const job = await Job.create({
      user: req.user._id,
      title: title.trim(),
      company: company?.trim() || "",
      location: location?.trim() || "",
      description: description.trim(),
      source: source?.trim() || "",
      url: url?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully.",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create job.",
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch jobs.",
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get job error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch job.",
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    await Job.deleteOne({ _id: job._id });

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete job.",
    });
  }
};

const matchResumeWithJob = async (req, res) => {
  try {
    const { jobId, resumeId } = req.params;

    const job = await Job.findOne({
      _id: jobId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

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
      return res.status(404).json({
        success: false,
        message: "Please analyze this CV before matching it with a job.",
      });
    }

    const matchResult = calculateJobMatch({
      analysis,
      job,
    });

    const match = await Match.create({
      user: req.user._id,
      resume: resume._id,
      job: job._id,
      overallScore: matchResult.overallScore,
      matchingSkills: matchResult.matchingSkills,
      missingSkills: matchResult.missingSkills,
      matchingExperience: matchResult.matchingExperience,
      missingExperience: matchResult.missingExperience,
      matchingEducation: matchResult.matchingEducation,
      recommendations: matchResult.recommendations,
    });

    return res.status(201).json({
      success: true,
      message: "CV matched with job successfully.",
      match,
    });
  } catch (error) {
    console.error("Match resume with job error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to match CV with job.",
    });
  }
};

const getJobMatches = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    const matches = await Match.find({
      job: job._id,
      user: req.user._id,
    })
      .populate("resume", "originalName status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Get job matches error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch job matches.",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  deleteJob,
  matchResumeWithJob,
  getJobMatches,
};