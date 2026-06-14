import { useEffect, useRef } from "react";
import { defaultUser } from "../constants/defaultUser";
import { useStorageState } from "../hooks/useStorageState";
import { User } from "../types/user";
import { UserContext } from "./UserContext";
import { getAuthToken } from "../services/apiClient";
import { fetchCurrentUser } from "../services/authService";
import { fetchTasks, saveTasks } from "../services/taskService";

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useStorageState<User>(defaultUser, "user");
  const saveTimeout = useRef<number | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    const loadRemoteData = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        const tasks = await fetchTasks();
        setUser((prevUser) => ({
          ...prevUser,
          name: currentUser.username,
          tasks,
          lastSyncedAt: new Date(),
        }));
      } catch (error) {
        console.warn("Failed to load remote user data", error);
      }
    };

    loadRemoteData();
  }, [setUser]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token || !user.name) {
      return;
    }

    if (saveTimeout.current) {
      window.clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = window.setTimeout(async () => {
      try {
        const tasks = await saveTasks(user.tasks);
        setUser((prevUser) => ({
          ...prevUser,
          tasks,
          lastSyncedAt: new Date(),
        }));
      } catch (error) {
        console.warn("Failed to save tasks to remote backend", error);
      }
    }, 1000);

    return () => {
      if (saveTimeout.current) {
        window.clearTimeout(saveTimeout.current);
      }
    };
  }, [user.tasks, user.name, setUser]);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
