import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../services/api";

export default function UploadResume() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOCX, PNG, or JPG file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setFile(null);
      return;
    }

    setError("");
    setSuccess("");
    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select your CV first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post("/resumes/upload", formData);

      setSuccess(
        response.data.message || "CV uploaded successfully."
      );

      const resumeId = response.data.resume?._id;

      if (resumeId) {
        setTimeout(() => {
          navigate(`/analysis/${resumeId}`);
        }, 800);
      }
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to upload your CV. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-6 py-12 text-[#0B1220]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#3157D5]">
            CVision AI
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Upload your CV
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-[#64748B]">
            Upload your CV and let CVision AI extract your information
            before generating your career analysis.
          </p>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-[2rem] border-2 border-dashed p-10 text-center transition duration-300 sm:p-16 ${
            isDragging
              ? "scale-[1.01] border-[#3157D5] bg-blue-50"
              : "border-slate-300 bg-white hover:border-blue-300"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-[#3157D5]">
                <Upload size={34} />
              </div>

              <h2 className="mt-7 text-2xl font-black">
                Drop your CV here
              </h2>

              <p className="mt-3 text-sm text-[#64748B]">
                PDF, DOCX, PNG or JPG · Maximum 10 MB
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-7 rounded-2xl bg-[#3157D5] px-7 py-4 font-black text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-1 hover:bg-[#2649BA]"
              >
                Choose CV
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-[#3157D5]">
                <FileText size={34} />
              </div>

              <h2 className="mt-7 text-2xl font-black">
                CV ready
              </h2>

              <div className="mx-auto mt-6 flex max-w-xl items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="rounded-xl bg-white p-3 text-[#3157D5] shadow-sm">
                  <FileText size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#0B1220]">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-[#0B1220] transition hover:border-blue-200 hover:text-[#3157D5] disabled:opacity-50"
                >
                  Choose another
                </button>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3157D5] px-7 py-3 font-black text-white shadow-lg shadow-[#3157D5]/20 transition hover:-translate-y-0.5 hover:bg-[#2649BA] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Analyze my CV
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-600">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-black">01</p>
            <p className="mt-2 text-sm font-bold">Upload</p>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Your CV is securely uploaded.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-black">02</p>
            <p className="mt-2 text-sm font-bold">Extract</p>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              CVision AI extracts the document text.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-black">03</p>
            <p className="mt-2 text-sm font-bold">Analyze</p>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Your career analysis comes next.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}