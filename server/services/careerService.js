const { generateCareerMatches } = require("./aiService");

const MAX_CAREERS = 8;

const slugify = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
};

const cleanList = (value, limit = 12) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();

  return value
    .map((item) => String(item || "").trim())
    .filter((item) => {
      if (!item) {
        return false;
      }

      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    })
    .slice(0, limit);
};

const clampScore = (value) => {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
};

/*
 * Turns the raw Groq output into the stable contract the frontend consumes.
 * Every field is guaranteed to exist and have the right type.
 */
const normalizeCareerMatches = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return [];
  }

  const seenTitles = new Set();

  return roles
    .map((role) => {
      const title = String(role?.title || "").trim();

      if (!title) {
        return null;
      }

      const titleKey = title.toLowerCase();

      if (seenTitles.has(titleKey)) {
        return null;
      }

      seenTitles.add(titleKey);

      const matchingSkills = cleanList(role.matchingSkills, 10);
      const missingSkills = cleanList(role.missingSkills, 10);

      return {
        id: slugify(title) || `career-${Math.random().toString(36).slice(2, 8)}`,
        title,
        matchScore: clampScore(role.matchScore),
        reason: String(role.reason || "").trim(),
        description: String(role.reason || "").trim(),
        matchingSkills,
        missingSkills,
        experienceMatch: String(role.experienceMatch || "").trim(),
        educationMatch: String(role.educationMatch || "").trim(),
        recommendations: cleanList(role.recommendations, 6),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_CAREERS);
};

/*
 * The Groq model decides the roles. There is no static role list
 * anywhere in this service.
 */
const getAiCareerMatches = async (resumeText) => {
  const roles = await generateCareerMatches(resumeText);

  const normalized = normalizeCareerMatches(roles);

  if (normalized.length === 0) {
    throw new Error(
      "The AI did not return any usable career roles for this CV."
    );
  }

  return normalized;
};

module.exports = {
  getAiCareerMatches,
  normalizeCareerMatches,
};
