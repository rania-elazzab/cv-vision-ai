import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Award,
  Wrench,
} from "lucide-react";
import api from "../services/api";

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-[#0B1220]">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-600">CV Score</span>
        <span className="text-sm font-black text-[#3157D5]">
          {safeScore}/100
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3157D5] to-[#7FA1FF] transition-all duration-700"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function normalizeAnalysis(analysis) {
  if (!analysis) {
    return null;
  }

  return {
    score: Number(analysis.score) || 0,
    skills: Array.isArray(analysis.skills) ? analysis.skills : [],
    experience: Array.isArray(analysis.experience)
      ? analysis.experience
      : [],
    education: Array.isArray(analysis.education)
      ? analysis.education
      : [],
    certifications: Array.isArray(analysis.certifications)
      ? analysis.certifications
      : [],
    languages: Array.isArray(analysis.languages)
      ? analysis.languages
      : [],
    projects: Array.isArray(analysis.projects)
      ? analysis.projects
      : [],
    strengths: Array.isArray(analysis.strengths)
      ? analysis.strengths
      : [],
    weaknesses: Array.isArray(analysis.weaknesses)
      ? analysis.weaknesses
      : [],
    recommendations: Array.isArray(analysis.recommendations)
      ? analysis.recommendations
      : [],
  };
}

function getItemText(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  return (
    item.name ||
    item.title ||
    item.skill ||
    item.language ||
    item.degree ||
    item.description ||
    item.technology ||
    ""
  );
}

export default function Analytics() {
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const resumesResponse = await api.get("/resumes");

        const resumeList = Array.isArray(resumesResponse.data?.resumes)
          ? resumesResponse.data.resumes
          : [];

        setResumes(resumeList);

        const completedResumes = resumeList.filter(
          (resume) =>
            resume.status === "completed" ||
            resume.status === "analyzed"
        );

        const analysisResults = await Promise.all(
          completedResumes.map(async (resume) => {
            try {
              const response = await api.get(
                `/analysis/${resume._id}`
              );

              return {
                resume,
                analysis: normalizeAnalysis(
                  response.data?.analysis
                ),
              };
            } catch (analysisError) {
              console.error(
                `Unable to load analysis for ${resume._id}:`,
                analysisError
              );

              return null;
            }
          })
        );

        setAnalyses(
          analysisResults.filter(
            (item) => item && item.analysis
          )
        );
      } catch (err) {
        console.error("Analytics loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load analytics right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const totalCVs = resumes.length;
    const analyzedCVs = analyses.length;

    const scores = analyses
      .map((item) => Number(item.analysis.score) || 0)
      .filter((score) => score >= 0);

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) /
              scores.length
          )
        : 0;

    const allSkills = analyses.flatMap(
      (item) => item.analysis.skills
    );

    const allExperiences = analyses.flatMap(
      (item) => item.analysis.experience
    );

    const allEducation = analyses.flatMap(
      (item) => item.analysis.education
    );

    const allCertifications = analyses.flatMap(
      (item) => item.analysis.certifications
    );

    const allLanguages = analyses.flatMap(
      (item) => item.analysis.languages
    );

    const allProjects = analyses.flatMap(
      (item) => item.analysis.projects
    );

    return {
      totalCVs,
      analyzedCVs,
      averageScore,
      totalSkills: allSkills.length,
      totalExperience: allExperiences.length,
      totalEducation: allEducation.length,
      totalCertifications: allCertifications.length,
      totalLanguages: allLanguages.length,
      totalProjects: allProjects.length,
    };
  }, [resumes, analyses]);

  const scoreDistribution = useMemo(() => {
    const distribution = {
      excellent: 0,
      good: 0,
      average: 0,
      needsWork: 0,
    };

    analyses.forEach(({ analysis }) => {
      const score = Number(analysis.score) || 0;

      if (score >= 80) {
        distribution.excellent += 1;
      } else if (score >= 65) {
        distribution.good += 1;
      } else if (score >= 50) {
        distribution.average += 1;
      } else {
        distribution.needsWork += 1;
      }
    });

    return distribution;
  }, [analyses]);

  const recentAnalyses = useMemo(() => {
    return [...analyses]
      .sort((a, b) => {
        const dateA = new Date(
          a.analysis.createdAt ||
            a.resume.updatedAt ||
            a.resume.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.analysis.createdAt ||
            b.resume.updatedAt ||
            b.resume.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [analyses]);

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
            Loading your analytics...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            We are preparing your CV insights.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#3157D5]"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <BarChart3 size={26} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#0B1220]">
              Analytics unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              {error}
            </p>

            <Link
              to="/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3157D5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2648bd]"
            >
              <Upload size={17} />
              Analyze a CV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#3157D5]"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3157D5] text-white shadow-lg shadow-blue-100">
                <BarChart3 size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#0B1220]">
                  Analytics
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Understand your CV performance and career profile.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3157D5] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-[#2648bd]"
          >
            <Upload size={18} />
            Analyze New CV
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Total CVs"
            value={stats.totalCVs}
            description="CVs uploaded"
          />

          <StatCard
            icon={CheckCircle2}
            label="Analyzed CVs"
            value={stats.analyzedCVs}
            description="Completed analyses"
          />

          <StatCard
            icon={Target}
            label="Average Score"
            value={`${stats.averageScore}/100`}
            description="Across analyzed CVs"
          />

          <StatCard
            icon={Wrench}
            label="Skills Detected"
            value={stats.totalSkills}
            description="Skills across your CVs"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#0B1220]">
                  CV Score Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Distribution of your analyzed CV scores.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
                <TrendingUp size={21} />
              </div>
            </div>

            {analyses.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <Sparkles
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-bold text-slate-500">
                  No completed CV analysis yet.
                </p>

                <Link
                  to="/upload"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3157D5] px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Upload size={15} />
                  Analyze Your First CV
                </Link>
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">
                      Excellent · 80–100
                    </span>

                    <span className="font-black text-[#3157D5]">
                      {scoreDistribution.excellent}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#3157D5]"
                      style={{
                        width: `${
                          analyses.length
                            ? (scoreDistribution.excellent /
                                analyses.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">
                      Good · 65–79
                    </span>

                    <span className="font-black text-[#3157D5]">
                      {scoreDistribution.good}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#7FA1FF]"
                      style={{
                        width: `${
                          analyses.length
                            ? (scoreDistribution.good /
                                analyses.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">
                      Average · 50–64
                    </span>

                    <span className="font-black text-[#3157D5]">
                      {scoreDistribution.average}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-400"
                      style={{
                        width: `${
                          analyses.length
                            ? (scoreDistribution.average /
                                analyses.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">
                      Needs Work · 0–49
                    </span>

                    <span className="font-black text-[#3157D5]">
                      {scoreDistribution.needsWork}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-300"
                      style={{
                        width: `${
                          analyses.length
                            ? (scoreDistribution.needsWork /
                                analyses.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
                <Target size={21} />
              </div>

              <div>
                <h2 className="font-black text-[#0B1220]">
                  Career Profile
                </h2>

                <p className="text-xs font-medium text-slate-400">
                  Your extracted CV data
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <BriefcaseBusiness
                    size={17}
                    className="text-[#3157D5]"
                  />
                  <span className="text-sm font-semibold text-slate-600">
                    Experience
                  </span>
                </div>

                <span className="font-black text-[#0B1220]">
                  {stats.totalExperience}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <GraduationCap
                    size={17}
                    className="text-[#3157D5]"
                  />
                  <span className="text-sm font-semibold text-slate-600">
                    Education
                  </span>
                </div>

                <span className="font-black text-[#0B1220]">
                  {stats.totalEducation}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Award
                    size={17}
                    className="text-[#3157D5]"
                  />
                  <span className="text-sm font-semibold text-slate-600">
                    Certifications
                  </span>
                </div>

                <span className="font-black text-[#0B1220]">
                  {stats.totalCertifications}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Languages
                    size={17}
                    className="text-[#3157D5]"
                  />
                  <span className="text-sm font-semibold text-slate-600">
                    Languages
                  </span>
                </div>

                <span className="font-black text-[#0B1220]">
                  {stats.totalLanguages}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText
                    size={17}
                    className="text-[#3157D5]"
                  />
                  <span className="text-sm font-semibold text-slate-600">
                    Projects
                  </span>
                </div>

                <span className="font-black text-[#0B1220]">
                  {stats.totalProjects}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0B1220]">
                Recent CV Analyses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest completed CV analyses.
              </p>
            </div>

            <Link
              to="/my-cvs"
              className="text-sm font-bold text-[#3157D5] hover:underline"
            >
              View all CVs
            </Link>
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <FileText
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-bold text-slate-500">
                No analysis history yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Upload a CV and run your first AI analysis.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {recentAnalyses.map(
                ({ resume, analysis }) => {
                  const resumeName =
                    resume.originalName ||
                    resume.filename ||
                    "Untitled CV";

                  const score = Number(analysis.score) || 0;

                  const firstSkill =
                    analysis.skills.length > 0
                      ? getItemText(analysis.skills[0])
                      : "No skills detected";

                  return (
                    <div
                      key={resume._id}
                      className="rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:border-[#7FA1FF] hover:shadow-md"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
                              <FileText size={19} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-black text-[#0B1220]">
                                {resumeName}
                              </h3>

                              <p className="mt-1 truncate text-xs font-medium text-slate-400">
                                {firstSkill}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <ScoreBar score={score} />
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          <Link
                            to={`/analysis/${resume._id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-[#3157D5] hover:text-[#3157D5]"
                          >
                            View Analysis
                          </Link>

                          <Link
                            to="/job-matcher"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3157D5] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2648bd]"
                          >
                            <Target size={16} />
                            Match Jobs
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {analyses.length > 0 && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
                  <Wrench size={21} />
                </div>

                <div>
                  <h2 className="font-black text-[#0B1220]">
                    Skills Snapshot
                  </h2>

                  <p className="text-xs font-medium text-slate-400">
                    Skills detected across your analyses
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {analyses
                  .flatMap((item) => item.analysis.skills)
                  .slice(0, 15)
                  .map((skill, index) => (
                    <span
                      key={`${getItemText(skill)}-${index}`}
                      className="rounded-full bg-[#EAF0FF] px-3 py-2 text-xs font-bold text-[#3157D5]"
                    >
                      {getItemText(skill) || "Skill"}
                    </span>
                  ))}

                {stats.totalSkills === 0 && (
                  <p className="text-sm text-slate-400">
                    No skills detected yet.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
                  <Sparkles size={21} />
                </div>

                <div>
                  <h2 className="font-black text-[#0B1220]">
                    CV Improvement Focus
                  </h2>

                  <p className="text-xs font-medium text-slate-400">
                    Recommendations generated from your CVs
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {analyses
                  .flatMap(
                    (item) => item.analysis.recommendations
                  )
                  .slice(0, 5)
                  .map((recommendation, index) => (
                    <div
                      key={`${getItemText(
                        recommendation
                      )}-${index}`}
                      className="flex gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="mt-0.5 shrink-0 text-[#3157D5]">
                        <CheckCircle2 size={17} />
                      </div>

                      <p className="text-sm font-medium leading-6 text-slate-600">
                        {getItemText(recommendation) ||
                          "Review your CV content and structure."}
                      </p>
                    </div>
                  ))}

                {analyses.flatMap(
                  (item) => item.analysis.recommendations
                ).length === 0 && (
                  <p className="text-sm text-slate-400">
                    No recommendations available yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

