import { authHeaders } from "./apiClient";
import { Task } from "../types/user";

interface TasksResponse {
  tasks: Task[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => ({}));
    throw new Error(responseBody.message || "Failed to fetch tasks");
  }

  const data = (await response.json()) as TasksResponse;
  return data.tasks;
};

export const saveTasks = async (tasks: Task[]): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ tasks }),
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => ({}));
    throw new Error(responseBody.message || "Failed to save tasks");
  }

  const data = (await response.json()) as TasksResponse;
  return data.tasks;
};
