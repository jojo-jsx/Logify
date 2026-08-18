import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Match from "./pages/Match";
import StudentDashboard from "./pages/StudentDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import Landing from "./pages/Landing";

function RequireAuth({ role, children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role)
    return <Navigate to="/login" replace />;
  return children;
}

function Root() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={currentUser.role === "student" ? "/student" : "/supervisor"}
      replace
    />
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/onboarding"
            element={
              <RequireAuth role="student">
                <Onboarding />
              </RequireAuth>
            }
          />
          <Route
            path="/match"
            element={
              <RequireAuth role="student">
                <Match />
              </RequireAuth>
            }
          />
          <Route
            path="/student"
            element={
              <RequireAuth role="student">
                <StudentDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/supervisor"
            element={
              <RequireAuth role="supervisor">
                <SupervisorDashboard />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
