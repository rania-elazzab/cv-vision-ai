import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Moon,
  Sun,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Trash2,
  AlertTriangle,
  Loader2,
  User,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { theme, setThemeMode } = useTheme();
  const { user, deleteAccount } = useAuth();

  const [notifications, setNotifications] = useState({
    email: true,
    analysis: true,
    jobMatches: true,
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteName, setDeleteName] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const toggleNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));

    setSuccess("");
    setError("");
  };

  const handleAppearance = (value) => {
    setThemeMode(value);
    setSuccess(
      `${value === "dark" ? "Dark" : "Light"} mode enabled.`
    );
    setError("");
  };

  const handleSaveNotifications = () => {
    setError("");
    setSuccess("Notification preferences saved successfully.");
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteName("");
    setDeletePassword("");
    setDeleteError("");
    setSuccess("");
    setError("");
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteName("");
    setDeletePassword("");
    setDeleteError("");
  };

  const handleBackdropClick = () => {
    if (deleting) {
      return;
    }

    closeDeleteModal();
  };

  const handleDeleteAccount = async () => {
    const trimmedName = deleteName.trim();

    if (!trimmedName || !deletePassword) {
      setDeleteError("Please enter both your account name and password.");
      return;
    }

    if (trimmedName !== user?.name) {
      setDeleteError("Account name does not match.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteAccount(trimmedName, deletePassword);

      setShowDeleteModal(false);
      setDeleteName("");
      setDeletePassword("");
      setDeleteError("");

      window.location.replace("/login");
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          "Unable to delete account. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-4 py-8 text-[#0B1220] transition-colors duration-300 dark:bg-[#070B14] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCE5FF] bg-white px-3 py-1.5 text-xs font-bold text-[#3157D5] shadow-sm transition-colors dark:border-slate-700 dark:bg-[#111827] dark:text-[#8FA8FF]">
            <Sparkles size={14} />
            Account Preferences
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Customize your CVision AI experience, notifications, and
            account preferences.
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          {/* Main settings */}
          <div className="space-y-6">
            {/* Notifications */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-colors dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20">
              <div className="border-b border-slate-100 p-6 dark:border-slate-800 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5] dark:bg-[#172554] dark:text-[#8FA8FF]">
                    <Bell size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black">
                      Notifications
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Choose which updates you want to receive from
                      CVision AI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Email */}
                <div className="flex items-center justify-between gap-5 p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Mail size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-black">
                        Email notifications
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Receive important account updates and activity
                        notifications.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleNotification("email")}
                    aria-label="Toggle email notifications"
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      notifications.email
                        ? "bg-[#3157D5]"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        notifications.email ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Analysis */}
                <div className="flex items-center justify-between gap-5 p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-black">
                        CV analysis updates
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Get notified when your CV analysis is ready.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleNotification("analysis")}
                    aria-label="Toggle CV analysis notifications"
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      notifications.analysis
                        ? "bg-[#3157D5]"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        notifications.analysis
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Jobs */}
                <div className="flex items-center justify-between gap-5 p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                      <Bell size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-black">
                        Job match updates
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Receive updates about jobs matching your CV.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleNotification("jobMatches")}
                    aria-label="Toggle job match notifications"
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      notifications.jobMatches
                        ? "bg-[#3157D5]"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        notifications.jobMatches
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 p-6 dark:border-slate-800 sm:p-7">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#3157D5] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#2849B7]"
                >
                  <CheckCircle2 size={17} />
                  Save Preferences
                </button>
              </div>
            </section>

            {/* Appearance */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-colors dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20">
              <div className="border-b border-slate-100 p-6 dark:border-slate-800 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {theme === "dark" ? (
                      <Moon size={22} />
                    ) : (
                      <Sun size={22} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-black">
                      Appearance
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Choose how CVision AI should look.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Light */}
                  <button
                    type="button"
                    onClick={() => handleAppearance("light")}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      theme === "light"
                        ? "border-[#3157D5] bg-[#EAF0FF]"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-[#0F172A] dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="mb-4 flex h-24 items-end rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700">
                      <div className="w-full">
                        <div className="mb-2 h-2 w-1/3 rounded-full bg-slate-200" />
                        <div className="h-2 w-2/3 rounded-full bg-[#EAF0FF]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black">
                          Light
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Clean and bright
                        </p>
                      </div>

                      {theme === "light" && (
                        <CheckCircle2
                          size={19}
                          className="text-[#3157D5]"
                        />
                      )}
                    </div>
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => handleAppearance("dark")}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      theme === "dark"
                        ? "border-[#3157D5] bg-[#172554]"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-[#0F172A] dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="mb-4 flex h-24 items-end rounded-xl bg-[#0B1220] p-3 shadow-sm">
                      <div className="w-full">
                        <div className="mb-2 h-2 w-1/3 rounded-full bg-slate-700" />
                        <div className="h-2 w-2/3 rounded-full bg-[#3157D5]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black">
                          Dark
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Easy on the eyes
                        </p>
                      </div>

                      {theme === "dark" && (
                        <CheckCircle2
                          size={19}
                          className="text-[#8FA8FF]"
                        />
                      )}
                    </div>
                  </button>
                </div>

                {theme === "dark" && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#3157D5]/30 bg-[#172554]/40 px-4 py-3 text-xs font-semibold text-[#AFC0FF]">
                    <Moon size={17} />
                    Dark mode is active across CVision AI.
                  </div>
                )}
              </div>
            </section>

            {/* Security */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-colors dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20">
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Shield size={22} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-black">
                      Security
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Manage your password and account security.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(
                        "Password management will be connected when the secure reset flow is added."
                      );
                      setError("");
                    }}
                    className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#BFD0FF] hover:bg-[#F8FAFF] dark:border-slate-700 dark:hover:border-[#3157D5] dark:hover:bg-[#0F172A]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Lock size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-black">
                          Change Password
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Update your account password
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={19}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#3157D5]"
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="rounded-3xl border border-red-200 bg-red-50 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-colors dark:border-red-900/30 dark:bg-red-950/20 dark:shadow-black/20">
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <AlertTriangle size={22} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-black text-red-700 dark:text-red-400">
                      Danger Zone
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-400">
                      Irreversible account actions.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={openDeleteModal}
                    className="group flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-left transition hover:border-red-300 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:hover:border-red-700 dark:hover:bg-red-950/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        <Trash2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-black text-red-700 dark:text-red-400">
                          Delete Account
                        </p>

                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={19}
                      className="text-red-400 transition group-hover:translate-x-1 group-hover:text-red-600"
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right panel */}
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-3xl bg-[#0B1220] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3157D5]">
                <SettingsIcon size={22} />
              </div>

              <h2 className="mt-6 text-xl font-black">
                CVision AI Settings
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Your preferences help us make your CV analysis and job
                matching experience more comfortable and useful.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <CheckCircle2
                    size={17}
                    className="text-[#7FA1FF]"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    Secure authentication
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <CheckCircle2
                    size={17}
                    className="text-[#7FA1FF]"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    Private CV analysis
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <CheckCircle2
                    size={17}
                    className="text-[#7FA1FF]"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    Personalized job matching
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-colors dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF0FF] text-[#3157D5] dark:bg-[#172554] dark:text-[#8FA8FF]">
                  <Mail size={20} />
                </div>

                <div>
                  <h3 className="font-black">Need Help?</h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    CVision AI support
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                If something is not working as expected, you can
                review your account settings or contact support.
              </p>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#F8FAFC] px-4 py-3 text-xs font-bold text-slate-600 dark:bg-[#0F172A] dark:text-slate-300">
                <Shield size={15} />
                Your account remains protected.
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.15)] dark:bg-[#111827] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="delete-modal-title"
                className="text-xl font-black text-red-700 dark:text-red-400"
              >
                Delete Account
              </h2>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p className="font-semibold">
                This action is permanent and cannot be undone.
              </p>

              <p>
                Deleting your account will permanently remove:
              </p>

              <ul className="ml-4 list-disc space-y-1">
                <li>Your account and profile information</li>
                <li>All uploaded CVs and analyses</li>
                <li>All saved jobs and match results</li>
              </ul>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="delete-name"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  Account Name (required)
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="delete-name"
                    type="text"
                    value={deleteName}
                    onChange={(e) => {
                      setDeleteName(e.target.value);
                      setDeleteError("");
                    }}
                    placeholder="Enter your account name"
                    autoComplete="name"
                    maxLength={100}
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#3157D5] focus:bg-white focus:ring-4 focus:ring-[#3157D5]/10 dark:border-slate-700 dark:bg-[#0F172A] dark:focus:border-[#3157D5]"
                    disabled={deleting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="delete-password"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  Current Password (required)
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError("");
                    }}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#3157D5] focus:bg-white focus:ring-4 focus:ring-[#3157D5]/10 dark:border-slate-700 dark:bg-[#0F172A] dark:focus:border-[#3157D5]"
                    disabled={deleting}
                  />
                </div>
              </div>

              {deleteError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deleting ||
                  !deleteName.trim() ||
                  !deletePassword
                }
                aria-busy={deleting}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={18}
                      className="mr-2 animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete Account Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}