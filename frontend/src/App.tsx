import { useEffect, useState } from "react";

import ContextInput from "./components/ContextInput";
import AnalysisResult from "./components/AnalysisResult";
import TodayDashboard from "./components/TodayDashboard";

import { analyzeContext } from "./lib/api";
import {
  clearLifeOSState,
  loadLifeOSState,
  saveLifeOSState,
} from "./lib/storage";

import { useLifeOSPlan } from "./hooks/useLifeOSPlan";

import type { ContextResponse } from "./types/context";

function App() {
  const [result, setResult] =
    useState<ContextResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /*
   * ============================================
   * SHARED PLANNING STATE
   * ============================================
   *
   * IMPORTANT:
   * Hooks must never be called conditionally.
   *
   * Therefore this hook is called on every render.
   */
  const planState = useLifeOSPlan(result);

  /*
   * ============================================
   * LOAD SAVED LIFEOS STATE
   * ============================================
   */
  useEffect(() => {
    const savedState = loadLifeOSState();

    if (savedState) {
      setResult(savedState);
    }
  }, []);

  /*
   * ============================================
   * SAVE LIFEOS STATE
   * ============================================
   */
  useEffect(() => {
    if (result) {
      saveLifeOSState(result);
    }
  }, [result]);

  /*
   * ============================================
   * ANALYZE USER CONTEXT
   * ============================================
   */
  const handleAnalyze = async (text: string) => {
    try {
      setLoading(true);
      setError("");

      const data = await analyzeContext(text);

      /*
       * Gemini creates the tasks.
       *
       * React owns completion state.
       */
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

  /*
   * ============================================
   * GET NEXT ACTION
   * ============================================
   */
  const getNextAction = (
    currentResult: ContextResponse
  ) => {
    const incompleteTasks =
      currentResult.tasks.filter(
        (task) => !task.completed
      );

    /*
     * All tasks completed.
     */
    if (incompleteTasks.length === 0) {
      return {
        action: "All tasks completed!",
        reasoning:
          "You have completed all the tasks LifeOS identified. Great work!",
      };
    }

    /*
     * Priority ranking.
     */
    const priorityOrder = {
      high: 1,
      medium: 2,
      low: 3,
    };

    /*
     * Find the highest-priority incomplete task.
     */
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

  /*
   * ============================================
   * HANDLE TASK COMPLETION
   * ============================================
   */
  const handleTaskComplete = (
    taskIndex: number
  ) => {
    if (!result) return;

    const updatedTasks = result.tasks.map(
      (task, index) =>
        index === taskIndex
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
    );

    const updatedResult: ContextResponse = {
      ...result,
      tasks: updatedTasks,
    };

    /*
     * Recalculate the next action.
     */
    const nextAction =
      getNextAction(updatedResult);

    setResult({
      ...updatedResult,
      recommended_action: nextAction.action,
      reasoning: nextAction.reasoning,
    });
  };

  /*
   * ============================================
   * RESET LIFEOS
   * ============================================
   */
  const handleReset = () => {
    clearLifeOSState();

    setResult(null);

    setError("");

    /*
     * Reset planning override as well.
     */
    planState.resetAvailableTime();
  };

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center">

        {/* ======================================
            HEADER
        ====================================== */}
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
            AI Action System
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
            LifeOS
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
            Turn scattered thoughts, tasks, and
            deadlines into clear, prioritized
            actions.
          </p>
        </div>

        {/* ======================================
            INPUT
        ====================================== */}
        <ContextInput
          onAnalyze={handleAnalyze}
          loading={loading}
        />

        {/* ======================================
            ERROR
        ====================================== */}
        {error && (
          <div className="mt-6 w-full max-w-3xl rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* ======================================
            LOADING
        ====================================== */}
        {loading && (
          <div className="mt-8 text-gray-400">
            LifeOS is understanding your situation...
          </div>
        )}

        {/* ======================================
            RESULTS
        ====================================== */}
        {result && (
          <>
            {/* ==================================
                ANALYSIS RESULT
            ================================== */}
            <div className="mt-12 w-full">
              <AnalysisResult
                result={result}
                onTaskComplete={handleTaskComplete}
                hasAvailableTime={planState.hasAvailableTime}
                planningTime={planState.planningTime}
                timePlan={planState.timePlan}
                setAvailableTime={planState.setAvailableTime}
              />
            </div>

            {/* ==================================
                TODAY DASHBOARD
            ================================== */}
            <TodayDashboard
              result={result}
              timePlan={planState.timePlan}
            />

            {/* ==================================
                RESET
            ================================== */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-red-400/20 px-5 py-2 text-sm text-red-400 transition hover:bg-red-400/10"
              >
                Reset LifeOS
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default App;