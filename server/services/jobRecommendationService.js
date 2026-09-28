const fs = require("fs");
const path = require("path");

const jobsPath = path.join(__dirname, "../data/jobs.json");

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s+#.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getAnalysisText = (analysis) => {
  const skills = Array.isArray(analysis?.skills)
    ? analysis.skills
        .map((skill) => {
          if (typeof skill === "string") {
            return skill;
          }

          return skill?.name || "";
        })
        .filter(Boolean)
    : [];

  const experience = Array.isArray(analysis?.experience)
    ? analysis.experience
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return [
            item?.jobTitle,
            item?.description,
          ]
            .filter(Boolean)
            .join(" ");
        })
        .filter(Boolean)
    : [];

  const education = Array.isArray(analysis?.education)
    ? analysis.education
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return [
            item?.degree,
            item?.institution,
          ]
            .filter(Boolean)
            .join(" ");
        })
        .filter(Boolean)
    : [];

  return {
    skills,
    experience,
    education,
  };
};

const calculateCareerRelevance = (career, analysis) => {
  const { skills, experience, education } = getAnalysisText(analysis);

  const resumeSkills = skills
    .map(normalizeText)
    .filter(Boolean);

  const careerSkills = Array.isArray(career.skills)
    ? career.skills
        .map(normalizeText)
        .filter(Boolean)
    : [];

  const matchingSkills = careerSkills.filter((careerSkill) =>
    resumeSkills.some(
      (resumeSkill) =>
        resumeSkill === careerSkill ||
        resumeSkill.includes(careerSkill) ||
        careerSkill.includes(resumeSkill)
    )
  );

  const missingSkills = careerSkills.filter(
    (careerSkill) => !matchingSkills.includes(careerSkill)
  );

  const resumeText = normalizeText(
    [
      ...skills,
      ...experience,
      ...education,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const careerText = normalizeText(
    [
      career.title,
      career.description,
      ...careerSkills,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const careerKeywords = careerText
    .split(" ")
    .filter((word) => word.length >= 3);

  const keywordMatches = careerKeywords.filter((word) =>
    resumeText.includes(word)
  );

  const skillScore = careerSkills.length
    ? Math.round(
        (matchingSkills.length / careerSkills.length) * 100
      )
    : 0;

  const keywordScore = careerKeywords.length
    ? Math.min(
        100,
        Math.round(
          (keywordMatches.length / careerKeywords.length) * 100
        )
      )
    : 0;

  const matchScore = Math.round(
    skillScore * 0.8 +
      keywordScore * 0.2
  );

  return {
    id: career.id,
    title: career.title,
    description: career.description,
    matchScore,
    matchingSkills,
    missingSkills,
    totalSkills: careerSkills.length,
  };
};

const getRecommendedJobs = (analysis, limit = 10) => {
  if (!fs.existsSync(jobsPath)) {
    throw new Error("Career roles database file was not found.");
  }

  const jobsData = fs.readFileSync(jobsPath, "utf8");
  const careers = JSON.parse(jobsData);

  if (!Array.isArray(careers)) {
    throw new Error("Career roles database must contain an array.");
  }

  return careers
    .map((career) =>
      calculateCareerRelevance(career, analysis)
    )
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

module.exports = {
  getRecommendedJobs,
};