import axios from "axios";
import { toast } from "sonner";

const baseURL =
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  import.meta.env.VITE_API_URL ||
  "/api";

export const api = axios.create({ baseURL, timeout: 30000 });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sb_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthEndpoint = url.includes("/login") || url.includes("/signup");

    if (err.response?.status === 401 && !isAuthEndpoint) {
      // Only redirect to login if NOT on an auth endpoint
      // Wrong password on /login should NOT trigger redirect
      localStorage.removeItem("sb_token");
      localStorage.removeItem("sb_user");
      window.location.href = "/login";
    } else if (!err.response) {
      toast.error("Cannot reach server. Is the backend running?");
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (email: string, password: string) =>
    api.post("/login",  { email, password }).then((r) => r.data),
  signup: (name: string, email: string, password: string) =>
    api.post("/signup", { name, email, password }).then((r) => r.data),
  me: () => api.get("/me").then((r) => r.data),
};

// ── Timetable ─────────────────────────────────────────────────────────────────
export const timetableApi = {
  getAll:   () => api.get("/timetable").then((r) => r.data),
  getToday: () => api.get("/timetable/today").then((r) => r.data),
  add: (data: { subject: string; day: string; start_time: string; end_time: string; room?: string }) =>
    api.post("/timetable", data).then((r) => r.data),
  delete:  (id: number) => api.delete(`/timetable/${id}`).then((r) => r.data),
  upload:  (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/timetable/upload", form).then((r) => r.data);
  },
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  getAll:        () => api.get("/attendance").then((r) => r.data),
  todaySubjects: () => api.get("/attendance/today-subjects").then((r) => r.data),
  mark: (data: { subject: string; attended: boolean; date?: string; timetable_id?: number }) =>
    api.post("/attendance", data).then((r) => r.data),
  delete:     (id: number) => api.delete(`/attendance/${id}`).then((r) => r.data),
  percentage: () => api.get("/attendance/percentage").then((r) => r.data),
  summary:    () => api.get("/attendance/summary").then((r) => r.data),
};

// ── Assignments ───────────────────────────────────────────────────────────────
export const assignmentsApi = {
  getAll: () => api.get("/assignments").then((r) => r.data),
  create: (data: { title: string; subject: string; description?: string; deadline?: string; priority?: string }) =>
    api.post("/assignments", data).then((r) => r.data),
  toggleComplete: (id: number) => api.patch(`/assignments/${id}/complete`).then((r) => r.data),
  delete: (id: number) => api.delete(`/assignments/${id}`).then((r) => r.data),
};

// ── Notes ─────────────────────────────────────────────────────────────────────
export const notesApi = {
  getAll: () => api.get("/notes").then((r) => r.data),
  create: (data: { title: string; content?: string; subject?: string }) =>
    api.post("/notes", data).then((r) => r.data),
  upload: (file: File, subject: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("subject", subject);
    return api.post("/notes/upload", form).then((r) => r.data);
  },
  update: (id: number, data: { title: string; content?: string; subject?: string }) =>
    api.put(`/notes/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/notes/${id}`).then((r) => r.data),
};

// ── Reminders ─────────────────────────────────────────────────────────────────
export const remindersApi = {
  getAll:     () => api.get("/reminders").then((r) => r.data),
  create: (data: { title: string; due?: string; category?: string; priority?: string }) =>
    api.post("/reminders", data).then((r) => r.data),
  toggleDone: (id: number) => api.patch(`/reminders/${id}/done`).then((r) => r.data),
  delete:     (id: number) => api.delete(`/reminders/${id}`).then((r) => r.data),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  getProfile:    () => api.get("/settings/profile").then((r) => r.data),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.patch("/settings/profile", data).then((r) => r.data),
  deleteAccount: () => api.delete("/settings/account").then((r) => r.data),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  get: () => api.get("/notifications").then((r) => r.data),
};
