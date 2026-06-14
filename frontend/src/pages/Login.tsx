import { useContext, useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import { login, register } from "../services/authService";
import { fetchTasks } from "../services/taskService";
import { UserContext } from "../contexts/UserContext";
import { showToast } from "../utils";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);
  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = isRegisterMode
        ? await register(username, password)
        : await login(username, password);

      if (response?.username) {
        const tasks = await fetchTasks();
        setUser((prevUser) => ({
          ...prevUser,
          name: response.username,
          tasks,
          lastSyncedAt: new Date(),
        }));
      }

      showToast(isRegisterMode ? "Registration successful. You are now logged in." : "Login successful.");
      navigate(from, { replace: true });
    } catch (error) {
      showToast((error as Error).message || "Login failed.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: "100%", maxWidth: 420, bgcolor: "background.paper", p: 4, borderRadius: 2, boxShadow: 3 }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 2, textAlign: "center" }}>
          {isRegisterMode ? "Register" : "Login"}
        </Typography>

        <TextField
          label="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          required
        />

        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
          {isRegisterMode ? "Create account" : "Login"}
        </Button>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">
            {isRegisterMode ? "Already have an account?" : "Don’t have an account yet?"}
          </Typography>
          <Button onClick={() => setIsRegisterMode(!isRegisterMode)} sx={{ mt: 1 }}>
            {isRegisterMode ? "Switch to Login" : "Switch to Register"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
