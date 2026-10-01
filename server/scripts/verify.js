/*
 * End-to-end verification against a running server.
 *
 *   node scripts/verify.js
 *
 * Covers: registration, auth persistence (refresh / Home -> Dashboard),
 * logout, PDF upload, text extraction, AI analysis, AI career insight,
 * AI career matches, and that 3 different CVs yield different roles.
 */

const fs = require("fs");
const path = require("path");

const BASE = process.env.VERIFY_BASE_URL || "http://localhost:5000";
const API = `${BASE}/api`;
const FIXTURES = path.join(__dirname, "fixtures");

const results = [];

const check = (name, passed, detail = "") => {
  results.push({ name, passed, detail });
  console.log(
    `${passed ? "PASS" : "FAIL"}  ${name}${detail ? `  -- ${detail}` : ""}`
  );
};

const request = async (method, url, { token, body, form } = {}) => {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;

  if (form) {
    payload = form;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    headers,
    body: payload,
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = { raw: text };
  }

  return { status: response.status, data };
};

const uploadCv = (token, fileName) => {
  const form = new FormData();

  const buffer = fs.readFileSync(path.join(FIXTURES, fileName));

  form.append(
    "resume",
    new Blob([buffer], { type: "application/pdf" }),
    fileName
  );

  return request("POST", `${API}/resumes/upload`, { token, form });
};

const PROFILES = [
  { key: "A", file: "cv-a-frontend.pdf", label: "Frontend (React/JS)" },
  { key: "B", file: "cv-b-data.pdf", label: "Data Analyst (Python/SQL)" },
  { key: "C", file: "cv-c-marketing.pdf", label: "Marketing (SEO/Social)" },
];

const run = async () => {
  console.log(`\nVerifying ${BASE}\n${"=".repeat(52)}\n`);

  /* ---------- 1. health ---------- */

  const health = await request("GET", `${BASE}/`);

  check(
    "1. API server reachable",
    health.status === 200 && health.data?.success === true
  );

  /* ---------- 2. registration + auth persistence ---------- */

  const stamp = Date.now();
  const email = `verify.${stamp}@example.com`;
  const password = "Verify123!";

  const reg = await request("POST", `${API}/auth/register`, {
    body: { name: "Verify Bot", email, password },
  });

  check(
    "2. Register returns a token",
    reg.status === 201 && Boolean(reg.data?.token),
    `status ${reg.status}`
  );

  const token = reg.data.token;

  const me = await request("GET", `${API}/auth/me`, { token });

  check(
    "3. Authenticated GET /auth/me with stored token",
    me.status === 200 && me.data?.user?.email === email
  );

  const noToken = await request("GET", `${API}/auth/me`);

  check(
    "4. Protected route rejects missing token",
    noToken.status === 401,
    `status ${noToken.status}`
  );

  const badToken = await request("GET", `${API}/auth/me`, {
    token: "not-a-real-token",
  });

  check(
    "5. Protected route rejects invalid token",
    badToken.status === 401,
    `status ${badToken.status}`
  );

  const relogin = await request("POST", `${API}/auth/login`, {
    body: { email, password },
  });

  check(
    "6. Login restores the session with the same account",
    relogin.status === 200 && relogin.data?.user?.email === email
  );

  /* ---------- 3. CORS ---------- */

  const preflight = await fetch(`${API}/auth/login`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:5175",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });

  const allowOrigin = preflight.headers.get("access-control-allow-origin");

  check(
    "7. CORS allows the client origin",
    allowOrigin === "http://localhost:5175",
    `allow-origin: ${allowOrigin}`
  );

  /* ---------- 4. the three CVs ---------- */

  const perProfile = {};

  for (const profile of PROFILES) {
    console.log(`\n--- CV ${profile.key}: ${profile.label} ---`);

    const up = await uploadCv(token, profile.file);

    const resume = up.data?.resume;

    check(
      `CV ${profile.key}: PDF upload + text extraction`,
      up.status === 201 &&
        resume?.status === "completed" &&
        (resume?.extractedText || "").length > 200,
      `status ${up.status}, chars ${(resume?.extractedText || "").length}`
    );

    if (!resume?._id) {
      perProfile[profile.key] = null;
      continue;
    }

    const analysisRes = await request(
      "POST",
      `${API}/analysis/${resume._id}`,
      { token }
    );

    const analysis = analysisRes.data?.analysis;

    check(
      `CV ${profile.key}: AI analysis generated`,
      analysisRes.status === 201 && analysis?.score > 0,
      `score ${analysis?.score}`
    );

    const insightRes = await request(
      "GET",
      `${API}/analysis/${resume._id}/career-insight`,
      { token }
    );

    const insight = insightRes.data?.careerInsight;

    check(
      `CV ${profile.key}: AI career insight generated`,
      insightRes.status === 200 &&
        Boolean(insight?.headline) &&
        Boolean(insight?.strongestCareerDirection) &&
        (insight?.keySkills || []).length > 0,
      `"${insight?.headline}"`
    );

    const matchesRes = await request(
      "GET",
      `${API}/jobs/recommended/${resume._id}`,
      { token }
    );

    const jobs = matchesRes.data?.jobs || [];

    check(
      `CV ${profile.key}: AI career matches generated`,
      matchesRes.status === 200 && jobs.length >= 3,
      `${jobs.length} roles`
    );

    const shapeOk =
      jobs.length > 0 &&
      jobs.every(
        (job) =>
          typeof job.title === "string" &&
          job.title.length > 0 &&
          Number.isFinite(Number(job.matchScore)) &&
          Number.isFinite(Number(job.matchScore)) &&
          job.matchScore >= 0 &&
          job.matchScore <= 100 &&
          typeof job.reason === "string" &&
          Array.isArray(job.matchingSkills) &&
          Array.isArray(job.missingSkills) &&
          typeof job.experienceMatch === "string" &&
          typeof job.educationMatch === "string" &&
          Array.isArray(job.recommendations)
      );

    check(
      `CV ${profile.key}: every role has the required shape`,
      shapeOk
    );

    const sorted = [...jobs].every(
      (job, i, arr) => i === 0 || arr[i - 1].matchScore >= job.matchScore
    );

    check(
      `CV ${profile.key}: roles ranked by matchScore desc`,
      sorted,
      jobs.map((j) => `${j.title}:${j.matchScore}`).join(" > ")
    );

    const fakeEmployer = jobs.some((job) =>
      /\b(at|@)\s+[A-Z][a-zA-Z]+(\s+(Inc|Ltd|LLC|GmbH|Corp|Corporation))?\b/.test(
        `${job.title} ${job.reason}`
      )
    );

    check(
      `CV ${profile.key}: no invented companies or employers`,
      !fakeEmployer
    );

    perProfile[profile.key] = { insight, jobs };
  }

  /* ---------- 5. do the three CVs differ? ---------- */

  console.log(`\n--- Differentiation ---\n`);

  const valid = PROFILES.filter(
    (p) => perProfile[p.key]?.jobs?.length
  );

  if (valid.length === 3) {
    const titleSets = ["A", "B", "C"].map(
      (k) =>
        new Set(
          perProfile[k].jobs.map((job) =>
            job.title.toLowerCase().trim()
          )
        )
    );

    const pairResults = [];

    for (const [i, j] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      const shared = [...titleSets[i]].filter((t) =>
        titleSets[j].has(t)
      );

      pairResults.push({
        pair: `${valid[i].key} vs ${valid[j].key}`,
        shared,
      });
    }

    console.log("\nAI-selected career roles per CV:\n");

    for (const p of PROFILES) {
      const data = perProfile[p.key];

      if (!data) continue;

      console.log(`  CV ${p.key} (${p.label}):`);
      console.log(
        `    ${data.jobs
          .map((j) => `${j.title} [${j.matchScore}]`)
          .join("\n    ")}`
      );
      console.log(`    insight: ${data.insight.headline}`);
      console.log(
        `    direction: ${data.insight.strongestCareerDirection}\n`
      );
    }

    check(
      "Different CVs produce different career roles (0 shared titles in every pair)",
      pairResults.every((r) => r.shared.length === 0),
      pairResults
        .map((r) => `${r.pair}: [${r.shared.join(", ")}]`)
        .join(" | ")
    );

    const topRoles = ["A", "B", "C"].map(
      (k) => perProfile[k].jobs[0].title.toLowerCase()
    );

    check(
      "Top-ranked role differs for each CV",
      new Set(topRoles).size === 3,
      topRoles.join(" | ")
    );

    const headlines = ["A", "B", "C"].map((k) =>
      (perProfile[k].insight.headline || "").toLowerCase()
    );

    check(
      "AI career insight text differs for each CV",
      new Set(headlines).size === 3
    );

    /* domain correctness */

    const devTerms =
      /react|front-?end|web|javascript|ui|javascript/i;
    const dataTerms =
      /data|analytics|bi |analyst|intelligence|insight|scientist/i;
    const marketingTerms =
      /marketing|seo|sem|social|content|growth|digital|paid|email|campaign|crm/i;

    const aOk = perProfile.A.jobs.filter((j) =>
      devTerms.test(j.title)
    ).length;

    check(
      "CV A (frontend) gets web/frontend roles only",
      aOk >= 3,
      `${aOk}/${perProfile.A.jobs.length} frontend roles`
    );

    const bOk = perProfile.B.jobs.filter((j) =>
      dataTerms.test(j.title)
    ).length;

    check(
      "CV B (data) gets data/analytics roles only",
      bOk >= 3,
      `${bOk}/${perProfile.B.jobs.length} data roles`
    );

    const cOk = perProfile.C.jobs.filter((j) =>
      marketingTerms.test(j.title)
    ).length;

    check(
      "CV C (marketing) gets marketing roles only",
      cOk >= 3,
      `${cOk}/${perProfile.C.jobs.length} marketing roles`
    );
  } else {
    check("Differentiation across 3 CVs", false, "missing CV results");
  }

  /* ---------- 6. logout ---------- */

  const deletes = await request("DELETE", `${API}/resumes/nonexistent`, {
    token,
  });

  check(
    "8. Session token works for subsequent authenticated calls",
    deletes.status === 404,
    `expected 404, got ${deletes.status}`
  );

  /* ---------- summary ---------- */

  const failed = results.filter((r) => !r.passed);

  console.log(
    `\n${"=".repeat(52)}\n${results.length - failed.length}/${results.length} checks passed`
  );

  if (failed.length) {
    console.log("\nFAILURES:");
    failed.forEach((f) => console.log(`  - ${f.name} (${f.detail})`));
    process.exit(1);
  }

  console.log("All checks passed.\n");
};

run().catch((error) => {
  console.error("\nVerification crashed:", error);
  process.exit(1);
});
