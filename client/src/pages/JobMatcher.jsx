
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Target,
} from "lucide-react";
import api from "../services/api";

export default function JobMatcher() {
  const navigate = useNavigate();

  const [careers, setCareers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const fetchCareerMatches = async (resumeId) => {
    if (!resumeId) {
      setCareers([]);
      setMatches([]);
      return;
    }

    try {
      setMatching(true);
      setError("");

      const response = await api.get(
        `/jobs/recommended/${resumeId}`
      );

      const recommendedCareers = response.data.jobs || [];

      setCareers(recommendedCareers);
      setMatches(recommendedCareers);
    } catch (err) {
      console.error("Career matching error:", err);

      setCareers([]);
      setMatches([]);

      setError(
        err.response?.data?.message ||
          "Unable to generate career matches for this CV."
      );
    } finally {
      setMatching(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const resumesResponse = await api.get("/resumes");

      const availableResumes =
        resumesResponse.data.resumes || [];

      setResumes(availableResumes);

      const completedResume = availableResumes.find(
        (resume) => resume.status === "completed"
      );

      if (completedResume) {
        setSelectedResume(completedResume._id);

        await fetchCareerMatches(completedResume._id);
      } else {
        setCareers([]);
        setMatches([]);
      }
    } catch (err) {
      console.error("Career matcher fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your CVs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runMatching = async () => {
    if (!selectedResume) {
      setError(
        "Please select an analyzed CV before finding career matches."
      );
      return;
    }

    await fetchCareerMatches(selectedResume);
  };

  const handleResumeChange = async (event) => {
    const resumeId = event.target.value;

    setSelectedResume(resumeId);
    setSearch("");

    if (!resumeId) {
      setCareers([]);
      setMatches([]);
      return;
    }

    const selectedResumeData = resumes.find(
      (resume) => resume._id === resumeId
    );

    if (selectedResumeData?.status !== "completed") {
      setCareers([]);
      setMatches([]);

      setError(
        "Please analyze this CV first before finding career matches."
      );

      return;
    }

    await fetchCareerMatches(resumeId);
  };

  const filteredCareers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return careers;
    }

    return careers.filter((career) => {
      const title = career.title || "";
      const description = career.description || "";

      const skills = Array.isArray(career.matchingSkills)
        ? career.matchingSkills.join(" ")
        : "";

      const missingSkills = Array.isArray(career.missingSkills)
        ? career.missingSkills.join(" ")
        : "";

      const searchableText = `
        ${title}
        ${description}
        ${skills}
        ${missingSkills}
      `.toLowerCase();

      return searchableText.includes(searchValue);
    });
  }, [careers, search]);

  const getMatchForCareer = (careerId) => {
    return matches.find((match) => {
      const matchCareerId =
        match?._id ||
        match?.id ||
        match?.careerId;

      return String(matchCareerId) === String(careerId);
    });
  };

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

  const getCareerId = (career) =>
    career._id || career.id;

  const strongMatches = matches.filter(
    (match) =>
      Number(
        match?.matchScore ??
          match?.score ??
          0
      ) >= 80
  ).length;

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-6 py-10 text-[#0B1220] md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DDE6FF] bg-white px-3 py-1.5 text-xs font-bold text-[#3157D5] shadow-sm">
            <Target size={14} />
            Career Matches
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Discover Career Paths That Match Your CV
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                CVision AI analyzes your real CV skills, experience,
                and education to identify career roles that match
                your current profile.
              </p>
            </div>

            <button
              onClick={() => navigate("/upload")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#3157D5] hover:text-[#3157D5]"
            >
              <Sparkles size={18} />
              Analyze Another CV
            </button>
          </div>
        </div>

        {/* Career Matching Controls */}
        <section className="mb-7 overflow-hidden rounded-3xl bg-[#0B1220] p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-6">

            <div>
              <div className="flex items-center gap-2 text-[#7FA1FF]">
                <Sparkles size={18} />

                <span className="text-xs font-black uppercase tracking-[0.18em]">
                  AI Career Matching
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black md:text-2xl">
                Find career roles based on your CV
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Select an analyzed CV and CVision AI will compare
                its profile with different career role requirements.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-300">
                  Select your CV
                </label>

                <select
                  value={selectedResume}
                  onChange={handleResumeChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-[#7FA1FF] focus:ring-4 focus:ring-[#3157D5]/20"
                >
                  <option
                    value=""
                    className="text-[#0B1220]"
                  >
                    Select an analyzed CV
                  </option>

                  {resumes.map((resume) => (
                    <option
                      key={resume._id}
                      value={resume._id}
                      className="text-[#0B1220]"
                    >
                      {resume.fileName ||
                        resume.originalName ||
                        resume.name ||
                        "Untitled CV"}

                      {resume.status !== "completed"
                        ? " — not analyzed"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={runMatching}
                  disabled={
                    matching || !selectedResume
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3157D5] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#4267E0] disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                >
                  {matching ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Matching...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Find Career Matches
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-bold">
                Something went wrong
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              onClick={() => {
                setError("");
                fetchData();
              }}
              className="rounded-xl bg-white p-2 text-red-600 shadow-sm transition hover:bg-red-100"
              title="Retry"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                <Loader2
                  size={26}
                  className="animate-spin"
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                Analyzing your CV and finding career matches...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                CVision AI is preparing your recommendations
              </p>

            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search career roles or skills..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFD] py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#3157D5] focus:ring-4 focus:ring-[#3157D5]/10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mb-7 grid gap-4 sm:grid-cols-3">

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                  <BriefcaseBusiness size={21} />
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  Career Matches
                </p>

                <p className="mt-1 text-3xl font-black">
                  {careers.length}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={21} />
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  Strong Matches
                </p>

                <p className="mt-1 text-3xl font-black">
                  {strongMatches}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <Sparkles size={21} />
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  Roles Analyzed
                </p>

                <p className="mt-1 text-3xl font-black">
                  {matches.length}
                </p>
              </div>

            </div>

            {/* Career Roles */}
            {filteredCareers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF0FF] text-[#3157D5]">
                  <Target size={29} />
                </div>

                <h2 className="mt-5 text-xl font-black">
                  No matching career roles found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Choose an analyzed CV and generate career
                  matches based on your skills and experience.
                </p>

              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">

                {filteredCareers.map((career) => {
                  const careerId = getCareerId(career);

                  const match =
                    getMatchForCareer(careerId);

                  const score = Number(
                    match?.matchScore ??
                      match?.score ??
                      career?.matchScore ??
                      0
                  );

                  const scoreStyles =
                    getScoreStyles(score);

                  const matchingSkills =
                    match?.matchingSkills ||
                    career?.matchingSkills ||
                    [];

                  const missingSkills =
                    match?.missingSkills ||
                    career?.missingSkills ||
                    [];

                  return (
                    <article
                      key={careerId}
                      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9D6FF] hover:shadow-xl hover:shadow-[#3157D5]/5"
                    >

                      {/* Career Header */}
                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                          <BriefcaseBusiness size={25} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                            <div className="min-w-0">
                              <h2 className="text-lg font-black">
                                {career.title ||
                                  "Untitled Career Role"}
                              </h2>

                              <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
                                Career path based on your
                                analyzed CV profile
                              </p>
                            </div>

                            <div
                              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 ${scoreStyles.background} ${scoreStyles.border}`}
                            >
                              <div
                                className={`text-2xl font-black ${scoreStyles.text}`}
                              >
                                {score}%
                              </div>

                              <div
                                className={`text-[10px] font-black uppercase tracking-wider ${scoreStyles.text}`}
                              >
                                Match
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {career.description && (
                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-500">
                          {career.description}
                        </p>
                      )}

                      {/* Skills */}
                      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">

                        {/* Matching */}
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                            <CheckCircle2 size={14} />
                            Matching Skills
                          </div>

                          {matchingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {matchingSkills
                                .slice(0, 5)
                                .map(
                                  (skill, index) => (
                                    <span
                                      key={`${skill}-${index}`}
                                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
                                    >
                                      {typeof skill ===
                                      "string"
                                        ? skill
                                        : skill.name ||
                                          skill.skill}
                                    </span>
                                  )
                                )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">
                              No matching skills found.
                            </p>
                          )}
                        </div>

                        {/* Missing */}
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600">
                            <XCircle size={14} />
                            Skills to Improve
                          </div>

                          {missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {missingSkills
                                .slice(0, 5)
                                .map(
                                  (skill, index) => (
                                    <span
                                      key={`${skill}-${index}`}
                                      className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700"
                                    >
                                      {typeof skill ===
                                      "string"
                                        ? skill
                                        : skill.name ||
                                          skill.skill}
                                    </span>
                                  )
                                )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">
                              No missing skills found.
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">

                        <button
                          onClick={() => {
                            if (!selectedResume) {
                              setError(
                                "Please select a CV before matching."
                              );
                              return;
                            }

                            runMatching();
                          }}
                          disabled={matching}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3157D5] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2748B8] disabled:opacity-50"
                        >
                          {matching ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Sparkles size={17} />
                          )}

                          {matching
                            ? "Matching..."
                            : "Refresh Match"}
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/job-matcher/${careerId}`
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#3157D5] hover:text-[#3157D5]"
                        >
                          View Career Details
                          <ChevronRight size={17} />
                        </button>

                      </div>
                    </article>
                  );
                })}

              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}