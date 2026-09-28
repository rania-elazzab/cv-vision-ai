const express = require("express");

const {
  analyzeResumeById,
  getAnalysisByResumeId,
} = require("../controllers/analysisController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:resumeId", protect, analyzeResumeById);

router.get("/:resumeId", protect, getAnalysisByResumeId);

module.exports = router;