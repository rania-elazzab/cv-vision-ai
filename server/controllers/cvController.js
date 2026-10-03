const Resume = require("../models/Resume");
const { extractTextFromFile } = require("../services/documentService");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CV file.",
      });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Uploaded CV file could not be read.",
      });
    }

    let extractedText = "";

    try {
      extractedText = await extractTextFromFile(
        req.file.buffer,
        req.file.mimetype
      );
    } catch (extractionError) {
      console.error("Text extraction error:", extractionError);

      const failedResume = await Resume.create({
        user: req.user._id,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl: "",
        extractedText: "",
        status: "failed",
      });

      return res.status(422).json({
        success: false,
        message: "CV uploaded, but text extraction failed.",
        resume: failedResume,
      });
    }

    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl: "",
      extractedText,
      status: "completed",
    });

    return res.status(201).json({
      success: true,
      message: "CV uploaded and text extracted successfully.",
      resume,
    });
  } catch (error) {
    console.error("Upload resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload CV.",
    });
  }
};

const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    console.error("Get resumes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch CVs.",
    });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch CV.",
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    await Resume.deleteOne({ _id: resume._id });

    return res.status(200).json({
      success: true,
      message: "CV deleted successfully.",
    });
  } catch (error) {
    console.error("Delete resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete CV.",
    });
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
};
