import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Sparkles,
  XCircle,
  Loader2,
  AlertCircle,
  Target,
  GraduationCap,
  Compass,
  Lightbulb,
} from "lucide-react";
import api from "../services/api";

export default function JobDetails() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();

  const [career, setCareer] = useState(
    location.state?.career || null
  );
  const [resumeId, setResumeId] = useState(
    location.state?.resumeId || ""
  );
  const [loading, setLoading] = useState(!career);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCareerDetails = async () => {
      try {
        setLoading(true);
        setError("");

        if (!resumeId) {
          const resumesResponse = await api.get("/resumes");
          const resumes = resumesResponse.data.resumes || [];

          const completedResume = resumes.find(
            (resume) => resume.status === "completed"
          );

          if (!completedResume) {
            throw new Error(
              "Please analyze a CV before viewing career details."
            );
          }

          setResumeId(completedResume._id);
        }

        const response = await api.get(
          `/jobs/recommended/${resumeId}`
        );

        const recommendedCareers = response.data.jobs || [];

        const selectedCareer = recommendedCareers.find(
          (item) =>
            String(item.id || item._id || item.title) ===
            String(decodeURIComponent(jobId))
        );

        if (!selectedCareer) {
          throw new Error(
            "This career role could not be found."
          );
        }

        if (!cancelled) {
          setCareer(selectedCareer);
        }
      } catch (err) {
        console.error("Career details error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load career details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCareerDetails();

    return () => {
      cancelled = true;
    };
  }, [jobId, resumeId]);

  const getScoreStyles = (score) => {
    if (score >= 80) {
      return {
        text: "text-emerald-600",
        background: "bg-emerald-50",
        border: "border-emerald-100",
      };
    }

    if (score >= 60) {
      return {
        text: "text-blue-600",
        background: "bg-blue-50",
        border: "border-blue-100",
      };
    }

    return {
      text: "text-amber-600",
      background: "bg-amber-50",
      border: "border-amber-100",
    };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8FC] px-6 py-10 text-[#0B1220] md:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
              <Loader2
                size={26}
                className="animate-spin"
              />
            </div>

            <h2 className="mt-5 text-lg font-black">
              Loading career details...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Preparing the AI career match information
              for your CV.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !career) {
    return (
      <main className="min-h-screen bg-[#F6F8FC] px-6 py-10 text-[#0B1220] md:px-10">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/job-matcher")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-[#3157D5]"
          >
            <ArrowLeft size={17} />
            Back to Career Matches
          </button>

          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>

            <h1 className="mt-5 text-xl font-black">
              Unable to load this career role
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {error ||
                "The requested career role could not be found."}
            </p>

            <button
              onClick={() => navigate("/job-matcher")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3157D5] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2748B8]"
            >
              <ArrowLeft size={17} />
              Return to Career Matches
            </button>
          </div>
        </div>
      </main>
    );
  }

  const score = Number(career.matchScore || 0);
  const scoreStyles = getScoreStyles(score);

  const matchingSkills = career.matchingSkills || [];
  const missingSkills = career.missingSkills || [];
  const recommendations = career.recommendations || [];

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-6 py-10 text-[#0B1220] md:px-10">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/job-matcher")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-[#3157D5]"
        >
          <ArrowLeft size={17} />
          Back to Career Matches
        </button>

        <section className="overflow-hidden rounded-[2rem] bg-[#0B1220] p-7 text-white shadow-xl md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#3157D5] shadow-lg shadow-[#3157D5]/20">
                <BriefcaseBusiness size={29} />
              </div>

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-[#7FA1FF]">
                  <Target size={14} />
                  Career Role
                </div>

                <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                  {career.title}
                </h1>

                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#7FA1FF]">
                  <Compass size={13} />
                  Selected by AI for this CV
                </p>

                {career.reason && (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    {career.reason}
                  </p>
                )}
              </div>
            </div>

            <div
              className={`shrink-0 rounded-3xl border px-7 py-5 text-center ${scoreStyles.background} ${scoreStyles.border}`}
            >
              <div
                className={`text-4xl font-black ${scoreStyles.text}`}
              >
                {score}%
              </div>

              <div
                className={`mt-1 text-xs font-black uppercase tracking-[0.16em] ${scoreStyles.text}`}
              >
                CV Match
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                <BriefcaseBusiness size={21} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  Experience Match
                </h2>

                <p className="text-xs font-semibold text-slate-400">
                  Compared with your work history
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600">
              {career.experienceMatch ||
                "No experience comparison available."}
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                <GraduationCap size={21} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  Education Match
                </h2>

                <p className="text-xs font-semibold text-slate-400">
                  Degrees and certifications
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600">
              {career.educationMatch ||
                "No education comparison available."}
            </p>
          </section>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  Matching Skills
                </h2>

                <p className="text-xs font-semibold text-slate-400">
                  Skills already found in your CV
                </p>
              </div>
            </div>

            {matchingSkills.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {matchingSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No matching skills were found
                for this career role.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <XCircle size={21} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  Skills to Improve
                </h2>

                <p className="text-xs font-semibold text-slate-400">
                  Needed for this role but missing
                  from your CV
                </p>
              </div>
            </div>

            {missingSkills.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {missingSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} />
                Your CV covers all listed skills
                for this career role.
              </div>
            )}
          </section>
        </div>

        {recommendations.length > 0 && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Lightbulb size={21} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  How To Reach This Role
                </h2>

                <p className="text-xs font-semibold text-slate-400">
                  AI-generated next steps
                </p>
              </div>
            </div>

            <ol className="mt-6 space-y-3">
              {recommendations.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 rounded-2xl bg-[#F8FAFD] p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3157D5] text-[11px] font-black text-white">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-6 text-slate-600">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mt-6 flex flex-col gap-5 rounded-3xl border border-[#DDE6FF] bg-[#EAF0FF] p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <div className="flex items-center gap-2">
              <Target
                size={19}
                className="text-[#3157D5]"
              />

              <h2 className="text-lg font-black text-[#0B1220]">
                Career Match Insight
              </h2>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              The AI read your CV and chose this role, the
              match score reflects your real skills against
              what the role needs.
            </p>
          </div>

          <button
            onClick={() =>
              resumeId &&
              navigate(`/analysis/${resumeId}`)
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#3157D5] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#3157D5]/20 transition hover:bg-[#2748B8]"
          >
            <Sparkles size={17} />
            View My CV Analysis
          </button>
        </section>
      </div>
    </main>
  );
}
