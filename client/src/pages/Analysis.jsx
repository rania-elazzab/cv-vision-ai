import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Languages,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import api from "../services/api";

function ScoreCircle({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[#EAF0FF]">
      <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white shadow-sm">
        <div className="text-center">
          <p className="text-4xl font-black text-[#3157D5]">
            {safeScore}
          </p>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            / 100
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
          <Icon size={21} />
        </div>

        <h2 className="text-lg font-black text-[#0B1220]">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function getText(value, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (!value || typeof value !== "object") {
    return fallback;
  }

  return (
    value.name ||
    value.title ||
    value.description ||
    value.skill ||
    value.language ||
    value.degree ||
    value.field ||
    value.text ||
    fallback
  );
}

function renderList(items, emptyText = "No information detected.") {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <p className="text-sm font-medium text-slate-400">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const text = getText(item);

        return (
          <div
            key={`${text}-${index}`}
            className="flex gap-3 rounded-2xl bg-slate-50 p-4"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-[#3157D5]"
            />

            <p className="text-sm font-medium leading-6 text-slate-600">
              {text || "Information available"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function Analysis() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/analysis/${resumeId}`);

      setAnalysis(response.data?.analysis || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setAnalysis(null);
      } else {
        console.error("Load analysis error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load the CV analysis."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError("");

      const response = await api.post(
        `/analysis/${resumeId}`
      );

      setAnalysis(response.data?.analysis || null);
    } catch (err) {
      console.error("Analyze CV error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to analyze your CV. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!resumeId) {
      setError("CV ID is missing.");
      setLoading(false);
      return;
    }

    loadAnalysis();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-600">
            Loading your CV analysis...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Preparing your AI-powered insights.
          </p>
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] px-5 py-10">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#3157D5]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#0B1220]">
              Analysis failed
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              {error}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3157D5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2648bd] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Try Again
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-cvs")}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-[#3157D5] hover:text-[#3157D5]"
              >
                My CVs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] px-5 py-10">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#3157D5]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0FF] text-[#3157D5]">
              <Sparkles size={27} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#0B1220]">
              Your CV is ready for analysis
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Start the AI analysis to extract your profile,
              skills, experience, education and personalized
              recommendations.
            </p>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={analyzing}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3157D5] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-[#2648bd] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {analyzing ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze My CV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score = Number(analysis.score) || 0;

  const profile = analysis.profile || {};

  const skills = Array.isArray(analysis.skills)
    ? analysis.skills
    : [];

  const experience = Array.isArray(analysis.experience)
    ? analysis.experience
    : [];

  const education = Array.isArray(analysis.education)
    ? analysis.education
    : [];

  const certifications = Array.isArray(
    analysis.certifications
  )
    ? analysis.certifications
    : [];

  const languages = Array.isArray(analysis.languages)
    ? analysis.languages
    : [];

  const projects = Array.isArray(analysis.projects)
    ? analysis.projects
    : [];

  const strengths = Array.isArray(analysis.strengths)
    ? analysis.strengths
    : [];

  const weaknesses = Array.isArray(analysis.weaknesses)
    ? analysis.weaknesses
    : [];

  const recommendations = Array.isArray(
    analysis.recommendations
  )
    ? analysis.recommendations
    : [];

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#3157D5]"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3157D5] text-white shadow-lg shadow-blue-100">
                <Sparkles size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#0B1220]">
                  CV Analysis
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  AI-powered insights from your CV.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3157D5] px-5 py-3 text-sm font-bold text-[#3157D5] transition hover:bg-[#EAF0FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Re-analyzing...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Re-analyze CV
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <ScoreCircle score={score} />

              <h2 className="mt-5 text-xl font-black text-[#0B1220]">
                CV Score
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Overall score based on the content and
                information detected in your CV.
              </p>
            </div>

            <div className="mt-7 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-500">
                  Skills
                </span>

                <span className="font-black text-[#3157D5]">
                  {skills.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-500">
                  Experience
                </span>

                <span className="font-black text-[#3157D5]">
                  {experience.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-500">
                  Education
                </span>

                <span className="font-black text-[#3157D5]">
                  {education.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-500">
                  Projects
                </span>

                <span className="font-black text-[#3157D5]">
                  {projects.length}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
                <User size={21} />
              </div>

              <div>
                <h2 className="text-lg font-black text-[#0B1220]">
                  Candidate Profile
                </h2>

                <p className="text-xs font-medium text-slate-400">
                  Information extracted from your CV
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Full Name
                </p>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  {profile.fullName || "Not detected"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Mail
                    size={15}
                    className="text-[#3157D5]"
                  />

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                </div>

                <p className="mt-2 break-all text-sm font-bold text-slate-700">
                  {profile.email || "Not detected"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Phone
                    size={15}
                    className="text-[#3157D5]"
                  />

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Phone
                  </p>
                </div>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  {profile.phone || "Not detected"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <MapPin
                    size={15}
                    className="text-[#3157D5]"
                  />

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Location
                  </p>
                </div>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  {profile.location || "Not detected"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Professional Summary
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {profile.summary ||
                  "No professional summary was detected in this CV."}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard
            icon={Wrench}
            title="Skills"
          >
            {skills.length === 0 ? (
              <p className="text-sm font-medium text-slate-400">
                No skills were detected.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={`${getText(skill)}-${index}`}
                    className="rounded-full bg-[#EAF0FF] px-3 py-2 text-xs font-bold text-[#3157D5]"
                  >
                    {getText(skill) || "Skill"}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Languages}
            title="Languages"
          >
            {languages.length === 0 ? (
              <p className="text-sm font-medium text-slate-400">
                No languages were detected.
              </p>
            ) : (
              <div className="space-y-3">
                {languages.map((language, index) => (
                  <div
                    key={`${getText(language)}-${index}`}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
                  >
                    <Languages
                      size={18}
                      className="shrink-0 text-[#3157D5]"
                    />

                    <p className="text-sm font-bold text-slate-600">
                      {getText(language) || "Language"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-6">
          <SectionCard
            icon={BriefcaseBusiness}
            title="Experience"
          >
            {experience.length === 0 ? (
              <p className="text-sm font-medium text-slate-400">
                No professional experience was detected.
              </p>
            ) : (
              <div className="space-y-4">
                {experience.map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                      >
                        <p className="text-sm leading-6 text-slate-600">
                          {item}
                        </p>
                      </div>
                    );
                  }

                  const title =
                    item?.title ||
                    item?.jobTitle ||
                    item?.position ||
                    "Experience";

                  const organization =
                    item?.organization ||
                    item?.company ||
                    "";

                  const dates =
                    item?.dates ||
                    [item?.startDate, item?.endDate]
                      .filter(Boolean)
                      .join(" — ");

                  const responsibilities =
                    item?.responsibilities ||
                    item?.description ||
                    "";

                  return (
                    <div
                      key={`${title}-${index}`}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-black text-[#0B1220]">
                            {title}
                          </h3>

                          {organization && (
                            <p className="mt-1 text-sm font-bold text-[#3157D5]">
                              {organization}
                            </p>
                          )}
                        </div>

                        {dates && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-400">
                            {dates}
                          </span>
                        )}
                      </div>

                      {responsibilities && (
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          {responsibilities}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-6">
          <SectionCard
            icon={GraduationCap}
            title="Education"
          >
            {education.length === 0 ? (
              <p className="text-sm font-medium text-slate-400">
                No education information was detected.
              </p>
            ) : (
              <div className="space-y-4">
                {education.map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl bg-slate-50 p-5"
                      >
                        <p className="text-sm leading-6 text-slate-600">
                          {item}
                        </p>
                      </div>
                    );
                  }

                  const degree =
                    item?.degree ||
                    item?.field ||
                    item?.title ||
                    "Education";

                  const institution =
                    item?.institution ||
                    item?.school ||
                    "";

                  const dates =
                    item?.dates ||
                    [item?.startDate, item?.endDate]
                      .filter(Boolean)
                      .join(" — ");

                  return (
                    <div
                      key={`${degree}-${index}`}
                      className="rounded-2xl bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-black text-[#0B1220]">
                            {degree}
                          </h3>

                          {institution && (
                            <p className="mt-1 text-sm font-bold text-[#3157D5]">
                              {institution}
                            </p>
                          )}
                        </div>

                        {dates && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-400">
                            {dates}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard
            icon={Award}
            title="Certifications"
          >
            {certifications.length === 0 ? (
              <p className="text-sm font-medium text-slate-400">
                No certifications were detected.
              </p>
            ) : (
              <div className="space-y-3">
                {certifications.map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <p className="text-sm font-bold text-slate-600">
                          {item}
                        </p>
                      </div>
                    );
                  }

                  const name =
                    item?.name ||
                    item?.title ||
                    "Certification";

                  const issuer =
                    item?.issuer ||
                    item?.institution ||
                    "";

                  const date = item?.date || "";

                  return (
                    <div
                      key={`${name}-${index}`}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <h3 className="font-black text-[#0B1220]">
                        {name}
                      </h3>

                      {issuer && (
                        <p className="mt-1 text-sm font-medium text-[#3157D5]">
                          {issuer}
                        </p>
                      )}

                      {date && (
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {date}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Target}
            title="Projects"
          >
            {projects.length === 0 ? (
              <p className="text-sm font-medium text-slate-400">
                No projects were detected.
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <p className="text-sm leading-6 text-slate-600">
                          {item}
                        </p>
                      </div>
                    );
                  }

                  const name =
                    item?.name ||
                    item?.title ||
                    "Project";

                  const description =
                    item?.description ||
                    "";

                  const technologies = Array.isArray(
                    item?.technologies
                  )
                    ? item.technologies
                    : [];

                  return (
                    <div
                      key={`${name}-${index}`}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <h3 className="font-black text-[#0B1220]">
                        {name}
                      </h3>

                      {description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {description}
                        </p>
                      )}

                      {technologies.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {technologies.map(
                            (technology, technologyIndex) => (
                              <span
                                key={`${technology}-${technologyIndex}`}
                                className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#3157D5]"
                              >
                                {getText(technology)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SectionCard
            icon={CheckCircle2}
            title="Strengths"
          >
            {renderList(
              strengths,
              "No strengths were identified."
            )}
          </SectionCard>

          <SectionCard
            icon={XCircle}
            title="Weaknesses"
          >
            {renderList(
              weaknesses,
              "No weaknesses were identified."
            )}
          </SectionCard>

          <SectionCard
            icon={Lightbulb}
            title="Recommendations"
          >
            {renderList(
              recommendations,
              "No recommendations were generated."
            )}
          </SectionCard>
        </div>

        <div className="mt-6 rounded-3xl border border-[#DCE5FF] bg-gradient-to-r from-[#EAF0FF] to-white p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#3157D5] shadow-sm">
                <Target size={23} />
              </div>

              <div>
                <h2 className="text-lg font-black text-[#0B1220]">
                  Ready to match your CV with jobs?
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  Use your completed CV analysis to discover
                  matching opportunities and identify missing
                  skills.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/job-matcher")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3157D5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2648bd]"
            >
              <Target size={17} />
              Job Matcher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

