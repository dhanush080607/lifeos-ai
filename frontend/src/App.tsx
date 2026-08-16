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

      // React owns task state.
      // Gemini only creates the tasks.
      const resultWithState: ContextResponse = {
        ...data,
        tasks: data.tasks.map((task) => ({
          ...task,
          completed: false,
        })),
      };

      setResult(resultWithState);
    } catch (error) {
      console.error(error);
      setError(
        "Unable to analyze your situation. Please check that the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const getNextAction = (currentResult: ContextResponse) => {
  const incompleteTasks = currentResult.tasks.filter(
    (task) => !task.completed
  );

  if (incompleteTasks.length === 0) {
    return {
      action: "All tasks completed!",
      reasoning:
        "You have completed all the tasks LifeOS identified. Great work!",
    };
  }

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const nextTask = [...incompleteTasks].sort(
    (a, b) =>
      priorityOrder[a.priority] -
      priorityOrder[b.priority]
  )[0];

  return {
    action: nextTask.title,
    reasoning: `This is your highest-priority incomplete task and is estimated to take ${nextTask.estimated_minutes} minutes.`,
  };
};

  const handleTaskComplete = (taskIndex: number) => {
  if (!result) return;

  const updatedTasks = result.tasks.map((task, index) =>
    index === taskIndex
      ? {
          ...task,
          completed: !task.completed,
        }
      : task
  );

  const updatedResult = {
    ...result,
    tasks: updatedTasks,
  };

  const nextAction = getNextAction(updatedResult);

  setResult({
    ...updatedResult,
    recommended_action: nextAction.action,
    reasoning: nextAction.reasoning,
  });
};

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        {/* Header */}
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

        {/* Input */}
        <ContextInput
          onAnalyze={handleAnalyze}
          loading={loading}
        />

        {/* Error */}
        {error && (
          <div className="mt-6 w-full max-w-3xl rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 text-gray-400">
            LifeOS is understanding your situation...
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-12 w-full">
            <AnalysisResult
              result={result}
              onTaskComplete={handleTaskComplete}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default App;