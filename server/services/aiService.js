const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL =
  process.env.GROQ_FALLBACK_MODEL || "llama-3.3-70b-versatile";

const MAX_CV_CHARS = 14000;

const SYSTEM_IDENTITY = `
You are CVision AI, a senior career advisor and CV analysis engine with
20 years of experience across technology, data, marketing, finance,
engineering, healthcare, education and operations.

Absolute rules:
- Return ONLY valid JSON. Never output Markdown, never add commentary
  outside the JSON object.
- Base every conclusion ONLY on evidence explicitly present in the CV.
- Never invent employers, companies, clients, schools, certifications,
  dates, achievements, projects or job postings.
- Prefer empty strings or empty arrays over guessing.
`;

const truncateCvText = (resumeText) => {
  const text = String(resumeText || "").trim();

  if (text.length <= MAX_CV_CHARS) {
    return text;
  }

  return `${text.slice(0, MAX_CV_CHARS)}\n\n[Content truncated for length]`;
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        return String(item.name || item.skill || item.title || "").trim();
      }

      return "";
    })
    .filter(Boolean);
};

const stripJsonFences = (raw) => {
  let content = String(raw || "").trim();

  content = content.replace(/^```(?:json)?/i, "").trim();
  content = content.replace(/```$/, "").trim();

  return content;
};

const extractJsonObject = (raw) => {
  const content = stripJsonFences(raw);

  try {
    return JSON.parse(content);
  } catch (error) {
    /* fall through to balanced-brace extraction */
  }

  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain a JSON object.");
  }

  return JSON.parse(content.slice(start, end + 1));
};

const requestJson = async ({
  system,
  user,
  maxTokens = 4000,
  temperature = 0.2,
}) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const buildMessages = (content) => [
    { role: "system", content: system },
    { role: "user", content },
  ];

  const callModel = async (model, messages) => {
    const response = await client.chat.completions.create({
      model,
      temperature,
      max_completion_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages,
    });

    return response.choices?.[0]?.message?.content;
  };

  const models = [PRIMARY_MODEL, FALLBACK_MODEL].filter(
    (model, index, list) => model && list.indexOf(model) === index
  );

  let lastError = null;

  for (const model of models) {
    try {
      const content = await callModel(
        model,
        buildMessages(user)
      );

      if (!content) {
        throw new Error("AI returned an empty response.");
      }

      try {
        return extractJsonObject(content);
      } catch (parseError) {
        lastError = parseError;

        const repaired = await callModel(model, [
          ...buildMessages(user),
          {
            role: "assistant",
            content: String(content).slice(0, 3000),
          },
          {
            role: "user",
            content:
              "Your previous reply was not valid JSON. Reply with ONLY the corrected JSON object, no markdown fences and no explanation.",
          },
        ]);

        if (repaired) {
          return extractJsonObject(repaired);
        }

        throw parseError;
      }
    } catch (error) {
      lastError = error;
      console.error(
        `Groq request failed for model ${model}: ${error.message}`
      );
    }
  }

  throw lastError || new Error("AI request failed.");
};

const analyzeResume = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const parsed = await requestJson({
    temperature: 0.1,
    maxTokens: 4500,
    system: `${SYSTEM_IDENTITY}

You extract structured data from CVs.`,
    user: `
Analyze this CV and return JSON using EXACTLY this structure:

{
  "score": 0,
  "profile": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "summary": ""
  },
  "skills": [],
  "experience": [],
  "education": [],
  "certifications": [],
  "languages": [],
  "projects": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "careerInsight": {
    "headline": "",
    "professionalProfile": "",
    "strongestCareerDirection": "",
    "keySkills": [],
    "areasToImprove": [],
    "nextSteps": []
  }
}

FIELD RULES:

score:
- Integer between 0 and 100.
- Judge clarity, completeness, structure, career readiness and evidence quality.
- Do not reward or punish based on information that is absent from the CV.

profile:
- The candidate's real name, email, phone, location and a faithful summary.

skills / certifications / languages / projects / strengths / weaknesses / recommendations:
- Extract or derive ONLY from what the CV actually contains.
- Recommendations must address improving THIS cv.

careerInsight (generate for THIS specific candidate, never reuse generic text):
- headline: one short line naming the professional profile, e.g.
  "Data Analyst with 3 years of SQL and reporting experience".
- professionalProfile: 2-3 sentences describing who this candidate is
  professionally, based only on the CV.
- strongestCareerDirection: the single career field this CV points to
  most strongly. It must fit the CV and must not be a generic default.
- keySkills: 4-8 strongest skills that drive that direction.
- areasToImprove: 3-5 realistic gaps for that direction.
- nextSteps: 3-5 concrete actions to progress in that direction.

CV TEXT:
${truncateCvText(resumeText)}
`,
  });

  return {
    score: Number.isFinite(Number(parsed.score))
      ? Math.min(100, Math.max(0, Math.round(Number(parsed.score))))
      : 0,

    profile: {
      fullName: parsed.profile?.fullName || "",
      email: parsed.profile?.email || "",
      phone: parsed.profile?.phone || "",
      location: parsed.profile?.location || "",
      summary: parsed.profile?.summary || "",
    },

    skills: toStringArray(parsed.skills),
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    certifications: toStringArray(parsed.certifications),
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    strengths: toStringArray(parsed.strengths),
    weaknesses: toStringArray(parsed.weaknesses),
    recommendations: toStringArray(parsed.recommendations),

    careerInsight: normalizeCareerInsight(parsed.careerInsight),
  };
};

const normalizeCareerInsight = (insight) => {
  const source = insight && typeof insight === "object" ? insight : {};

  return {
    headline: String(source.headline || "").trim(),
    professionalProfile: String(source.professionalProfile || "").trim(),
    strongestCareerDirection: String(
      source.strongestCareerDirection || ""
    ).trim(),
    keySkills: toStringArray(source.keySkills),
    areasToImprove: toStringArray(source.areasToImprove),
    nextSteps: toStringArray(source.nextSteps),
  };
};

/*
 * The AI decides which career roles fit this specific CV.
 * There is no fixed or pre-defined role list anywhere in this function.
 */
const generateCareerMatches = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const parsed = await requestJson({
    temperature: 0.3,
    maxTokens: 4500,
    system: `${SYSTEM_IDENTITY}

You are the career matching engine. YOU choose the career roles.

CRITICAL:
- You must derive the roles from THIS CV, not from any preset list.
- Never return the same generic roles for every CV.
- If the CV is a marketing CV, return marketing roles ONLY.
- If the CV is an accounting/finance CV, return accounting/finance roles ONLY.
- If the CV is a data CV, return data/analytics roles ONLY.
- If the CV is a mechanical/field-engineering CV, return engineering roles.
- Roles must be real, commonly recognised job titles.
- Order roles from strongest match to weakest match.`,
    user: `
Read this CV and determine which career roles this person should target.

Return JSON using EXACTLY this structure:

{
  "careerMatches": [
    {
      "title": "",
      "matchScore": 0,
      "reason": "",
      "matchingSkills": [],
      "missingSkills": [],
      "experienceMatch": "",
      "educationMatch": "",
      "recommendations": []
    }
  ]
}

RULES:
- Return between 5 and 8 roles. Every role must be justified by this CV.
- matchScore: integer 0-100, reflecting real fit for THIS candidate.
  The top role for an on-target CV should generally score 70-95.
  Weak or aspirational roles should score much lower (20-55).
- Sort careerMatches by matchScore DESCENDING. No duplicates.
- reason: 2 sentences on why THIS candidate fits THIS role.
- matchingSkills: skills in the CV that support the role (only real ones).
- missingSkills: skills genuinely absent from the CV that the role needs.
- experienceMatch: one sentence comparing the CV's experience to the role.
- educationMatch: one sentence comparing education/certifications.
- recommendations: 3-5 concrete steps to become competitive for the role.
- Do NOT name any company, employer or specific job posting.
  Roles only, never "Frontend Developer at Google".

CV TEXT:
${truncateCvText(resumeText)}
`,
  });

  const roles = Array.isArray(parsed.careerMatches)
    ? parsed.careerMatches
    : Array.isArray(parsed.matches)
      ? parsed.matches
      : Array.isArray(parsed.roles)
        ? parsed.roles
        : [];

  return roles
    .filter((role) => role && typeof role === "object")
    .map((role) => ({
      title: String(role.title || "").trim(),
      matchScore: Number.isFinite(Number(role.matchScore))
        ? Math.min(100, Math.max(0, Math.round(Number(role.matchScore))))
        : 0,
      reason: String(role.reason || "").trim(),
      matchingSkills: toStringArray(role.matchingSkills),
      missingSkills: toStringArray(role.missingSkills),
      experienceMatch: String(role.experienceMatch || "").trim(),
      educationMatch: String(role.educationMatch || "").trim(),
      recommendations: toStringArray(role.recommendations),
    }))
    .filter((role) => role.title)
    .sort((a, b) => b.matchScore - a.matchScore);
};

const generateCareerInsight = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const parsed = await requestJson({
    temperature: 0.4,
    maxTokens: 2500,
    system: SYSTEM_IDENTITY,
    user: `
Write a personalised career insight for this specific candidate.

Return JSON using EXACTLY this structure:

{
  "headline": "",
  "professionalProfile": "",
  "strongestCareerDirection": "",
  "keySkills": [],
  "areasToImprove": [],
  "nextSteps": []
}

RULES:
- Write about THIS candidate only. Never output generic or reusable text.
- headline: one short line naming the professional profile.
- professionalProfile: 2-3 sentences on who they are professionally.
- strongestCareerDirection: the career field this CV points to most
  strongly. It must fit this CV, never a generic default.
- keySkills: 4-8 strongest skills for that direction.
- areasToImprove: 3-5 realistic gaps.
- nextSteps: 3-5 concrete next actions.

CV TEXT:
${truncateCvText(resumeText)}
`,
  });

  return normalizeCareerInsight(
    parsed.careerInsight || parsed.insight || parsed
  );
};

module.exports = {
  analyzeResume,
  generateCareerMatches,
  generateCareerInsight,
  normalizeCareerInsight,
};
