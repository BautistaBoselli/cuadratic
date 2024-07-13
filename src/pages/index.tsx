import { useQuery } from "@tanstack/react-query";
import { Task } from "./api/get-tasks";

export default function Home() {
  return (
    <main className="h-screen bg-slate-200 p-10 flex flex-col gap-4">
      <h1 className="text-xl text-slate-700 font-bold">Cuadratic</h1>
      <Tasks />
    </main>
  );
}

function Tasks() {
  const { data, isError } = useQuery<Task[]>({ queryKey: ["/api/get-tasks"] });
  if (!data || isError) {
    return <div>Error obteniendo las tareas</div>;
  }

  return (
    <div className="min-h-40 max-w-2xl  rounded-lg bg-white">
      Punto de partida
      <ol>
        {data.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ol>
    </div>
  );
}
