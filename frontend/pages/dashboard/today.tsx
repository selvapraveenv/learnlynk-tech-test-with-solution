import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../../styles/today.module.css";

type Task = {
  id: string;
  title: string;
  type: string;
  status: string;
  application_id: string;
  due_at: string;
};

export default function TasksByDate() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Fetch tasks
  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth, daysInMonth, 23, 59, 59);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .gte("due_at", start.toISOString())
        .lte("due_at", end.toISOString())
        .order("due_at", { ascending: true });
      if (error) throw error;
      setAllTasks(data || []);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  // Filter tasks for selected date and sort
  useEffect(() => {
    const filtered = allTasks
      .filter(t => {
        const d = new Date(t.due_at);
        return d.getFullYear() === selectedYear &&
               d.getMonth() === selectedMonth &&
               d.getDate() === selectedDate;
      })
      .sort((a,b) => (a.status === "completed" ? 1 : -1));
    setTasks(filtered);
  }, [allTasks, selectedDate, selectedMonth, selectedYear]);

  async function markComplete(id: string) {
    setProcessingIds(prev => [...prev, id]);
    try {
      const { error } = await supabase.from("tasks").update({ status: "completed" }).eq("id", id);
      if (error) throw error;
      setAllTasks(prev => prev.map(t => t.id === id ? { ...t, status: "completed" } : t));
    } catch {
      alert("Failed to update task");
    } finally {
      setProcessingIds(prev => prev.filter(pid => pid !== id));
    }
  }

  useEffect(() => { fetchTasks(); }, [selectedMonth, selectedYear]);

  const taskDatesSet = new Set(
    allTasks
      .filter(t => t.status !== "completed")
      .map(t => {
        const d = new Date(t.due_at);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth ? d.getDate() : null;
      })
      .filter(Boolean) as number[]
  );

  return (
    <main className={styles.mainContainer}>
      {/* Tasks */}
      <div className={styles.tasksSection}>
        <h1 className={styles.tasksTitle}>
          Tasks for {selectedDate}/{selectedMonth + 1}/{selectedYear}
        </h1>
        {loading && <div className={styles.loading}>Loading tasks...</div>}
        {error && <div className={styles.error}>{error}</div>}
        {!loading && tasks.length === 0 && <p className={styles.noTasks}>No tasks on this date 🎉</p>}

        {tasks.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.taskTable}>
              <thead>
                <tr>{["Type","Application","Due At","Status","Action"].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {tasks.map(t => {
                  const isProcessing = processingIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      className={styles.taskRow}
                      onMouseEnter={() => setHoveredTask(t)}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX + 20, y: e.clientY + 15 })}
                      onMouseLeave={() => setHoveredTask(null)}
                    >
                      <td>{t.type}</td>
                      <td className={styles.application}>{t.application_id}</td>
                      <td className={styles.dueAt}>{new Date(t.due_at).toLocaleString()}</td>
                      <td className={t.status === "completed" ? styles.completed : t.status === "open" ? styles.open : ""}>{t.status}</td>
                      <td>
                        {t.status !== "completed" && (
                          <button
                            className={styles.completeBtn}
                            disabled={isProcessing}
                            onClick={() => markComplete(t.id)}
                          >
                            {isProcessing ? "Processing..." : "Mark Complete"}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredTask && (
        <div
          className={`${styles.tooltip} ${styles.tooltipVisible}`}
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          {hoveredTask.title || "No message"}
        </div>
      )}

      {/* Calendar */}
      <div className={styles.calendarSection}>
        <h2 className={styles.calendarHeader}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
            {monthNames.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
          </select>
          <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} />
        </h2>

        <div className={styles.daysGrid}>
          {daysOfWeek.map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
          {monthDays.map(day => {
            const isSelected = selectedDate === day;
            const hasPendingTask = taskDatesSet.has(day);
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`${styles.dayCell} ${isSelected ? styles.selectedDay : ""} ${hasPendingTask ? styles.pendingTaskDay : ""}`}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  );
}
