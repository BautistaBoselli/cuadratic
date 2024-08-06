import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Task } from "../types/index.js";
import {
  act,
  ChangeEvent,
  FormEvent,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { add, addHours, format, formatDistanceToNow, set } from "date-fns";
import { ca, se, th } from "date-fns/locale";
import React from "react";
import { useSession } from "@/components/auth";
import stringToNumber from "@/utils/string-to-number";
import sortTasks from "@/utils/sort-tasks";

export default function Home() {
  const session = useSession();
  const [sortBy, setSortBy] = useState("sort by");
  const [delay, setDelay] = useState("");

  if (session.status === "pending") {
    return (
      <main className="h-screen bg-slate-200 p-10 flex flex-col gap-4"></main>
    );
  }

  const sortSelection = sortBy === "sort by" ? "id" : sortBy;

  return (
    <main className="h-screen bg-slate-200 p-10 flex flex-col gap-4">
      <div className="flex justify-between items-center max-w-2xl">
        <h1 className="text-xl text-slate-700 font-bold">Cuadratic</h1>
        <LoginForm />
      </div>
      <div className="flex justify-between items-center max-w-2xl">
        <SortBySelect sortBy={sortBy} onSelect={setSortBy} />
        <DelayInput delay={delay} setDelay={setDelay} />
      </div>
      <TasksContainer sortSelection={sortSelection} delay={delay} />
      <AddTaskForm delay={delay} />
    </main>
  );
}

function LoginForm() {
  const session = useSession();
  const [inputValue, setInputValue] = useState(session.username || "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputValue || inputValue.length > 32) {
      alert("Username must be between 1 and 32 characters");
      session.logout();
      return;
    }

    session.login(inputValue);
  };

  return (
    <>
      <form className="flex gap-2 max-w-2xl" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Username"
          className="p-2 rounded-lg w-full"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          onBlur={() => setInputValue(session.username || "")}
        />
        {!session.isLogged || session.username !== inputValue ? (
          <button
            type="submit"
            className="p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 w-40"
          >
            {session.isLogged ? "Update" : "Login"}
          </button>
        ) : null}
      </form>
    </>
  );
}

function SortBySelect({
  sortBy,
  onSelect: OnSelect,
}: {
  sortBy: string;
  onSelect: (value: string) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    OnSelect(e.target.value);
  };

  return (
    <select
      className="p-2 rounded-lg w-40 bg-white"
      value={sortBy}
      onChange={handleChange}
    >
      <option value="sort by" hidden>
        Sort by
      </option>
      <option value="id">Id</option>
      <option value="title">Task Name</option>
      <option value="state">State</option>
      <option value="created_at">Hour</option>
    </select>
  );
}

function DelayInput({
  delay,
  setDelay,
}: {
  delay: string;
  setDelay: (value: string) => void;
}) {
  const session = useSession();
  const [inputValue, setInputValue] = useState(delay || "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const num = stringToNumber(inputValue);
      setDelay(inputValue);
    } catch (error) {
      alert("Invalid delay");
    }
  };

  if (!session.isLogged) {
    return (
      <div className="flex gap-2 max-w-2xl">
        <p className="p-2 rounded-lg w-full bg-slate-400">Login to add delay</p>
      </div>
    );
  }

  return (
    <>
      <form
        className="flex gap-2 max-w-2xl items-center"
        onSubmit={handleSubmit}
      >
        <label>Delay</label>
        <input
          type="text"
          name="delay"
          placeholder="Delay"
          className="p-2 rounded-lg w-full"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setInputValue(delay)}
        />
        {delay === inputValue ? null : (
          <button
            type="submit"
            className="p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 w-40"
          >
            Update
          </button>
        )}
      </form>
    </>
  );
}

function TasksContainer({
  sortSelection,
  delay,
}: {
  sortSelection: string;
  delay: string;
}) {
  const session = useSession();

  const { data, isError, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/get-tasks", session.username],
    queryFn: async () => {
      const response = await fetch(
        `/api/get-tasks?user=${session.username}&delay=${delay}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: Boolean(session.username),
    placeholderData: (prev) => prev,
  });

  if (!session.username || session.username.length > 32) {
    return (
      <div className="min-h-40 max-w-2xl  rounded-lg bg-white p-2">
        Login with a valid user to see tasks
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (!data || isError) {
    return <div>Error obteniendo las tareas</div>;
  }

  const sortedTasks = sortTasks(data, sortSelection);

  return (
    <div className="min-h-40 max-w-2xl  rounded-lg bg-white">
      <div className="grid grid-cols-4 gap-4 px-4 py-2 font-semibold border-b-2 border-slate-200 pb-2">
        <p>Name</p>
        <p>Hour</p>
        <p className="flex items-center justify-center">State</p>
        <p className="flex items-center justify-center">Delete</p>
      </div>
      <ol>
        {sortedTasks.map((task) => (
          <Task key={task.id} task={task} delay={delay} />
        ))}
      </ol>
    </div>
  );
}

function Task({ task, delay }: { task: Task; delay: string }) {
  const session = useSession();
  const [editingName, setEditingName] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  let date = new Date(task.created_at);
  const time = format(date, "HH:mm");
  // const time = formatDistanceToNow(date);

  const queryClient = useQueryClient();

  const deleteTask = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/delete-task", {
        method: "POST",
        body: JSON.stringify({ id: task.id, delay: delay }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        alert("Error deleting task");
      }
      queryClient.invalidateQueries();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["/api/get-tasks", session.username],
      });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "/api/get-tasks",
        session.username,
      ]);
      if (!previousTasks) return { previousTasks: [] };
      queryClient.setQueryData<Task[]>(
        ["/api/get-tasks", session.username],
        (old) => {
          if (!old) return [];
          if (!session.username) return [];
          return old.filter((t) => t.id !== task.id);
        }
      );
    },
  });

  const handleDelete = async () => {
    deleteTask.mutate();
  };

  const updateTaskState = useMutation({
    mutationFn: async (state: number) => {
      const response = await fetch("/api/update-task-state", {
        method: "POST",
        body: JSON.stringify({ id: task.id, state, delay }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        alert("Error updating task");
      }
      queryClient.invalidateQueries();
    },
    onMutate: async (state: number) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/get-tasks", session.username],
      });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "/api/get-tasks",
        session.username,
      ]);
      if (!previousTasks) return { previousTasks: [] };
      queryClient.setQueryData<Task[]>(
        ["/api/get-tasks", session.username],
        (old) => {
          if (!old) return [];
          if (!session.username) return [];
          return old.map((t) => {
            if (t.id === task.id) {
              if (state === 0 || state === 1 || state === 2) t.state = state;
            }
            return t;
          });
        }
      );
    },
  });

  const updateTask = async (e: ChangeEvent<HTMLSelectElement>) => {
    updateTaskState.mutate(Number(e.target.value));
  };

  const updateTaskTitle = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch("/api/update-task-title", {
        method: "POST",
        body: JSON.stringify({
          id: task.id,
          title: title,
          delay: delay,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        alert("Error updating task");
      }
      queryClient.invalidateQueries();
    },
    onMutate: async (title: string) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/get-tasks", session.username],
      });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "/api/get-tasks",
        session.username,
      ]);
      if (!previousTasks) return { previousTasks: [] };
      queryClient.setQueryData<Task[]>(
        ["/api/get-tasks", session.username],
        (old) => {
          if (!old) return [];
          if (!session.username) return [];
          return old.map((t) => {
            if (t.id === task.id) {
              t.title = title;
            }
            return t;
          });
        }
      );
    },
  });

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setEditingName(false);
      const invalidName =
        !nameRef.current ||
        !nameRef.current.value ||
        nameRef.current.value.length > 32;
      if (invalidName) {
        alert("Task name must be between 1 and 32 characters");
        return;
      }
      updateTaskTitle.mutate(nameRef.current.value);
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

function AddTaskForm({ delay }: { delay: string }) {
  const [taskName, setTaskName] = useState("");
  const queryClient = useQueryClient();
  const session = useSession();

  const addTask = useMutation({
    mutationFn: async () => {
      const newName = taskName;
      setTaskName("");
      const response = await fetch("/api/add-task", {
        method: "POST",
        body: JSON.stringify({
          title: newName,
          user: session.username,
          delay: delay,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      queryClient.invalidateQueries();
      return response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["/api/get-tasks", session.username],
      });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "/api/get-tasks",
        session.username,
      ]);
      if (!previousTasks) return { previousTasks: [] };
      queryClient.setQueryData<Task[]>(
        ["/api/get-tasks", session.username],
        (old) => {
          if (!old) return [];
          if (!session.username) return [];
          const newTask: Task = {
            id: Date.now(),
            title: taskName,
            state: 0,
            created_at: new Date().toISOString(),
            username: session.username,
          };
          if (old.length === 0) return [newTask];
          return [...old, newTask];
        }
      );
      return { previousTasks };
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!taskName || taskName.length > 32) {
      alert("Task name must be between 1 and 32 characters");
      setTaskName("");
      return;
    }

    addTask.mutate();
  };

  const isUserLogged = session.username && session.username.length <= 32;

  return (
    <>
      {!isUserLogged ? (
        <div className="flex gap-2 max-w-2xl">
          <p className="p-2 rounded-lg w-full bg-slate-400">
            Login to add tasks{" "}
          </p>
        </div>
      ) : (
        <form className="flex gap-2 max-w-2xl" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Task name"
            className="p-2 rounded-lg w-full"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 w-40"
          >
            Add Task
          </button>
        </form>
      )}
    </>
  );
}
