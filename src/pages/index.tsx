import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task } from "../types/index.js";
import { useState } from "react";

export default function Home() {
  return (
    <main className="h-screen bg-slate-200 p-10 flex flex-col gap-4">
      <h1 className="text-xl text-slate-700 font-bold">Cuadratic</h1>
      <TasksContainer />
      <AddTaskForm />
    </main>
  );
}

function TasksContainer() {
  const { data, isError, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/get-tasks"],
    queryFn: async () => {
      const response = await fetch("/api/get-tasks");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (!data || isError) {
    return <div>Error obteniendo las tareas</div>;
  }

  return (
    <div className="min-h-40 max-w-2xl  rounded-lg bg-white">
      <div className="grid grid-cols-3 gap-4 px-4 py-2">
        <p>Name</p>
        <p>Hour</p>
        <p>State</p>
      </div>
      <ol>
        {data.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </ol>
    </div>
  );
}

function Task({ task }: { task: Task }) {
  let time = task.created_at.slice(0, 5);
  let state = task.state === 0 ? "Todo" : task.state === 1 ? "Doing" : "Done";

  return (
    <li className="px-4 font-semibold hover:bg-slate-300 grid grid-cols-3 gap-4 py-1">
      <div>{task.title}</div>
      <div>{time}</div>
      <div>{state}</div>
    </li>
  );
}

function AddTaskForm() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = () => {
    if (!name || name.length > 32) {
      alert("Task name must be between 1 and 32 characters");
      setName("");
      return;
    }
    fetch("/api/add-task", {
      method: "POST",
      body: JSON.stringify({ title: name }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setName("");
    queryClient.invalidateQueries();
  };

  return (
    <form className="flex gap-2 max-w-2xl" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Task name"
        className="p-2 rounded-lg w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="submit"
        className="p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 w-40"
      >
        Add Task
      </button>
    </form>
  );
}
