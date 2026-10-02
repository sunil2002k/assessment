import { Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth, RootRedirect } from "./auth/guards";
import AdminPage from "./pages/AdminPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import LoginPage from "./pages/LoginPage";
import MemberDashboard from "./pages/MemberDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth role="member">
            <MemberDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
