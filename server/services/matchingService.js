const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s+#.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .map((item) => toText(item))
      .filter(Boolean)
      .join(" ");
  }

  return String(value);
};

const getArrayItems = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        return Object.values(item)
          .map((part) => toText(part))
          .filter(Boolean)
          .join(" ")
          .trim();
      }

      return "";
    })
    .filter(Boolean);
};

const findMatchingItems = (resumeItems, jobText) => {
  const normalizedJobText = normalizeText(jobText);

  return resumeItems.filter((item) => {
    const normalizedItem = normalizeText(item);

    if (!normalizedItem) {
      return false;
    }

    return normalizedJobText.includes(normalizedItem);
  });
};

const calculateCategoryScore = (matchedCount, totalCount) => {
  if (!totalCount) {
    return 0;
  }

  return Math.round((matchedCount / totalCount) * 100);
};

const calculateJobMatch = ({ analysis, job }) => {
  if (!analysis || !job) {
    throw new Error("Analysis and job are required.");
  }

  const jobText = [
    job.title,
    job.company,
    job.location,
    job.description,
  ]
    .map((value) => toText(value))
    .filter(Boolean)
    .join(" ");

  const normalizedJobText = normalizeText(jobText);

  const resumeSkills = getArrayItems(analysis.skills);
  const resumeExperience = getArrayItems(analysis.experience);
  const resumeEducation = getArrayItems(analysis.education);
  const resumeProjects = getArrayItems(analysis.projects);
  const resumeCertifications = getArrayItems(analysis.certifications);

  const matchingSkills = findMatchingItems(resumeSkills, jobText);

  const missingSkills = [];

  const jobWords = normalizedJobText
    .split(" ")
    .filter((word) => word.length >= 3);

  for (const word of jobWords) {
    const alreadyFound = matchingSkills.some((skill) =>
      normalizeText(skill).includes(word)
    );

    if (!alreadyFound) {
      const looksLikeSkill =
        /^[a-z0-9+#.-]+$/i.test(word) &&
        /[a-z+#]/i.test(word);

      if (looksLikeSkill) {
        missingSkills.push(word);
      }
    }
  }

  const matchingExperience = findMatchingItems(resumeExperience, jobText);

  const missingExperience =
    matchingExperience.length === 0 && resumeExperience.length === 0
      ? ["Relevant professional experience"]
      : [];

  const matchingEducation = findMatchingItems(resumeEducation, jobText);

  const matchingProjects = findMatchingItems(resumeProjects, jobText);

  const matchingCertifications = findMatchingItems(
    resumeCertifications,
    jobText
  );

  const skillsScore = resumeSkills.length
    ? calculateCategoryScore(matchingSkills.length, resumeSkills.length)
    : 0;

  const experienceScore = resumeExperience.length
    ? matchingExperience.length
      ? 100
      : 0
    : 0;

  const educationScore = resumeEducation.length
    ? matchingEducation.length
      ? 100
      : 0
    : 0;

  const projectsScore = resumeProjects.length
    ? matchingProjects.length
      ? 100
      : 0
    : 0;

  const certificationsScore = resumeCertifications.length
    ? matchingCertifications.length
      ? 100
      : 0
    : 0;

  const keywordScore = normalizedJobText
    ? Math.min(
        100,
        Math.round(
          (matchingSkills.length +
            matchingExperience.length +
            matchingEducation.length +
            matchingProjects.length +
            matchingCertifications.length) *
            10
        )
      )
    : 0;

  const overallScore = Math.round(
    skillsScore * 0.4 +
      experienceScore * 0.25 +
      educationScore * 0.1 +
      projectsScore * 0.1 +
      keywordScore * 0.1 +
      certificationsScore * 0.05
  );

  const recommendations = [];

  if (missingSkills.length > 0) {
    recommendations.push(
      `Consider developing skills related to: ${missingSkills
        .slice(0, 8)
        .join(", ")}.`
    );
  }

  if (experienceScore < 50) {
    recommendations.push(
      "Add relevant practical or professional experience when available."
    );
  }

  if (educationScore < 50) {
    recommendations.push(
      "Highlight education that directly relates to the target position."
    );
  }

  if (projectsScore < 50) {
    recommendations.push(
      "Add projects that demonstrate skills required by the job."
    );
  }

  if (certificationsScore < 50 && resumeCertifications.length > 0) {
    recommendations.push(
      "Highlight certifications that are relevant to the target position."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Your CV contains several elements relevant to this job. Review the missing-skill section for further improvements."
    );
  }

  return {
    overallScore,
    matchingSkills,
    missingSkills: [...new Set(missingSkills)].slice(0, 15),
    matchingExperience,
    missingExperience,
    matchingEducation,
    recommendations,
  };
};

module.exports = {
  calculateJobMatch,
};