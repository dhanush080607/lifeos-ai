import type { ContextResponse } from "../types/context";

interface AnalysisResultProps {
  result: ContextResponse;
  onTaskComplete: (taskIndex: number) => void;
}

function AnalysisResult({
  result,
  onTaskComplete,
}: AnalysisResultProps) {
  const completedTasks = result.tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = result.tasks.length;

  return (
    <section className="w-full max-w-3xl space-y-5">
      {/* Next Action */}
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

      {/* Goals */}
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

      {/* Tasks */}
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
                  {/* Complete button */}
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

      {/* Deadlines */}
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

      {/* Available Time */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">
          Available Time
        </h3>

        <p className="mt-3 text-gray-400">
          {result.available_time}
        </p>
      </div>
    </section>
  );
}

export default AnalysisResult;