import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Eye,
  Sparkles,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSearch,
} from "lucide-react";
import api from "../services/api";

export default function MyCVs() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/resumes");

      setResumes(response.data.resumes || []);
    } catch (err) {
      console.error("Fetch CVs error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your CVs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this CV?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(resumeId);

      await api.delete(`/resumes/${resumeId}`);

      setResumes((current) =>
        current.filter((resume) => resume._id !== resumeId)
      );
    } catch (err) {
      console.error("Delete CV error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete this CV. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatus = (status) => {
    if (status === "completed") {
      return {
        label: "Analyzed",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-700",
      };
    }

    if (status === "analyzing") {
      return {
        label: "Analyzing",
        icon: Loader2,
        className: "bg-blue-50 text-blue-700",
      };
    }

    if (status === "failed") {
      return {
        label: "Failed",
        icon: AlertCircle,
        className: "bg-red-50 text-red-700",
      };
    }

    return {
      label: "Uploaded",
      icon: Clock3,
      className: "bg-slate-100 text-slate-600",
    };
  };

  const filteredResumes = resumes.filter((resume) => {
    const fileName = resume.fileName || resume.originalName || "Untitled CV";

    return fileName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-6 py-10 text-[#0B1220] md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DDE6FF] bg-white px-3 py-1.5 text-xs font-bold text-[#3157D5] shadow-sm">
              <FileSearch size={14} />
              CV Library
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              My CVs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Manage your uploaded CVs, review their analysis, and keep your
              career documents organized in one place.
            </p>
          </div>

          <button
            onClick={() => navigate("/upload")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3157D5] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#2748B8]"
          >
            <Upload size={18} />
            Upload New CV
          </button>
        </div>

        {/* Stats */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
              <FileText size={21} />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Total CVs
            </p>

            <p className="mt-1 text-3xl font-black">
              {resumes.length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Analyzed
            </p>

            <p className="mt-1 text-3xl font-black">
              {resumes.filter((resume) => resume.status === "completed").length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Sparkles size={21} />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Ready for AI
            </p>

            <p className="mt-1 text-3xl font-black">
              {
                resumes.filter(
                  (resume) =>
                    resume.status === "uploaded" ||
                    !resume.status
                ).length
              }
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your CVs..."
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFD] py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#3157D5] focus:ring-4 focus:ring-[#3157D5]/10"
            />
          </div>

          <div className="rounded-2xl bg-[#F8FAFD] px-4 py-3 text-sm font-semibold text-slate-500">
            {filteredResumes.length}{" "}
            {filteredResumes.length === 1 ? "CV" : "CVs"}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <p className="font-bold">Something went wrong</p>
              <p className="mt-1">{error}</p>

              <button
                onClick={fetchResumes}
                className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-100"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                <Loader2 size={26} className="animate-spin" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                Loading your CV library...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Fetching your uploaded documents
              </p>
            </div>
          </div>
        ) : filteredResumes.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF0FF] text-[#3157D5]">
              <FileText size={29} />
            </div>

            <h2 className="mt-5 text-xl font-black">
              {search ? "No CVs found" : "Your CV library is empty"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try another search term."
                : "Upload your first CV and CVision AI will analyze it and help you understand your career profile."}
            </p>

            {!search && (
              <button
                onClick={() => navigate("/upload")}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#3157D5] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#2748B8]"
              >
                <Upload size={18} />
                Upload My First CV
              </button>
            )}
          </div>
        ) : (
          /* CV Grid */
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredResumes.map((resume) => {
              const status = getStatus(resume.status);
              const StatusIcon = status.icon;

              const fileName =
                resume.fileName ||
                resume.originalName ||
                resume.name ||
                "Untitled CV";

              const date = resume.createdAt
                ? new Date(resume.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "Unknown date";

              return (
                <article
                  key={resume._id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9D6FF] hover:shadow-xl hover:shadow-[#3157D5]/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                      <FileText size={25} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-black">
                            {fileName}
                          </h2>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Uploaded {date}
                          </p>
                        </div>

                        <div
                          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                        >
                          <StatusIcon
                            size={13}
                            className={
                              resume.status === "analyzing"
                                ? "animate-spin"
                                : ""
                            }
                          />

                          {status.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                    <button
                      onClick={() =>
                        navigate(`/analysis/${resume._id}`)
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#EAF0FF] px-4 py-3 text-sm font-bold text-[#3157D5] transition hover:bg-[#DCE6FF]"
                    >
                      <Eye size={17} />
                      View Analysis
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/analysis/${resume._id}`)
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#3157D5] hover:text-[#3157D5]"
                    >
                      <Sparkles size={17} />
                      Analyze
                    </button>

                    <button
                      onClick={() => handleDelete(resume._id)}
                      disabled={deletingId === resume._id}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === resume._id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}

                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && resumes.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-[#0B1220] p-7 text-white shadow-xl md:p-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[#7FA1FF]">
                  <Sparkles size={18} />
                  <span className="text-xs font-black uppercase tracking-[0.18em]">
                    CVision AI
                  </span>
                </div>

                <h2 className="text-xl font-black md:text-2xl">
                  Ready to analyze another CV?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  Upload another version of your CV and compare your career
                  profile over time.
                </p>
              </div>

              <button
                onClick={() => navigate("/upload")}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#0B1220] transition hover:-translate-y-0.5 hover:bg-[#EAF0FF]"
              >
                <Upload size={18} />
                Upload New CV
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

