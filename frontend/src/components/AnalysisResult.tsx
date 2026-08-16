import type { ContextResponse } from "../types/context";

interface TimePlan {
  availableMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  overflowMinutes: number;
  plannedTasks: {
    taskIndex: number;
    plannedMinutes: number;
    fullTaskMinutes: number;
    partial: boolean;
  }[];
}

interface AnalysisResultProps {
  result: ContextResponse;
  onTaskComplete: (taskIndex: number) => void;

  // Shared planning state from App.tsx
  hasAvailableTime: boolean;
  planningTime: string;
  timePlan: TimePlan;

  setAvailableTime: (time: string) => void;
}

function AnalysisResult({
  result,
  onTaskComplete,
  hasAvailableTime,
  planningTime,
  timePlan,
  setAvailableTime,
}: AnalysisResultProps) {
  const completedTasks = result.tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = result.tasks.length;

  return (
    <section className="w-full max-w-3xl space-y-5">

      {/* ======================================
          NEXT ACTION
      ====================================== */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          Your next action
        </p>

        <h2 className="mt-3 text-2xl font-bold text-white">
          {result.recommended_action}
        </h2>

        <p className="mt-3 text-gray-400">
          {result.reasoning}
        </p>
      </div>

      {/* ======================================
          GOALS
      ====================================== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">
          Goals
        </h3>

        {result.goals.length > 0 ? (
          <ul className="mt-3 space-y-2 text-gray-300">
            {result.goals.map((goal, index) => (
              <li key={index}>• {goal}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gray-500">
            No specific goals identified.
          </p>
        )}
      </div>

      {/* ======================================
          TASKS
      ====================================== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Tasks
          </h3>

          <span className="text-sm text-gray-500">
            {completedTasks}/{totalTasks} completed
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {result.tasks.length > 0 ? (
            result.tasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-xl p-4 transition ${
                  task.completed
                    ? "bg-green-400/5 opacity-60"
                    : "bg-black/30"
                }`}
              >
                <div className="flex items-center gap-4">

                  {/* Completion button */}
                  <button
                    type="button"
                    onClick={() => onTaskComplete(index)}
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} as incomplete`
                        : `Mark ${task.title} as complete`
                    }
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                      task.completed
                        ? "border-green-400 bg-green-400 text-black"
                        : "border-gray-600 hover:border-cyan-400"
                    }`}
                  >
                    {task.completed && "✓"}
                  </button>

                  {/* Task information */}
                  <div>
                    <p
                      className={`font-medium transition ${
                        task.completed
                          ? "text-gray-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {task.estimated_minutes} minutes
                    </p>
                  </div>
                </div>

                {/* Priority */}
                <span
                  className={`rounded-full px-3 py-1 text-xs uppercase ${
                    task.priority === "high"
                      ? "bg-red-400/10 text-red-400"
                      : task.priority === "medium"
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "bg-green-400/10 text-green-400"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No actionable tasks identified.
            </p>
          )}
        </div>
      </div>

      {/* ======================================
          DEADLINES
      ====================================== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">
          Deadlines
        </h3>

        {result.deadlines.length > 0 ? (
          <div className="mt-4 space-y-3">
            {result.deadlines.map((deadline, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-black/30 p-4"
              >
                <span className="text-gray-300">
                  {deadline.title}
                </span>

                <span className="text-cyan-400">
                  {deadline.deadline}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">
            No deadlines identified.
          </p>
        )}
      </div>

      {/* ======================================
          AVAILABLE TIME
      ====================================== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Available Time
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Tell LifeOS how much time you have so it
              can build your plan.
            </p>
          </div>

          <span className="text-2xl">
            ⏱
          </span>
        </div>

        {/* Missing time warning */}
        {!hasAvailableTime && !planningTime && (
          <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
            <p className="text-sm text-yellow-400">
              ⚠️ Available time was not specified.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Choose how much time you have available.
            </p>
          </div>
        )}

        {/* Time buttons */}
        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() =>
              setAvailableTime("15 minutes")
            }
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              planningTime === "15 minutes"
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                : "border-white/10 text-gray-300 hover:border-cyan-400/40 hover:text-cyan-400"
            }`}
          >
            15 min
          </button>

          <button
            type="button"
            onClick={() =>
              setAvailableTime("30 minutes")
            }
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              planningTime === "30 minutes"
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                : "border-white/10 text-gray-300 hover:border-cyan-400/40 hover:text-cyan-400"
            }`}
          >
            30 min
          </button>

          <button
            type="button"
            onClick={() =>
              setAvailableTime("60 minutes")
            }
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              planningTime === "60 minutes"
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                : "border-white/10 text-gray-300 hover:border-cyan-400/40 hover:text-cyan-400"
            }`}
          >
            1 hour
          </button>

          {/* Original */}
          <button
            type="button"
            onClick={() => {
              if (hasAvailableTime) {
                setAvailableTime(
                  result.available_time
                );
              }
            }}
            disabled={!hasAvailableTime}
            className="rounded-xl border border-cyan-400/20 px-4 py-2 text-sm text-cyan-400 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Original
          </button>
        </div>

        {/* Current planning time */}
        <p className="mt-5 text-gray-400">
          Current planning time:{" "}
          <span className="font-medium text-white">
            {planningTime || "Not specified"}
          </span>
        </p>
      </div>

      {/* ======================================
          TONIGHT'S PLAN
      ====================================== */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
              Tonight's Plan
            </p>

            <h3 className="mt-2 text-xl font-semibold text-white">
              {timePlan.plannedMinutes} of{" "}
              {timePlan.availableMinutes} minutes planned
            </h3>
          </div>

          <span className="text-2xl">
            ⏱
          </span>
        </div>

        {/* Planned tasks */}
        {timePlan.plannedTasks.length > 0 ? (
          <div className="mt-5 space-y-3">

            {timePlan.plannedTasks.map(
              (plannedTask) => {
                const task =
                  result.tasks[
                    plannedTask.taskIndex
                  ];

                if (!task) return null;

                return (
                  <div
                    key={plannedTask.taskIndex}
                    className="rounded-xl bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between">

                      <div>
                        <p className="font-medium text-white">
                          {task.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {plannedTask.plannedMinutes} minutes
                        </p>
                      </div>

                      <span
                        className={
                          plannedTask.partial
                            ? "text-yellow-400"
                            : "text-cyan-400"
                        }
                      >
                        {plannedTask.partial
                          ? "Partial"
                          : "Planned"}
                      </span>
                    </div>

                    {/* Partial task */}
                    {plannedTask.partial && (
                      <p className="mt-3 text-sm text-yellow-400">
                        {plannedTask.fullTaskMinutes -
                          plannedTask.plannedMinutes}{" "}
                        minutes remaining after this
                        session.
                      </p>
                    )}
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <p className="mt-5 text-gray-500">
            No tasks fit into the available time.
          </p>
        )}

        {/* Overflow */}
        {timePlan.overflowMinutes > 0 && (
          <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
            <p className="text-sm text-yellow-400">
              ⚠️ {timePlan.overflowMinutes} minutes
              of work remain after tonight's plan.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              LifeOS has prioritized the highest-priority
              work first.
            </p>
          </div>
        )}

        {/* Everything fits */}
        {timePlan.overflowMinutes === 0 &&
          timePlan.plannedTasks.length > 0 && (
            <div className="mt-5 rounded-xl border border-green-400/20 bg-green-400/5 p-4">
              <p className="text-sm text-green-400">
                ✓ Your planned tasks fit within your
                available time.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

export default AnalysisResult;