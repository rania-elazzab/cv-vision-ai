const express = require("express");

const {
  analyzeResumeById,
  getAnalysisByResumeId,
  getCareerInsight,
  getCareerMatches,
} = require("../controllers/analysisController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:resumeId/career-insight", protect, getCareerInsight);

router.get("/:resumeId/career-matches", protect, getCareerMatches);

router.post("/:resumeId", protect, analyzeResumeById);

router.get("/:resumeId", protect, getAnalysisByResumeId);

module.exports = router;