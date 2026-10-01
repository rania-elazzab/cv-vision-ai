import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const stats = [
  {
    label: "CV Score",
    value: "86",
    suffix: "/100",
    change: "+12%",
    icon: Gauge,
  },
  {
    label: "Skills Detected",
    value: "18",
    suffix: "",
    change: "+4",
    icon: Zap,
  },
  {
    label: "Job Matches",
    value: "24",
    suffix: "",
    change: "+8",
    icon: Target,
  },
  {
    label: "Profile Strength",
    value: "78",
    suffix: "%",
    change: "+16%",
    icon: TrendingUp,
  },
];

const skills = [
  { name: "React", level: 91 },
  { name: "JavaScript", level: 86 },
  { name: "HTML / CSS", level: 94 },
  { name: "Marketing", level: 82 },
  { name: "Git / GitHub", level: 76 },
];

const recentResumes = [
  {
    name: "Rania_El_Azzab_CV.pdf",
    date: "Today",
    score: 86,
    status: "Analyzed",
  },
  {
    name: "CV_Updated_2026.pdf",
    date: "Yesterday",
    score: 78,
    status: "Analyzed",
  },
  {
    name: "Marketing_Developer_CV.pdf",
    date: "Sep 20",
    score: 72,
    status: "Analyzed",
  },
];

function ScoreRing({ score }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 140 140"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.14)"
          strokeWidth="10"
        />

        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#3157D5"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#0B1220]">
          {score}
        </span>

        <span className="text-xs font-medium text-slate-400">
          out of 100
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [dragActive, setDragActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [careerInsight, setCareerInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCareerInsight = async () => {
      try {
        const resumesResponse = await api.get("/resumes");

        const resumes = resumesResponse.data.resumes || [];

        const latestResume = resumes.find(
          (resume) => resume.status === "completed"
        );

        if (!latestResume) {
          if (!cancelled) {
            setInsightLoading(false);
          }

          return;
        }

        const insightResponse = await api.get(
          `/analysis/${latestResume._id}/career-insight`
        );

        if (!cancelled) {
          setCareerInsight(
            insightResponse.data.careerInsight || null
          );
        }
      } catch (error) {
        console.error("Career insight error:", error);
      } finally {
        if (!cancelled) {
          setInsightLoading(false);
        }
      }
    };

    loadCareerInsight();

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = useMemo(() => {
    if (!user?.name) return "there";

    return user.name.trim().split(" ")[0];
  }, [user]);

  const navigation = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      action: () => {
        setActiveNav("Dashboard");
        setSidebarOpen(false);
        navigate("/dashboard");
      },
    },
    {
      label: "My CVs",
      icon: FileText,
      action: () => {
        setActiveNav("My CVs");
        setSidebarOpen(false);
        navigate("/my-cvs");
      },
    },
    {
      label: "Job Matcher",
      icon: BriefcaseBusiness,
      action: () => {
        setActiveNav("Job Matcher");
        setSidebarOpen(false);
        navigate("/job-matcher");
      },
    },
    {
      label: "Analytics",
      icon: BarChart3,
      action: () => {
        setActiveNav("Analytics");
        setSidebarOpen(false);
        navigate("/analytics");
      },
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goToUpload = () => {
    navigate("/upload");
  };

  const goToCareerInsight = () => {
    navigate("/career-insight");
  };

  const goToJobs = () => {
    setActiveNav("Job Matcher");
    navigate("/job-matcher");
  };

  const goToProfile = () => {
    setActiveNav("Profile");
    setSidebarOpen(false);
    navigate("/profile");
  };

  const goToSettings = () => {
    setActiveNav("Settings");
    setSidebarOpen(false);
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0B1220]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-slate-100 px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1220] shadow-lg shadow-slate-300">
              <Sparkles size={19} className="text-[#7FA1FF]" />
            </div>

            <div className="text-left">
              <div className="text-[17px] font-bold tracking-tight">
                CVision <span className="text-[#3157D5]">AI</span>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Career Intelligence
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>

          <nav className="mt-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#EAF0FF] text-[#3157D5] shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0B1220]"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-[#3157D5]"
                        : "text-slate-400 group-hover:text-[#3157D5]"
                    }
                  />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#3157D5]" />
                  )}
                </button>
              );
            })}
          </nav>

          <p className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Account
          </p>

          <nav className="mt-4 space-y-1.5">
            <button
              type="button"
              onClick={goToProfile}
              className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#0B1220]"
            >
              <UserRound
                size={18}
                className="text-slate-400 group-hover:text-[#3157D5]"
              />

              Profile
            </button>

            <button
              type="button"
              onClick={goToSettings}
              className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#0B1220]"
            >
              <Settings
                size={18}
                className="text-slate-400 group-hover:text-[#3157D5]"
              />

              Settings
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-2xl bg-[#F7F9FC] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3157D5] text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "R"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#0B1220]">
                  {user?.name || "CVision User"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {user?.email || "Your account"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen lg:ml-[270px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-slate-200/80 bg-white/85 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                Workspace
              </p>

              <p className="text-sm font-bold text-[#0B1220]">
                {activeNav}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search your workspace..."
                className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none transition focus:border-[#7FA1FF] focus:bg-white focus:ring-4 focus:ring-[#3157D5]/5"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Bell size={18} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#3157D5]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/30">
                  <p className="text-sm font-bold">
                    Notifications
                  </p>

                  <div className="mt-3 rounded-xl bg-[#EAF0FF] p-3">
                    <p className="text-xs font-semibold text-[#3157D5]">
                      Your CV analysis is ready.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden h-10 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1220] text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "R"}
              </div>

              <div className="hidden lg:block">
                <p className="text-xs font-bold">
                  {user?.name || "Rania"}
                </p>

                <p className="text-[10px] text-slate-400">
                  Free plan
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[28px] bg-[#0B1220] p-7 shadow-2xl shadow-slate-300/20 sm:p-9 lg:p-11">
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#3157D5]/25 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#7FA1FF]/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#B8C8FF]">
                <Sparkles size={13} />
                AI-powered career intelligence
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Welcome back,{" "}
                <span className="text-[#7FA1FF]">
                  {firstName}
                </span>
                .
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Your CV is more than a document. Let CVision AI turn your
                experience into a smarter career strategy.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goToUpload}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0B1220] shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <Upload size={17} />

                  Analyze a new CV

                  <ArrowUpRight
                    size={15}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>

                <button
                  type="button"
                  onClick={goToJobs}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <BriefcaseBusiness size={17} />

                  Find matching jobs
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C8D4FF] hover:shadow-xl hover:shadow-[#3157D5]/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5] transition group-hover:scale-105">
                      <Icon size={20} />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      {stat.change}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400">
                      {stat.label}
                    </p>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">
                        {stat.value}
                      </span>

                      <span className="text-sm font-semibold text-slate-400">
                        {stat.suffix}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Main grid */}
          <section className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            {/* CV analysis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0FF] text-[#3157D5]">
                      <FileText size={17} />
                    </div>

                    <p className="text-sm font-bold">
                      Latest CV Analysis
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Rania_El_Azzab_CV.pdf · analyzed today
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToUpload}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3157D5] hover:underline"
                >
                  View full analysis
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="mt-8 flex flex-col items-center gap-8 md:flex-row">
                <ScoreRing score={86} />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                    />

                    <p className="text-lg font-bold">
                      Strong CV profile
                    </p>
                  </div>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Your CV has a solid structure and relevant technical
                    skills. A few targeted improvements could make your
                    profile even more competitive.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Structure
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        Excellent
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Keywords
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        Good
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Impact
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        Strong
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick upload */}
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);

                const file = event.dataTransfer.files?.[0];

                if (file) {
                  navigate("/upload");
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-6 transition-all ${
                dragActive
                  ? "border-[#3157D5] bg-[#EAF0FF]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1220] text-[#7FA1FF]">
                  <Upload size={20} />
                </div>

                <p className="mt-5 text-lg font-bold">
                  Analyze a new CV
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Drop your PDF or DOCX here and let our AI analyze your
                  profile instantly.
                </p>

                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-500">
                    Drag & drop your CV
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    PDF or DOCX · up to 10MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToUpload}
                  className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-[#3157D5] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#2749BB]"
                >
                  <Plus size={17} />
                  Upload CV
                </button>
              </div>
            </div>
          </section>

          {/* Bottom grid */}
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Skills */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">
                    Skills Overview
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    AI detected skills from your latest CV
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0FF] text-[#3157D5]">
                  <Zap size={17} />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {skill.name}
                      </span>

                      <span className="text-[11px] font-bold text-slate-400">
                        {skill.level}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#3157D5] transition-all duration-1000"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent CVs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">
                    Recent CVs
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your latest uploaded documents
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/my-cvs")}
                  className="text-xs font-bold text-[#3157D5] hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {recentResumes.map((resume) => (
                  <button
                    key={resume.name}
                    type="button"
                    onClick={() => navigate("/my-cvs")}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0FF] text-[#3157D5]">
                      <FileText size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {resume.name}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {resume.date} · {resume.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-[#3157D5]">
                        {resume.score}
                      </p>

                      <p className="text-[9px] font-semibold text-slate-400">
                        SCORE
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#3157D5]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* AI insight */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-[#D8E1FF] bg-gradient-to-r from-[#F2F5FF] to-white p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3157D5] text-white shadow-lg shadow-[#3157D5]/20">
                <Sparkles size={21} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-[#0B1220]">
                  AI Career Insight
                </p>

                {insightLoading ? (
                  <div className="mt-2 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
                  </div>
                ) : careerInsight ? (
                  <>
                    {careerInsight.headline && (
                      <p className="mt-1 text-sm font-bold text-[#3157D5]">
                        {careerInsight.headline}
                      </p>
                    )}

                    <p className="mt-1 max-w-4xl text-xs leading-6 text-slate-500">
                      {careerInsight.professionalProfile ||
                        careerInsight.strongestCareerDirection ||
                        ""}
                    </p>

                    {careerInsight.strongestCareerDirection && (
                      <p className="mt-2 max-w-4xl text-xs leading-6 text-slate-500">
                        <span className="font-bold text-slate-600">
                          Strongest direction:{" "}
                        </span>

                        {careerInsight.strongestCareerDirection}
                      </p>
                    )}

                    {careerInsight.keySkills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {careerInsight.keySkills
                          .slice(0, 6)
                          .map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#3157D5] shadow-sm"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-1 max-w-4xl text-xs leading-6 text-slate-500">
                    Upload and analyze a CV to generate your
                    personalised AI career insight.
                  </p>
                )}
              </div>

              {/* CHANGED: opens the real AI Career Insight page */}
              <button
                type="button"
                onClick={goToCareerInsight}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#18243A]"
              >
                Explore career path
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

