
const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  deleteJob,
  matchResumeWithJob,
  getJobMatches,
} = require("../controllers/jobController");

const { getRecommendedJobs } = require("../controllers/jobRecommendationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createJob);

router.get("/", protect, getJobs);

router.get("/recommended/:resumeId", protect, getRecommendedJobs);

router.get("/:id", protect, getJobById);

router.delete("/:id", protect, deleteJob);

router.post("/:jobId/match/:resumeId", protect, matchResumeWithJob);

router.get("/:jobId/matches", protect, getJobMatches);

module.exports = router;