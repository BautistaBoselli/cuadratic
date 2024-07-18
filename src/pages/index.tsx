import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task } from "../types/index.js";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { addHours, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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
        <p>Hour</p>
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
  const [editingName, setEditingName] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  let date = new Date(task.created_at);
  const time = formatDistanceToNow(date);

  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const response = await fetch("/api/delete-task", {
      method: "POST",
      body: JSON.stringify({ id: task.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      alert("Error deleting task");
    }
    queryClient.invalidateQueries();
  };

  const updateTask = async (e: ChangeEvent<HTMLSelectElement>) => {
    const response = await fetch("/api/update-task-state", {
      method: "POST",
      body: JSON.stringify({ id: task.id, state: e.target.value }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      alert("Error updating task");
    }
    queryClient.invalidateQueries();
  };

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setEditingName(false);
      const response = await fetch("/api/update-task-title", {
        method: "POST",
        body: JSON.stringify({ id: task.id, title: nameRef.current?.value }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        alert("Error updating task");
      }
      queryClient.invalidateQueries();
    }
  };

  return (
    <li className="px-4  hover:bg-slate-300 grid grid-cols-4 gap-4 py-1">
      {editingName ? (
        <input
          className="p-2 rounded-lg w-full"
          autoFocus
          defaultValue={task.title}
          ref={nameRef}
          onKeyDown={handleEnter}
          onBlur={() => setEditingName(false)}
        />
      ) : (
        <div
          className="flex items-center "
          onDoubleClick={() => setEditingName(true)}
        >
          {task.title}
        </div>
      )}
      <div>{time}</div>
      <div className="flex items-center justify-center">
        <select
          className="p-1 rounded-lg"
          value={task.state}
          onChange={updateTask}
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    }).then(() => {
      setName("");
      queryClient.invalidateQueries();
    });
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
