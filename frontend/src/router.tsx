import { ReactElement, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Loading } from "./components";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const TaskDetails = lazy(() => import("./pages/TaskDetails"));
const SharePage = lazy(() => import("./pages/Share"));
const AddTask = lazy(() => import("./pages/AddTask"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Transfer = lazy(() => import("./pages/Transfer"));
const Categories = lazy(() => import("./pages/Categories"));
const Purge = lazy(() => import("./pages/Purge"));
const Sync = lazy(() => import("./pages/Sync"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AppRouter = (): ReactElement => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/task/:id" element={<TaskDetails />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/add" element={<AddTask />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/purge" element={<Purge />} />
          <Route path="/sync" element={<Sync />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
