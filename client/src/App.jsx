import { useRef, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import { 
  ArrowDown, 
  ArrowRight, 
  BrainCircuit, 
  Check, 
  CheckCircle2, 
  FileSearch, 
  FileText, 
  Menu, 
  Sparkles, 
  Target, 
  Upload, 
  X, 
  Zap, 
} from "lucide-react";

import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UploadResume from "./pages/UploadResume";
import Analysis from "./pages/Analysis";
import MyCVs from "./pages/MyCVs";
import JobMatcher from "./pages/JobMatcher";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import JobDetails from "./pages/JobDetails";
import CareerInsight from "./pages/CareerInsight";

function Landing() {
  const { user } = useAuth();

  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const features = [
    {
      icon: FileSearch,
      number: "01",
      title: "Deep CV Analysis",
      description:
        "Turn your CV into structured insights across skills, experience, education, projects and strengths.",
    },
    {
      icon: Target,
      number: "02",
      title: "Smart Job Matching",
      description:
        "Compare your profile with target opportunities and discover where your experience matches.",
    },
    {
      icon: BrainCircuit,
      number: "03",
      title: "AI Recommendations",
      description:
        "Get practical recommendations that help you understand what to improve and what to highlight.",
    },
  ];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const scrollToUpload = () => {
    setMobileMenu(false);

    document
      .getElementById("get-started")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    setMobileMenu(false);

    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHow = () => {
    setMobileMenu(false);

    document
      .getElementById("how")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#F6F8FC] text-[#0B1220]">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#3157D5]/10 blur-3xl" />

        <div className="absolute -right-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[#7FA1FF]/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#0B1220]/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3157D5] text-white shadow-lg shadow-[#3157D5]/20 transition duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <BrainCircuit size={22} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#7FA1FF] ring-4 ring-white" />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-[#0B1220]">
                CVision AI
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#64748B]">
                Career Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={scrollToFeatures}
              className="text-sm font-semibold text-[#475569] transition hover:text-[#3157D5]"
            >
              Features
            </button>

            <button
              onClick={scrollToHow}
              className="text-sm font-semibold text-[#475569] transition hover:text-[#3157D5]"
            >
              How it works
            </button>

            <Link
              to={user ? "/dashboard" : "/login"}
              className="text-sm font-bold text-[#3157D5] transition hover:text-[#2649BA]"
            >
              {user ? "My Dashboard" : "Log in"}
            </Link>

            <button
              onClick={scrollToUpload}
              className="rounded-xl bg-[#3157D5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3157D5]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#2649BA] hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setMobileMenu((current) => !current)}
            className="rounded-xl p-2 text-[#0B1220] transition hover:bg-slate-100 md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
            <div className="flex flex-col gap-2">
              <button
                onClick={scrollToFeatures}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Features
              </button>

              <button
                onClick={scrollToHow}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                How it works
              </button>

              <Link
                to={user ? "/dashboard" : "/login"}
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm font-bold text-[#3157D5] hover:bg-blue-50"
              >
                {user ? "My Dashboard" : "Log in"}
              </Link>

              <button
                onClick={scrollToUpload}
                className="mt-1 rounded-xl bg-[#3157D5] px-4 py-3 text-sm font-bold text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:px-10 lg:pb-32 lg:pt-24">
        {/* Hero text */}
        <div className="animate-[fadeUp_.8s_ease-out_both]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-[#3157D5] shadow-sm">
            <Sparkles size={14} />
            AI-powered career intelligence
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Understand your CV.
            <span className="mt-2 block text-[#3157D5]">
              Match your career.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-[#64748B] sm:text-lg">
            CVision AI transforms your CV into clear career insights,
            identifies your strengths, detects missing skills and helps you
            understand how your profile matches opportunities.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={scrollToUpload}
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#3157D5] px-7 py-4 font-black text-white shadow-xl shadow-[#3157D5]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#2649BA] hover:shadow-2xl"
            >
              <Upload size={18} />

              Analyze my CV

              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </button>

            <Link
              to={user ? "/dashboard" : "/login"}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-[#0B1220] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:text-[#3157D5] hover:shadow-lg"
            >
              {user ? "Open my dashboard" : "Log in to dashboard"}

              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#64748B]">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-[#3157D5]" />
              AI-powered analysis
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-[#3157D5]" />
              Secure authentication
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-[#3157D5]" />
              Actionable insights
            </span>
          </div>
        </div>

        {/* AI Preview */}
        <div className="relative animate-[fadeUp_1s_ease-out_both] lg:pl-8">
          <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#3157D5]/10 blur-3xl" />

          <div className="absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-[#7FA1FF]/10 blur-3xl" />

          <div className="relative rotate-1 rounded-[2rem] border border-white bg-white/90 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl transition duration-500 hover:rotate-0 hover:shadow-[0_35px_100px_rgba(49,87,213,0.15)]">
            <div className="rounded-[1.5rem] bg-[#F6F8FC] p-5">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3157D5]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#CBD5E1]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#94A3B8]" />
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] shadow-sm">
                  AI Analysis
                </span>
              </div>

              {/* Profile */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    CV ANALYSIS
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Your profile
                  </h2>
                </div>

                <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-[6px] border-[#3157D5] bg-white text-xl font-black text-[#3157D5] shadow-sm">
                  84
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold">
                    Skills detected
                  </span>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#3157D5]">
                    12 skills
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "JavaScript",
                    "HTML",
                    "CSS",
                    "Git",
                  ].map((skill, index) => (
                    <span
                      key={skill}
                      className="animate-[fadeUp_.5s_ease-out_both] rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:-translate-y-1 hover:bg-blue-50 hover:text-[#3157D5]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scores */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="group rounded-2xl bg-[#0B1220] p-4 text-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <Target
                    size={20}
                    className="transition group-hover:rotate-12"
                  />

                  <p className="mt-4 text-[11px] text-white/60">
                    Job Match
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    91%
                  </p>
                </div>

                <div className="group rounded-2xl bg-[#3157D5] p-4 text-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <Zap
                    size={20}
                    className="transition group-hover:scale-110"
                  />

                  <p className="mt-4 text-[11px] text-white/70">
                    CV Quality
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    84
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mt-3 rounded-2xl border border-blue-100 bg-white p-4 transition duration-300 hover:border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-[#3157D5]">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      AI recommendation
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      Strengthen your project descriptions to highlight
                      measurable impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification */}
          <div className="absolute -bottom-7 -right-4 hidden animate-[float_4s_ease-in-out_infinite] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-[#3157D5]">
                <Check size={18} />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Analysis complete
                </p>

                <p className="text-[11px] text-[#64748B]">
                  Your CV is ready.
                </p>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -left-7 top-20 hidden animate-[float_5s_ease-in-out_infinite] rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:block">
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={17}
                className="text-[#3157D5]"
              />

              <span className="text-xs font-bold">
                AI is thinking
              </span>

              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#3157D5]" />

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7FA1FF] [animation-delay:150ms]" />

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#CBD5E1] [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 border-y border-slate-200/70 bg-white px-6 py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#3157D5]">
              Everything in one place
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Your CV deserves more than a quick glance.
            </h2>

            <p className="mt-5 leading-7 text-[#64748B]">
              CVision AI transforms your CV into a structured career profile
              that helps you understand where you stand.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;

              return (
                <button
                  key={feature.title}
                  onClick={() => setActiveFeature(index)}
                  className={`group rounded-[2rem] border p-7 text-left transition duration-500 ${
                    isActive
                      ? "-translate-y-2 border-blue-100 bg-white shadow-[0_25px_60px_rgba(49,87,213,0.10)]"
                      : "border-slate-200 bg-[#F8FAFC] hover:-translate-y-2 hover:bg-white hover:shadow-xl"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 ${
                        isActive
                          ? "rotate-3 bg-[#3157D5] text-white"
                          : "bg-blue-50 text-[#3157D5] group-hover:rotate-3"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    <span className="text-xs font-black tracking-widest text-slate-300">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-black">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#64748B]">
                    {feature.description}
                  </p>

                  <div
                    className={`mt-6 flex items-center gap-2 text-xs font-bold transition ${
                      isActive
                        ? "text-[#3157D5]"
                        : "translate-x-[-8px] text-[#64748B] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  >
                    Explore
                    <ArrowRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="relative z-10 px-6 py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#3157D5]">
              Simple process
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              From CV to clarity.
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload",
                text: "Upload your PDF, DOCX or supported CV file.",
              },
              {
                step: "02",
                icon: BrainCircuit,
                title: "Analyze",
                text: "AI extracts and understands the information in your CV.",
              },
              {
                step: "03",
                icon: Target,
                title: "Improve",
                text: "Explore your score, insights and job compatibility.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className="group relative rounded-[2rem] border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <span className="absolute right-6 top-6 text-5xl font-black text-slate-100">
                    {item.step}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#3157D5] transition group-hover:scale-110">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-8 text-xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#64748B]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upload */}
      <section
        id="get-started"
        className="relative z-10 px-6 py-24 lg:px-10"
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border px-7 py-14 text-center shadow-2xl transition duration-500 sm:px-12 ${
            isDragging
              ? "scale-[1.01] border-[#3157D5] bg-blue-50"
              : "border-[#0B1220] bg-[#0B1220]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#3157D5] shadow-lg transition duration-300 hover:rotate-6 hover:scale-110">
                <Upload size={28} />
              </div>

              <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Ready to understand your CV?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
                Upload your CV and let CVision AI turn your experience into
                actionable career insights.
              </p>

              <button
                onClick={handleUploadClick}
                className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#3157D5] px-7 py-4 font-black text-white shadow-lg shadow-[#3157D5]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#2649BA] hover:shadow-2xl"
              >
                <Upload size={18} />

                Upload your CV

                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <p className="mt-5 text-xs text-slate-500">
                PDF, DOCX, PNG, JPG • Drag & drop supported
              </p>
            </>
          ) : (
            <div className="mx-auto max-w-xl animate-[fadeUp_.5s_ease-out_both]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#3157D5]">
                <FileText size={28} />
              </div>

              <h2 className="mt-6 text-3xl font-black text-white">
                CV selected
              </h2>

              <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2 text-white">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={clearFile}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <Link
                to={user ? "/upload" : "/login"}
                className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-[#3157D5] px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-[#2649BA]"
              >
                {user ? "Continue to upload" : "Continue to analysis"}

                <ArrowRight size={18} />
              </Link>

              <p className="mt-4 text-xs text-slate-500">
                {user
                  ? "Your account is ready. Continue to upload and analyze your CV."
                  : "Sign in first so your CV analysis can be securely saved to your account."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#64748B] sm:flex-row">
          <div>
            <p className="font-black text-[#0B1220]">
              CVision AI
            </p>

            <p className="mt-1 text-xs">
              Career intelligence powered by AI.
            </p>
          </div>

          <p className="self-center text-xs font-bold">
            Understand Your CV. Match Your Career.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/upload" element={<UploadResume />} />

          <Route path="/analysis/:resumeId" element={<Analysis />} />

          <Route path="/my-cvs" element={<MyCVs />} />

          <Route path="/job-matcher" element={<JobMatcher />} />

          <Route
            path="/job-matcher/:jobId"
            element={<JobDetails />}
          />
          <Route
  path="/career-insight"
  element={<CareerInsight />}
/>

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-6">
              <div className="text-center">
                <h1 className="text-6xl font-black text-[#0B1220]">
                  404
                </h1>

                <p className="mt-3 text-[#64748B]">
                  Page not found.
                </p>

                <Link
                  to="/"
                  className="mt-6 inline-flex rounded-xl bg-[#3157D5] px-6 py-3 font-bold text-white"
                >
                  Back home
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

