interface Props {
  text: string;
  onTextChange: (t: string) => void;
}

export default function JDInput({ text, onTextChange }: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-pink-300">
        Job Description
      </label>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={10}
        placeholder="Paste the job description here…"
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
      />
    </div>
  );
}
