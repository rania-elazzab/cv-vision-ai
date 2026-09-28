import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(form.email, form.password);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to login. Please check your information."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F3EB] text-[#18202A]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left side */}
        <section className="relative hidden overflow-hidden bg-[#0B1220] lg:flex">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#3157D5]/20 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[32rem] w-[32rem] rounded-full bg-[#7F2020]/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3157D5] shadow-lg shadow-[#3157D5]/30">
                <BrainCircuit size={22} />
              </div>

              <div>
                <p className="font-black tracking-tight">CVision AI</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                  Career Intelligence
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-blue-200 backdrop-blur">
                <Sparkles size={14} />
                AI-powered career intelligence
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">
                Turn your CV into a{" "}
                <span className="text-[#7FA1FF]">career strategy.</span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-8 text-slate-400">
                Analyze your CV, discover your strengths, identify missing
                skills and understand how your profile matches real
                opportunities.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-black text-white">AI</p>
                  <p className="mt-1 text-xs text-slate-400">Analysis</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-black text-white">100</p>
                  <p className="mt-1 text-xs text-slate-400">CV Score</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-black text-white">∞</p>
                  <p className="mt-1 text-xs text-slate-400">Insights</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Understand Your CV. Match Your Career.
            </p>
          </div>
        </section>

        {/* Login side */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3157D5] text-white">
                  <BrainCircuit size={22} />
                </div>

                <div>
                  <p className="font-black">CVision AI</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
                    Career Intelligence
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:p-9">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3157D5]">
                  Welcome back
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B1220]">
                  Sign in to CVision
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#64748B]">
                  Continue analyzing your CV and discovering career
                  opportunities.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#334155]">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-[#3157D5] focus:bg-white focus:ring-4 focus:ring-[#3157D5]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#334155]">
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm outline-none transition focus:border-[#3157D5] focus:bg-white focus:ring-4 focus:ring-[#3157D5]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#94A3B8] transition hover:bg-slate-100 hover:text-[#3157D5]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#3157D5] font-black text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#2649BA] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}

                  {!loading && (
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">
                  New to CVision?
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                to="/register"
                className="flex h-13 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white font-bold text-[#0B1220] transition hover:-translate-y-0.5 hover:border-[#3157D5]/40 hover:bg-[#F8FAFF]"
              >
                Create an account
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-[#94A3B8]">
              Your account information is securely stored and authenticated
              through CVision AI.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;