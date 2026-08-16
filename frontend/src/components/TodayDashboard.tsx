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

interface TodayDashboardProps {
  result: ContextResponse;
  timePlan: TimePlan;
}

function TodayDashboard({
  result,
  timePlan,
}: TodayDashboardProps) {
  /*
   * ============================================
   * TASK PROGRESS
   * ============================================
   */
  const completedTasks = result.tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = result.tasks.length;

  const remainingTasks =
    totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  return (
    <section className="mt-12 w-full max-w-5xl space-y-6">

      {/* ======================================
          DASHBOARD HEADER
      ====================================== */}
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
          LifeOS Dashboard
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Today
        </h2>
      </div>

      {/* ======================================
          PROGRESS
      ====================================== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-gray-400">
              Today's Progress
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {progress}%
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {completedTasks} / {totalTasks} completed
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {remainingTasks} task
          {remainingTasks === 1 ? "" : "s"} remaining
        </p>
      </div>

      {/* ======================================
          NEXT ACTION
      ====================================== */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          Next Action
        </p>

        <h3 className="mt-3 text-2xl font-bold text-white">
          {result.recommended_action}
        </h3>

        <p className="mt-3 text-gray-400">
          {result.reasoning}
        </p>
      </div>

      {/* ======================================
          TODAY'S TASKS
      ====================================== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <div className="flex items-center justify-between">

          <h3 className="text-xl font-semibold text-white">
            Today's Tasks
          </h3>

          <span className="text-sm text-gray-500">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        <div className="mt-5 space-y-3">

          {result.tasks.length > 0 ? (
            result.tasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-xl bg-black/30 p-4 transition ${
                  task.completed
                    ? "opacity-60"
                    : ""
                }`}
              >

                <div className="flex items-center gap-3">

                  {/* Status */}
                  <span
                    className={
                      task.completed
                        ? "text-green-400"
                        : "text-gray-500"
                    }
                  >
                    {task.completed
                      ? "✓"
                      : "○"}
                  </span>

                  {/* Task */}
                  <div>
                    <p
                      className={
                        task.completed
                          ? "text-gray-500 line-through"
                          : "text-white"
                      }
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
                  className={`text-xs uppercase ${
                    task.priority === "high"
                      ? "text-red-400"
                      : task.priority === "medium"
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No tasks available.
            </p>
          )}
        </div>
      </div>

      {/* ======================================
          UPCOMING DEADLINES
      ====================================== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <h3 className="text-xl font-semibold text-white">
          Upcoming Deadlines
        </h3>

        <div className="mt-5 space-y-3">

          {result.deadlines.length > 0 ? (
            result.deadlines.map(
              (deadline, index) => (
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
              )
            )
          ) : (
            <p className="text-gray-500">
              No upcoming deadlines.
            </p>
          )}
        </div>
      </div>

      {/* ======================================
          TONIGHT'S PLAN
      ====================================== */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
            Tonight's Plan
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            {timePlan.plannedMinutes} /{" "}
            {timePlan.availableMinutes} minutes planned
          </h3>
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

                      <span className="text-white">
                        {task.title}
                      </span>

                      <span className="text-cyan-400">
                        {plannedTask.plannedMinutes} min
                      </span>
                    </div>

                    {/* Partial task */}
                    {plannedTask.partial && (
                      <p className="mt-2 text-sm text-yellow-400">
                        Partial task —{" "}
                        {plannedTask.fullTaskMinutes -
                          plannedTask.plannedMinutes}{" "}
                        minutes remaining.
                      </p>
                    )}
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
            <p className="text-sm text-yellow-400">
              ⚠️ No tasks fit into the available
              time.
            </p>
          </div>
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

export default TodayDashboard;