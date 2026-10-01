import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Compass,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import api from "../services/api";

export default function CareerInsight() {
  const navigate = useNavigate();

  const [careerInsight, setCareerInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCareerInsight = async () => {
      try {
        setLoading(true);
        setError("");

        // Get all CVs belonging to the logged-in user
        const resumesResponse = await api.get("/resumes");
        const resumes = resumesResponse.data?.resumes || [];

        // Keep only completed CVs
        const completedResumes = resumes.filter(
          (resume) => resume.status === "completed"
        );

        // No completed CV
        if (completedResumes.length === 0) {
          if (!cancelled) {
            setError(
              "You need to analyze a CV first before generating your career insight."
            );
          }

          return;
        }

        // The API already sorts CVs from newest to oldest.
        // Therefore the first completed CV is the latest completed CV.
        const latestResume = completedResumes[0];

        console.log(
          "Career Insight using CV:",
          latestResume._id,
          latestResume.originalName
        );

        // Generate/load AI career insight for the latest completed CV
        const insightResponse = await api.get(
          `/analysis/${latestResume._id}/career-insight`
        );

        if (!cancelled) {
          const insight =
            insightResponse.data?.careerInsight || null;

          if (!insight) {
            setError(
              "The AI career insight could not be generated for this CV."
            );
            return;
          }

          setCareerInsight(insight);
        }
      } catch (err) {
        console.error("Career Insight page error:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Unable to load your career insight."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCareerInsight();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3157D5] text-white shadow-lg shadow-[#3157D5]/20">
            <Loader2 size={25} className="animate-spin" />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#0B1220]">
            Building your career insight
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your AI career profile is being prepared...
          </p>
        </div>
      </div>
    );
  }

  if (error || !careerInsight) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#3157D5]"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <TriangleAlert size={24} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#0B1220]">
              Career insight unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              {error ||
                "Analyze a CV first to generate your personalized career insight."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/upload")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3157D5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2649BA]"
            >
              Analyze a CV
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#0B1220]">
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#3157D5]"
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3157D5] text-white shadow-md shadow-[#3157D5]/20">
              <BrainCircuit size={18} />
            </div>

            <span className="text-sm font-black tracking-tight">
              CVision AI
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0B1220] p-7 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#3157D5]/30 blur-3xl" />

          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
              <Sparkles size={14} />
              Personalized AI Career Insight
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              {careerInsight.headline ||
                "Your personalized career direction"}
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              {careerInsight.professionalProfile ||
                "Your CV has been transformed into a personalized career profile."}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#3157D5]">
                <Compass size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3157D5]">
                  Strongest career direction
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#0B1220]">
                  {careerInsight.strongestCareerDirection ||
                    "Career direction identified from your CV"}
                </h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-500">
              Your direction is based on the skills, experience,
              education and projects found in your analyzed CV.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#D8E1FF] bg-gradient-to-br from-[#F2F5FF] to-white p-7 shadow-sm sm:p-8">
            <TrendingUp size={24} className="text-[#3157D5]" />

            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              AI Career Signal
            </p>

            <p className="mt-2 text-lg font-black text-[#0B1220]">
              Your profile has a defined professional direction.
            </p>

            <p className="mt-3 text-xs leading-6 text-slate-500">
              Use the recommendations below to strengthen your
              position for your target career path.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Your strengths
                </p>

                <h2 className="text-xl font-black">
                  Key skills
                </h2>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(careerInsight.keySkills || []).map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[#3157D5]"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Target size={20} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Growth areas
                </p>

                <h2 className="text-xl font-black">
                  Areas to improve
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {(careerInsight.areasToImprove || []).map(
                (area, index) => (
                  <div
                    key={`${area}-${index}`}
                    className="flex gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <span className="mt-0.5 text-amber-500">
                      <Lightbulb size={16} />
                    </span>

                    <p className="text-sm leading-6 text-slate-600">
                      {area}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3157D5] text-white">
              <Lightbulb size={20} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3157D5]">
                Your roadmap
              </p>

              <h2 className="text-xl font-black">
                Recommended next steps
              </h2>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {(careerInsight.nextSteps || []).map(
              (step, index) => (
                <div
                  key={`${step}-${index}`}
                  className="group flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-[#3157D5] shadow-sm">
                    {index + 1}
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {step}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-[#0B1220]"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/job-matcher")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3157D5] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#3157D5]/20 transition hover:bg-[#2649BA]"
          >
            Explore job matching
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}