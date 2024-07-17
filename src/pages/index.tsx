import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task } from "../types/index.js";
import { ChangeEvent, useEffect, useState } from "react";
import { on } from "events";

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
      <div className="grid grid-cols-4 gap-4 px-4 py-2 font-semibold border-b-2 border-slate-200 pb-2">
        <p>Name</p>
        <p className="flex items-center justify-center">Hour</p>
        <p className="flex items-center justify-center">State</p>
        <p className="flex items-center justify-center">Delete</p>
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
  const [taskState, setTaskState] = useState(task.state);

  let time = task.created_at.slice(0, 5);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    await fetch("/api/delete-task", {
      method: "POST",
      body: JSON.stringify({ id: task.id }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => queryClient.invalidateQueries());
  };

  useEffect(() => {
    const updateTask = async () =>
      await fetch("/api/update-task", {
        method: "POST",
        body: JSON.stringify({ id: task.id, state: taskState }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => queryClient.invalidateQueries());

    updateTask();
  }, [queryClient, task.id, taskState]);

  return (
    <li className="px-4  hover:bg-slate-300 grid grid-cols-4 gap-4 py-1">
      <div className="flex items-center ">{task.title}</div>
      <div className="flex items-center justify-center">{time}</div>
      <div className="flex items-center justify-center">
        <select
          className="p-1 rounded-lg"
          value={taskState}
          onChange={(e) => {
            setTaskState(parseInt(e.target.value) as 0 | 1 | 2);
          }}
        >
          <option value="0">Todo</option>
          <option value="1">Doing</option>
          <option value="2">Done</option>
        </select>
      </div>
      <div className="flex items-center justify-center">
        <button
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          onClick={handleDelete}
        >
          -
        </button>
      </div>
    </li>
  );
}

function AddTaskForm() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!name || name.length > 32) {
      alert("Task name must be between 1 and 32 characters");
      setName("");
      return;
    }
    await fetch("/api/add-task", {
      method: "POST",
      body: JSON.stringify({ title: name }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(() => setName(""))
      .then(() => queryClient.invalidateQueries());
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
