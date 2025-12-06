import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Task = {
  id: string;
  type: string;
  status: string;
  application_id: string;
  due_at: string;
};

export default function TasksByDate() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10) // default today yyyy-mm-dd
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // Fetch tasks for the selected date
  async function fetchTasks(dateStr: string) {
    setLoading(true);
    setError(null);

    try {
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .gte("due_at", start.toISOString())
        .lt("due_at", end.toISOString())
        .order("due_at", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (err: any) {
      console.error("Supabase fetch error:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function markComplete(id: string) {
    setProcessingIds((prev) => [...prev, id]);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", id);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert("Failed to update task");
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  }

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ marginBottom: "1rem", fontSize: "2rem" }}>Tasks by Date</h1>

      {/* Date Picker */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      {loading && <div>Loading tasks...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && tasks.length === 0 && <p>No tasks on this date 🎉</p>}

      {tasks.length > 0 && (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Type</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Application</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Due At</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const isProcessing = processingIds.includes(t.id);
              return (
                <tr
                  key={t.id}
                  style={{
                    border: "1px solid #ddd",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0f8ff")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{t.type}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {t.application_id}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(t.due_at).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      color:
                        t.status === "completed"
                          ? "green"
                          : t.status === "open"
                          ? "orange"
                          : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {t.status}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {t.status !== "completed" && (
                      <button
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          opacity: isProcessing ? 0.6 : 1,
                        }}
                        onClick={() => markComplete(t.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Mark Complete"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
