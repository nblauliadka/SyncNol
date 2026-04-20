import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import AntigravityPage from "./pages/AntigravityPage.jsx";
import PlannerPage from "./pages/PlannerPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import AcademyPage from "./pages/AcademyPage.jsx";
import VaultPage from "./pages/VaultPage.jsx";
import WingmanPage from "./pages/WingmanPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AdminPortalPage from "./pages/AdminPortalPage.jsx";

export const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <LandingPage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },

  // Protected routes (inside AppShell with Sidebar)
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "antigravity", element: <AntigravityPage /> },
      { path: "planner", element: <PlannerPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "academy", element: <AcademyPage /> },
      { path: "vault", element: <VaultPage /> },
      { path: "wingman", element: <WingmanPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "admin-portal", element: <AdminPortalPage /> },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
