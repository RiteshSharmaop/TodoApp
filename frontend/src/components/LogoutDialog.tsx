import { Dialog, DialogActions, DialogContent } from "@mui/material";
import { CustomDialogTitle } from "./DialogTitle";
import { DialogBtn } from "../styles";
import { Logout } from "@mui/icons-material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { defaultUser } from "../constants/defaultUser";
import { deleteProfilePictureFromDB, showToast } from "../utils";
import { logout as logoutService } from "../services/authService";
import { saveTasks } from "../services/taskService";
import { getAuthToken } from "../services/apiClient";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = getAuthToken();
    if (token && user.tasks.length > 0) {
      try {
        await saveTasks(user.tasks);
      } catch (error) {
        console.warn("Failed to save tasks before logout", error);
      }
    }

    logoutService();
    setUser(defaultUser);
    onClose();
    await deleteProfilePictureFromDB();
    showToast("You have been successfully logged out");
    navigate("/login", { replace: true });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <CustomDialogTitle title="Logout Confirmation" onClose={onClose} icon={<Logout />} />
      <DialogContent>
        Are you sure you want to logout? <b>Your tasks will not be saved.</b>
      </DialogContent>
      <DialogActions>
        <DialogBtn onClick={onClose}>Cancel</DialogBtn>
        <DialogBtn onClick={handleLogout} color="error">
          <Logout /> &nbsp; Logout
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
