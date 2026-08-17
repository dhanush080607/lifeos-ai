import type {
  ContextResponse,
  TimePlan,
} from "../types/context";

import { getDeadlineStatus } from "../lib/deadline";
import { getDailyIntelligence } from "../lib/dailyIntelligence";

interface TodayDashboardProps {
  result: ContextResponse;
  timePlan: TimePlan;
  onTaskComplete: (taskIndex: number) => void;
}

function TodayDashboard({
  result,
  timePlan,
  onTaskComplete,
}: TodayDashboardProps) {
  /*
   * ============================================
   * DAILY INTELLIGENCE
   * ============================================
   */

  const intelligence =
    getDailyIntelligence(result.tasks);

  /*
   * ============================================
   * DEADLINE LABEL
   * ============================================
   *
   * getDeadlineStatus() returns only a status.
   * Therefore we create the display label here.
   */

  const getDeadlineLabel = (
    status: ReturnType<typeof getDeadlineStatus>
  ): string => {
    switch (status) {
      case "today":
        return "Due today";

      case "tomorrow":
        return "Due tomorrow";

      case "upcoming":
        return "Upcoming";

      case "unspecified":
        return "";

      default:
        return "";
    }
  };

  /*
   * ============================================
   * DEADLINE COLOR
   * ============================================
   */

  const getDeadlineColor = (
    status: ReturnType<typeof getDeadlineStatus>
  ): string => {
    switch (status) {
      case "today":
        return "text-orange-400";

      case "tomorrow":
        return "text-yellow-400";

      case "upcoming":
        return "text-cyan-400";

      case "unspecified":
        return "text-gray-500";

      default:
        return "text-gray-500";
    }
  };

  /*
   * ============================================
   * RETURN
   * ============================================
   */

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

        <p className="mt-2 text-gray-500">
          Your current priorities, deadlines,
          workload, and focused plan.
        </p>
      </div>

      {/* ======================================
          DAILY INTELLIGENCE
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Completion */}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-500">
            Completion
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {intelligence.completionPercentage}%
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {intelligence.completedTasks} of{" "}
            {intelligence.totalTasks} tasks
          </p>
        </div>

        {/* Remaining Time */}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-500">
            Remaining Work
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {intelligence.remainingMinutes}
            <span className="ml-1 text-sm font-normal text-gray-500">
              min
            </span>
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {intelligence.remainingTasks} tasks remaining
          </p>
        </div>

        {/* Urgent Work */}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-500">
            Urgent Work
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {intelligence.todayTasks}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            deadline today
          </p>
        </div>

        {/* Tomorrow */}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-500">
            Tomorrow
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {intelligence.tomorrowTasks}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            upcoming tomorrow
          </p>
        </div>

      </div>

      {/* ======================================
          PROGRESS
      ====================================== */}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-sm text-gray-400">
              Today's Progress
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {intelligence.completionPercentage}%
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {intelligence.completedTasks} /{" "}
            {intelligence.totalTasks} completed
          </p>

        </div>

        <div
          className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={
            intelligence.completionPercentage
          }
        >
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
            style={{
              width: `${intelligence.completionPercentage}%`,
            }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {intelligence.remainingTasks} task
          {intelligence.remainingTasks === 1
            ? ""
            : "s"}{" "}
          remaining
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

        <p className="mt-3 leading-relaxed text-gray-400">
          {result.reasoning}
        </p>

      </div>

      {/* ======================================
          TODAY'S TASKS
      ====================================== */}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-xl font-semibold text-white">
              Today's Tasks
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Click a task to mark it complete.
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {intelligence.completedTasks}/
            {intelligence.totalTasks}
          </span>

        </div>

        <div className="mt-5 space-y-3">

          {result.tasks.length > 0 ? (
            result.tasks.map((task, index) => {

              const deadlineStatus =
                getDeadlineStatus(
                  task.deadline ?? ""
                );

              const deadlineLabel =
                getDeadlineLabel(
                  deadlineStatus
                );

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    onTaskComplete(index)
                  }
                  aria-pressed={task.completed}
                  className={`group flex w-full items-center justify-between rounded-xl border border-transparent bg-black/30 p-4 text-left transition hover:border-cyan-400/20 hover:bg-white/10 ${
                    task.completed
                      ? "opacity-60"
                      : ""
                  }`}
                >

                  {/* Task information */}

                  <div className="flex min-w-0 items-center gap-3">

                    {/* Completion */}

                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${
                        task.completed
                          ? "border-green-400/40 bg-green-400/10 text-green-400"
                          : "border-white/20 text-gray-500 group-hover:border-cyan-400/40 group-hover:text-cyan-400"
                      }`}
                    >
                      {task.completed
                        ? "✓"
                        : "○"}
                    </span>

                    {/* Details */}

                    <div className="min-w-0">

                      <p
                        className={`break-words ${
                          task.completed
                            ? "text-gray-500 line-through"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">

                        <span className="text-sm text-gray-500">
                          {task.estimated_minutes} min
                        </span>

                        {deadlineStatus !==
                          "unspecified" && (
                          <>
                            <span className="text-gray-700">
                              •
                            </span>

                            <span
                              className={`text-xs ${getDeadlineColor(
                                deadlineStatus
                              )}`}
                            >
                              {deadlineLabel}
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* Priority */}

                  <span
                    className={`ml-4 shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      task.priority === "high"
                        ? "border-red-400/20 bg-red-400/10 text-red-400"
                        : task.priority === "medium"
                          ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-400"
                          : "border-green-400/20 bg-green-400/10 text-green-400"
                    }`}
                  >
                    {task.priority}
                  </span>

                </button>
              );
            })
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-gray-500">
                No tasks available.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ======================================
          UPCOMING DEADLINES
      ====================================== */}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-xl font-semibold text-white">
              Upcoming Deadlines
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Important dates extracted from
              your context.
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {result.deadlines.length}
          </span>

        </div>

        <div className="mt-5 space-y-3">

          {result.deadlines.length > 0 ? (
            result.deadlines.map(
              (deadline, index) => {

                const deadlineStatus =
                  getDeadlineStatus(
                    deadline.deadline ?? ""
                  );

                const deadlineLabel =
                  getDeadlineLabel(
                    deadlineStatus
                  );

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 rounded-xl bg-black/30 p-4"
                  >

                    <div className="min-w-0">

                      <p className="break-words text-gray-300">
                        {deadline.title}
                      </p>

                      <p
                        className={`mt-1 text-xs ${getDeadlineColor(
                          deadlineStatus
                        )}`}
                      >
                        {deadlineLabel}
                      </p>

                    </div>

                    <span className="shrink-0 text-sm text-cyan-400">
                      {deadline.deadline}
                    </span>

                  </div>
                );
              }
            )
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-gray-500">
                No upcoming deadlines.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ======================================
          TONIGHT'S PLAN
      ====================================== */}

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
              Tonight's Plan
            </p>

            <h3 className="mt-2 text-xl font-semibold text-white">
              {timePlan.plannedMinutes} /{" "}
              {timePlan.availableMinutes} minutes planned
            </h3>

          </div>

          {timePlan.availableMinutes > 0 && (
            <span className="shrink-0 text-sm text-gray-400">
              {Math.round(
                (timePlan.plannedMinutes /
                  timePlan.availableMinutes) *
                  100
              )}
              %
            </span>
          )}

        </div>

        {/* No available time */}

        {timePlan.availableMinutes === 0 && (
          <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">

            <p className="text-sm font-medium text-yellow-400">
              No available time specified.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Set your available time above
              to generate a focused plan.
            </p>

          </div>
        )}

        {/* Planned tasks */}

        {timePlan.availableMinutes > 0 &&
          timePlan.plannedTasks.length > 0 && (
            <div className="mt-5 space-y-3">

              {timePlan.plannedTasks.map(
                (plannedTask) => {

                  const task =
                    result.tasks[
                      plannedTask.taskIndex
                    ];

                  if (!task) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        plannedTask.taskIndex
                      }
                      className="rounded-xl bg-black/30 p-4"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <p className="break-words text-white">
                            {task.title}
                          </p>

                          {task.deadline &&
                            task.deadline !==
                              "Not specified" && (
                              <p className="mt-1 text-xs text-gray-500">
                                Deadline:{" "}
                                {task.deadline}
                              </p>
                            )}

                        </div>

                        <span className="shrink-0 text-sm font-medium text-cyan-400">
                          {plannedTask.plannedMinutes} min
                        </span>

                      </div>

                      {/* Partial task */}

                      {plannedTask.partial && (
                        <div className="mt-3 rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-3">

                          <p className="text-sm text-yellow-400">
                            Partial task
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {plannedTask.fullTaskMinutes -
                              plannedTask.plannedMinutes}{" "}
                            minutes remaining after
                            this plan.
                          </p>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* No tasks fit */}

        {timePlan.availableMinutes > 0 &&
          timePlan.plannedTasks.length === 0 &&
          result.tasks.some(
            (task) => !task.completed
          ) && (
            <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">

              <p className="text-sm font-medium text-yellow-400">
                ⚠️ No tasks fit into the available
                time.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Increase your available time or
                complete some tasks first.
              </p>

            </div>
          )}

        {/* Overflow */}

        {timePlan.overflowMinutes > 0 && (
          <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">

            <p className="text-sm font-medium text-yellow-400">
              ⚠️ {timePlan.overflowMinutes} minutes
              of work remain.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              LifeOS prioritized deadline
              urgency, priority, and task
              duration.
            </p>

          </div>
        )}

        {/* Everything fits */}

        {timePlan.availableMinutes > 0 &&
          timePlan.overflowMinutes === 0 &&
          timePlan.plannedTasks.length > 0 && (
            <div className="mt-5 rounded-xl border border-green-400/20 bg-green-400/5 p-4">

              <p className="text-sm text-green-400">
                ✓ All remaining tasks fit within
                your available time.
              </p>

            </div>
          )}

      </div>

    </section>
  );
}

export default TodayDashboard;