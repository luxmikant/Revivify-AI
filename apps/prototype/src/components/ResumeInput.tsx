import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";

interface Props {
  text: string;
  onTextChange: (t: string) => void;
  file: File | null;
  onFileChange: (f: File | null) => void;
  uploading: boolean;
}

export default function ResumeInput({
  text,
  onTextChange,
  file,
  onFileChange,
  uploading,
}: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFileChange(accepted[0]);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-violet-300">
        Resume
      </label>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragActive
            ? "border-violet-400 bg-violet-400/10"
            : "border-white/20 hover:border-violet-400/50"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <FileText size={18} className="text-violet-400" />
            <span>{file.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="p-0.5 rounded hover:bg-white/10"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400 text-sm">
            <Upload size={24} />
            {uploading ? (
              <span>Uploading…</span>
            ) : (
              <span>Drop PDF / DOCX or click to browse</span>
            )}
          </div>
        )}
      </div>

      {/* Or paste */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={6}
          placeholder="…or paste your resume text here"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>
    </div>
  );
}
