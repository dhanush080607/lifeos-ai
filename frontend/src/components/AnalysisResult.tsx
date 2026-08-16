import type { ContextResponse } from "../types/context";

interface AnalysisResultProps {
  result: ContextResponse;
}

function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <section className="w-full max-w-3xl space-y-5">
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">
          Goals
        </h3>

        <ul className="mt-3 space-y-2 text-gray-300">
          {result.goals.map((goal, index) => (
            <li key={index}>• {goal}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">
          Tasks
        </h3>

        <div className="mt-4 space-y-3">
          {result.tasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl bg-black/30 p-4"
            >
              <div>
                <p className="font-medium text-white">
                  {task.title}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {task.estimated_minutes} minutes
                </p>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-gray-300">
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">
          Deadlines
        </h3>

        <div className="mt-4 space-y-3">
          {result.deadlines.map((deadline, index) => (
            <div
              key={index}
              className="flex justify-between rounded-xl bg-black/30 p-4"
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
      </div>
    </section>
  );
}

export default AnalysisResult;