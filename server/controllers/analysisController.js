const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");

const {
  analyzeResume,
  generateCareerMatches,
  generateCareerInsight,
  normalizeCareerInsight,
} = require("../services/aiService");

const analyzeResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
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
        message: "No extracted text is available for this CV.",
      });
    }

    resume.status = "analyzing";
    await resume.save();

    const analysisData = await analyzeResume(resume.extractedText);

    if (!analysisData || typeof analysisData !== "object") {
      resume.status = "failed";
      await resume.save();

      return res.status(502).json({
        success: false,
        message: "AI returned an invalid analysis format.",
      });
    }

    const normalizedSkills = Array.isArray(analysisData.skills)
      ? analysisData.skills.map((skill) => {
          if (typeof skill === "string") {
            return {
              name: skill,
              category: "other",
              level: "unknown",
            };
          }

          return {
            name: skill?.name || "",
            category: skill?.category || "other",
            level: skill?.level || "unknown",
          };
        })
      : [];

    const normalizedExperience = Array.isArray(analysisData.experience)
      ? analysisData.experience.map((item) => ({
          jobTitle: item?.jobTitle || item?.title || "",
          company: item?.company || item?.organization || "",
          location: item?.location || "",
          startDate: item?.startDate || "",
          endDate: item?.endDate || "",
          description:
            item?.description ||
            (Array.isArray(item?.responsibilities)
              ? item.responsibilities.join(" ")
              : item?.responsibilities || ""),
        }))
      : [];

    const normalizedEducation = Array.isArray(analysisData.education)
      ? analysisData.education.map((item) => ({
          degree: item?.degree || "",
          institution: item?.institution || "",
          location: item?.location || "",
          startDate: item?.startDate || "",
          endDate: item?.endDate || "",
        }))
      : [];

    const normalizedCertifications = Array.isArray(
      analysisData.certifications
    )
      ? analysisData.certifications.map((item) => ({
          name:
            typeof item === "string"
              ? item
              : item?.name || "",
          issuer:
            typeof item === "string"
              ? ""
              : item?.issuer || item?.institution || "",
          date:
            typeof item === "string"
              ? ""
              : item?.date || "",
        }))
      : [];

    const normalizedLanguages = Array.isArray(analysisData.languages)
      ? analysisData.languages.map((language) => {
          if (typeof language === "string") {
            return {
              name: language,
              level: "unknown",
            };
          }

          return {
            name:
              language?.name ||
              language?.language ||
              "",
            level:
              language?.level ||
              language?.proficiency ||
              "unknown",
          };
        })
      : [];

    const normalizedProjects = Array.isArray(analysisData.projects)
      ? analysisData.projects.map((project) => ({
          name:
            typeof project === "string"
              ? project
              : project?.name || "",
          description:
            typeof project === "string"
              ? ""
              : project?.description || "",
          technologies: Array.isArray(project?.technologies)
            ? project.technologies
            : [],
        }))
      : [];

    const analysis = await Analysis.create({
      resume: resume._id,
      user: req.user._id,

      score: Number.isFinite(Number(analysisData.score))
        ? Math.min(
            100,
            Math.max(0, Math.round(Number(analysisData.score)))
          )
        : 0,

      profile: {
        fullName: analysisData.profile?.fullName || "",
        email: analysisData.profile?.email || "",
        phone: analysisData.profile?.phone || "",
        location: analysisData.profile?.location || "",
        summary: analysisData.profile?.summary || "",
      },

      skills: normalizedSkills,
      experience: normalizedExperience,
      education: normalizedEducation,
      certifications: normalizedCertifications,
      languages: normalizedLanguages,
      projects: normalizedProjects,

      strengths: Array.isArray(analysisData.strengths)
        ? analysisData.strengths
        : [],

      weaknesses: Array.isArray(analysisData.weaknesses)
        ? analysisData.weaknesses
        : [],

      recommendations: Array.isArray(analysisData.recommendations)
        ? analysisData.recommendations
        : [],

      careerInsight: normalizeCareerInsight(
        analysisData.careerInsight
      ),
    });

    resume.status = "completed";
    await resume.save();

    return res.status(201).json({
      success: true,
      message: "CV analyzed successfully.",
      analysis,
    });
  } catch (error) {
    console.error("Analyze resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze CV.",
    });
  }
};

const getAnalysisByResumeId = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      resume: req.params.resumeId,
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found.",
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Get analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch analysis.",
    });
  }
};

const getCareerInsight = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
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
        message: "No extracted text is available for this CV.",
      });
    }

    const analysis = await Analysis.findOne({
      resume: resume._id,
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (analysis?.careerInsight) {
      const hasContent = Boolean(
        analysis.careerInsight.professionalProfile ||
          analysis.careerInsight.strongestCareerDirection ||
          analysis.careerInsight.headline
      );

      if (hasContent) {
        return res.status(200).json({
          success: true,
          resumeId: resume._id,
          careerInsight: analysis.careerInsight,
          source: "analysis",
        });
      }
    }

    const careerInsight = await generateCareerInsight(
      resume.extractedText
    );

    if (analysis) {
      await Analysis.updateOne(
        { _id: analysis._id },
        { $set: { careerInsight } }
      );
    }

    return res.status(200).json({
      success: true,
      resumeId: resume._id,
      careerInsight,
      source: "generated",
    });
  } catch (error) {
    console.error("Get career insight error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to generate the AI career insight.",
    });
  }
};

/*
 * AI JOB MATCHER
 * Generates career roles specifically from the user's CV.
 */
const getCareerMatches = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
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
        message: "No extracted text is available for this CV.",
      });
    }

    const careerMatches = await generateCareerMatches(
      resume.extractedText
    );

    return res.status(200).json({
      success: true,
      resumeId: resume._id,
      careerMatches,
    });
  } catch (error) {
    console.error("Get career matches error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to generate AI career matches.",
    });
  }
};

module.exports = {
  analyzeResumeById,
  getAnalysisByResumeId,
  getCareerInsight,
  getCareerMatches,
};