import type { MissionStatus, TaskType } from "@/types/domain";
import { formatStatus, formatTaskType } from "@/lib/utils";

export function StatusBadge({
  status,
  taskType
}: {
  status?: MissionStatus;
  taskType?: TaskType;
}) {
  const className = status
    ? `badge badge--status badge--${status.replaceAll("_", "-")}`
    : `badge badge--task badge--${taskType}`;

  return (
    <span className={className}>
      {status ? formatStatus(status) : formatTaskType(taskType!)}
    </span>
  );
}
