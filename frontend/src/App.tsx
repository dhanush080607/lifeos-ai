import { useState } from "react";

import ContextInput from "./components/ContextInput";
import AnalysisResult from "./components/AnalysisResult";
import { analyzeContext } from "./lib/api";
import type { ContextResponse } from "./types/context";

function App() {
  const [result, setResult] = useState<ContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (text: string) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await analyzeContext(text);

      setResult(data);
    } catch (error) {
      console.error(error);
      setError("Unable to analyze your situation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
            AI Action System
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
            LifeOS
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
            Turn scattered thoughts, tasks, and deadlines into clear,
            prioritized actions.
          </p>
        </div>

        <ContextInput
          onAnalyze={handleAnalyze}
          loading={loading}
        />

        {error && (
          <p className="mt-6 text-red-400">
            {error}
          </p>
        )}

        {loading && (
          <p className="mt-8 text-gray-400">
            LifeOS is understanding your situation...
          </p>
        )}

        {result && (
          <div className="mt-12 w-full">
            <AnalysisResult result={result} />
          </div>
        )}
      </div>
    </main>
  );
}

export default App;