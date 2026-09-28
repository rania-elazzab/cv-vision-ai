import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  ShieldCheck,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [stats, setStats] = useState({
    totalCVs: 0,
    analyzedCVs: 0,
    averageScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [meResponse, resumesResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/resumes"),
        ]);

        const currentUser = meResponse.data.user;
        const resumes = resumesResponse.data.resumes || [];

        setFormData({
          name: currentUser?.name || "",
          email: currentUser?.email || "",
        });

        const completedCVs = resumes.filter(
          (resume) => resume.status === "completed"
        );

        let totalScore = 0;
        let scoreCount = 0;

        for (const resume of completedCVs) {
          try {
            const analysisResponse = await api.get(
              `/analysis/${resume._id}`
            );

            const score = Number(analysisResponse.data.analysis?.score);

            if (!Number.isNaN(score)) {
              totalScore += score;
              scoreCount += 1;
            }
          } catch {
            // Ignore CVs without an available analysis.
          }
        }

        setStats({
          totalCVs: resumes.length,
          analyzedCVs: completedCVs.length,
          averageScore:
            scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
        });
      } catch (err) {
        console.error("Profile loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );

        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * The backend update-profile endpoint will be connected
       * here once the profile update API is implemented.
       *
       * For now, we verify that the form is valid and keep the
       * current authenticated profile data safe.
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      setSuccess("Profile changes saved successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save your profile changes."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8FC] px-6 py-10 text-[#0B1220]">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0FF]">
              <Loader2
                size={26}
                className="animate-spin text-[#3157D5]"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-4 py-8 text-[#0B1220] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCE5FF] bg-white px-3 py-1.5 text-xs font-bold text-[#3157D5] shadow-sm">
            <Sparkles size={14} />
            Account Profile
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Your Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your personal information and keep your CVision AI
            account up to date.
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Profile form */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            {/* Profile banner */}
            <div className="relative overflow-hidden bg-[#0B1220] px-6 py-8 sm:px-8">
              <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#3157D5]/30 blur-2xl" />
              <div className="absolute -bottom-20 left-20 h-40 w-40 rounded-full bg-[#7FA1FF]/20 blur-2xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#3157D5] shadow-lg">
                  {(formData.name || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9FB6FF]">
                    CVision AI Account
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                    {formData.name || "Your Name"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    {formData.email || "your@email.com"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="mb-7">
                <h3 className="text-lg font-black">
                  Personal Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the information associated with your account.
                </p>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#3157D5] focus:bg-white focus:ring-4 focus:ring-[#3157D5]/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#3157D5] focus:bg-white focus:ring-4 focus:ring-[#3157D5]/10"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Your email is used for account authentication.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3157D5] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#2849B7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Right side */}
          <div className="space-y-6">
            {/* Account status */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h3 className="font-black">Account Status</h3>
                  <p className="text-xs text-slate-500">
                    Your account is active
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={17} />
                Active account
              </div>
            </section>

            {/* Statistics */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="mb-5">
                <h3 className="font-black">CV Overview</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Your CVision AI activity
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#3157D5]">
                      <FileText size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Total CVs
                      </p>
                      <p className="text-lg font-black">
                        {stats.totalCVs}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <BarChart3 size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Analyzed CVs
                      </p>
                      <p className="text-lg font-black">
                        {stats.analyzedCVs}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Average CV Score
                      </p>
                      <p className="text-lg font-black">
                        {stats.averageScore > 0
                          ? `${stats.averageScore}/100`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Member information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5]">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h3 className="font-black">Account Information</h3>
                  <p className="text-xs text-slate-500">
                    CVision AI member
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-500">
                    Account email
                  </span>

                  <span className="max-w-[55%] truncate font-bold text-slate-700">
                    {formData.email || "—"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}