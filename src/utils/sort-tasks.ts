import { Task } from "@/types";

export default function sortTasks(
  tasks: Task[],
  sortSelection: string
): Task[] {
  tasks.sort((a, b) => {
    if (sortSelection === "created_at") {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortSelection === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortSelection === "state") {
      return a.state - b.state;
    } else {
      return a.id - b.id;
    }
  });
  return tasks;
}
