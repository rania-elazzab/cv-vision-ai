const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const analyzeResume = async (resumeText) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    temperature: 0.1,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
You are CVision AI, a professional CV analysis engine.

Your task is to analyze the CV text provided by the user.

IMPORTANT:
- Return ONLY valid JSON.
- Never return Markdown.
- Never return explanations outside JSON.
- Use only information explicitly found in the CV.
- Never invent jobs, skills, education, dates, companies, certificates, projects, languages, or contact information.
- If information is not present, return an empty string or empty array.
- Keep the extracted information accurate and concise.
- The score must be an integer from 0 to 100.
`,
      },
      {
        role: "user",
        content: `
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
  "recommendations": []
}

FIELD RULES:

score:
- Integer between 0 and 100.
- Evaluate the CV based on clarity, completeness, skills, experience, education, projects, certifications, formatting/content quality and career readiness.
- Do not give a score based on information that is not present.

profile:
- Extract the candidate's actual name, email, phone, location and professional summary when available.

skills:
- Extract actual technical, professional and soft skills mentioned in the CV.
- Return an array of strings.

experience:
- Extract actual work experience, internships, freelance work or other professional experience.
- Preserve important details such as job title, company, dates and responsibilities.
- Return an array.

education:
- Extract degrees, schools/universities, fields of study and dates when available.
- Return an array.

certifications:
- Extract certifications, certificates and training mentioned in the CV.
- Return an array.

languages:
- Extract languages and proficiency levels when explicitly mentioned.
- Return an array.

projects:
- Extract projects mentioned in the CV.
- Include project name and relevant description/details when available.
- Return an array.

strengths:
- Identify strengths supported by the CV.
- Return an array of strings.

weaknesses:
- Identify realistic CV/content weaknesses based only on what is present or missing.
- Do not invent personal weaknesses.
- Return an array of strings.

recommendations:
- Give practical recommendations for improving the CV.
- Recommendations may address missing sections, weak descriptions, measurable achievements, keywords, structure, clarity and career presentation.
- Return an array of strings.

CV TEXT:
${resumeText}
`,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response.");
  }

  try {
    const parsed = JSON.parse(content);

    return JSON.stringify({
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

      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications
        : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
    });
  } catch (error) {
    console.error("AI JSON parsing error:", error);
    console.error("Raw AI response:", content);

    throw new Error("AI returned an invalid JSON analysis.");
  }
};

module.exports = {
  analyzeResume,
};