import { useEffect, useState } from "react";
import api from "./lib/api";

function App() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    api
      .get("/health")
      .then((response) => {
        setStatus(response.data.status);
      })
      .catch(() => {
        setStatus("Backend connection failed");
      });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-cyan-400 text-sm font-medium tracking-widest uppercase">
          AI Action System
        </p>

        <h1 className="mt-4 text-6xl font-bold">
          LifeOS
        </h1>

        <p className="mt-4 text-gray-400">
          Turn scattered information into clear, prioritized actions.
        </p>

        <div className="mt-8">
          Backend status:
          <span className="ml-2 text-cyan-400 font-semibold">
            {status}
          </span>
        </div>
      </div>
    </main>
  );
}

export default App;