import { useState } from "react";

interface ContextInputProps {
  onAnalyze: (text: string) => void;
  loading: boolean;
}

function ContextInput({ onAnalyze, loading }: ContextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim() || loading) return;

    onAnalyze(text);
  };

  return (
    <section className="w-full max-w-3xl">
      <label
        htmlFor="context"
        className="mb-3 block text-sm font-medium text-gray-300"
      >
        What's on your mind?
      </label>

      <textarea
        id="context"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Tell LifeOS what you need to handle..."
        rows={7}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400/50"
      />

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="mt-4 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Analyzing..." : "Analyze my situation"}
      </button>
    </section>
  );
}

export default ContextInput;