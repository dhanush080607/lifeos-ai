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

/*
 * ============================================
 * APP
 * ============================================
 */

function App() {
  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  const [result, setResult] =
    useState<ContextResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ==========================================
   * PLANNING STATE
   * ==========================================
   */

  const planState =
    useLifeOSPlan(result);

  /*
   * ==========================================
   * LOAD SAVED STATE
   * ==========================================
   */

  useEffect(() => {
    const savedState = loadLifeOSState();

    if (savedState) {
      setResult(savedState);
    }
  }, []);

  /*
   * ==========================================
   * SAVE STATE
   * ==========================================
   */

  useEffect(() => {
    if (result) {
      saveLifeOSState(result);
    }
  }, [result]);

  /*
   * ==========================================
   * DEADLINE SCORE
   * ==========================================
   *
   * Lower number = more urgent.
   *
   * 0 = overdue / today
   * 1 = tomorrow
   * 2 = this week
   * 3 = future
   * 4 = no deadline
   */

  const getDeadlineScore = (
    deadline?: string
  ): number => {
    if (!deadline) {
      return 4;
    }

    const normalized =
      deadline
        .toLowerCase()
        .trim();

    if (
      !normalized ||
      normalized === "not specified"
    ) {
      return 4;
    }

    /*
     * Overdue / today
     */

    if (
      normalized.includes("overdue") ||
      normalized.includes("yesterday") ||
      normalized.includes("today") ||
      normalized.includes("tonight")
    ) {
      return 0;
    }

    /*
     * Tomorrow
     */

    if (
      normalized.includes("tomorrow")
    ) {
      return 1;
    }

    /*
     * Weekdays
     */

    const weekdayPattern =
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/;

    if (
      weekdayPattern.test(normalized)
    ) {
      return 2;
    }

    /*
     * Specific month/date
     */

    const monthPattern =
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/;

    if (
      monthPattern.test(normalized)
    ) {
      return 3;
    }

    /*
     * Numeric dates
     *
     * Examples:
     * 2026-08-20
     * 08/20
     * 20/08/2026
     */

    if (
      /\d{1,4}[-/]\d{1,2}(?:[-/]\d{1,4})?/.test(
        normalized
      )
    ) {
      return 3;
    }

    /*
     * Generic future wording
     */

    if (
      normalized.includes("next")
    ) {
      return 3;
    }

    return 4;
  };

  /*
   * ==========================================
   * PRIORITY SCORE
   * ==========================================
   *
   * Lower number = higher priority.
   */

  const getPriorityScore = (
    priority: ContextResponse["tasks"][number]["priority"]
  ): number => {
    switch (priority) {
      case "high":
        return 1;

      case "medium":
        return 2;

      case "low":
        return 3;

      default:
        return 4;
    }
  };

  /*
   * ==========================================
   * GET NEXT ACTION
   * ==========================================
   *
   * LifeOS considers:
   *
   * 1. Deadline urgency
   * 2. Priority
   * 3. Shorter task
   * 4. Original order
   */

  const getNextAction = (
    currentResult: ContextResponse
  ) => {
    const incompleteTasks =
      currentResult.tasks.filter(
        (task) => !task.completed
      );

    /*
     * ========================================
     * ALL TASKS COMPLETED
     * ========================================
     */

    if (
      incompleteTasks.length === 0
    ) {
      return {
        action:
          "All tasks completed!",

        reasoning:
          "You have completed all the tasks LifeOS identified. Great work!",
      };
    }

    /*
     * ========================================
     * SORT TASKS
     * ========================================
     */

    const sortedTasks =
      incompleteTasks
        .map((task, index) => ({
          task,
          originalIndex: index,
        }))
        .sort((a, b) => {
          /*
           * 1. Deadline
           */

          const deadlineA =
            getDeadlineScore(
              a.task.deadline
            );

          const deadlineB =
            getDeadlineScore(
              b.task.deadline
            );

          if (
            deadlineA !== deadlineB
          ) {
            return (
              deadlineA -
              deadlineB
            );
          }

          /*
           * 2. Priority
           */

          const priorityA =
            getPriorityScore(
              a.task.priority
            );

          const priorityB =
            getPriorityScore(
              b.task.priority
            );

          if (
            priorityA !== priorityB
          ) {
            return (
              priorityA -
              priorityB
            );
          }

          /*
           * 3. Shorter task
           */

          if (
            a.task.estimated_minutes !==
            b.task.estimated_minutes
          ) {
            return (
              a.task.estimated_minutes -
              b.task.estimated_minutes
            );
          }

          /*
           * 4. Original order
           */

          return (
            a.originalIndex -
            b.originalIndex
          );
        });

    const nextTask =
      sortedTasks[0].task;

    /*
     * ========================================
     * DEADLINE TEXT
     * ========================================
     */

    const deadlineText =
      nextTask.deadline &&
      nextTask.deadline !==
        "Not specified"
        ? ` It has a deadline of ${nextTask.deadline}.`
        : "";

    /*
     * ========================================
     * RETURN NEXT ACTION
     * ========================================
     */

    return {
      action:
        nextTask.title,

      reasoning:
        `This is currently your most urgent incomplete task. It is estimated to take ${nextTask.estimated_minutes} minutes.${deadlineText}`,
    };
  };

  /*
   * ==========================================
   * ANALYZE USER CONTEXT
   * ==========================================
   */

  const handleAnalyze = async (
    text: string
  ) => {
    try {
      setLoading(true);
      setError("");

      const data =
        await analyzeContext(text);

      /*
       * Gemini creates tasks.
       *
       * React owns completion state.
       */

      const resultWithState:
        ContextResponse = {
          ...data,

          tasks: data.tasks.map(
            (task) => ({
              ...task,
              completed: false,
            })
          ),
        };

      /*
       * Calculate the correct next action
       * immediately after AI analysis.
       */

      const nextAction =
        getNextAction(
          resultWithState
        );

      setResult({
        ...resultWithState,

        recommended_action:
          nextAction.action,

        reasoning:
          nextAction.reasoning,
      });

      /*
       * Remove planning override from
       * previous analysis.
       */

      planState.resetAvailableTime();

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
   * ==========================================
   * HANDLE TASK COMPLETION
   * ==========================================
   */

  const handleTaskComplete = (
    taskIndex: number
  ) => {
    if (!result) {
      return;
    }

    /*
     * Toggle selected task.
     */

    const updatedTasks =
      result.tasks.map(
        (task, index) =>
          index === taskIndex
            ? {
                ...task,
                completed:
                  !task.completed,
              }
            : task
      );

    /*
     * Create updated result.
     */

    const updatedResult:
      ContextResponse = {
        ...result,

        tasks: updatedTasks,
      };

    /*
     * Recalculate next action.
     */

    const nextAction =
      getNextAction(
        updatedResult
      );

    /*
     * Update application state.
     *
     * Because the planner receives `result`,
     * completing a task automatically causes
     * the time plan to recalculate.
     */

    setResult({
      ...updatedResult,

      recommended_action:
        nextAction.action,

      reasoning:
        nextAction.reasoning,
    });
  };

  /*
   * ==========================================
   * RESET LIFEOS
   * ==========================================
   */

  const handleReset = () => {
    clearLifeOSState();

    setResult(null);

    setError("");

    planState.resetAvailableTime();
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

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
            Turn scattered thoughts, tasks,
            and deadlines into clear,
            prioritized actions.
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
            LifeOS is understanding your
            situation...
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
                onTaskComplete={
                  handleTaskComplete
                }
                hasAvailableTime={
                  planState.hasAvailableTime
                }
                planningTime={
                  planState.planningTime
                }
                timePlan={
                  planState.timePlan
                }
                setAvailableTime={
                  planState.setAvailableTime
                }
              />

            </div>

            {/* ==================================
                TODAY DASHBOARD
            ================================== */}

            <TodayDashboard
              result={result}
              timePlan={
                planState.timePlan
              }
              onTaskComplete={
                handleTaskComplete
              }
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