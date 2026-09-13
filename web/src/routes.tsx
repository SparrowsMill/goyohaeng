import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupRequestPage from "./pages/auth/SignupRequestPage";
import ApprovalStatusPage from "./pages/auth/ApprovalStatusPage";
import StatsDashboardPage from "./pages/stats/StatsDashboardPage";
import MonitoringPage from "./pages/stats/MonitoringPage";
import ReportErrorPage from "./pages/stats/ReportErrorPage";
import VisitAuthManagePage from "./pages/visit/VisitAuthManagePage";
import VisitAuthConfirmPage from "./pages/visit/VisitAuthConfirmPage";
import OperatingHoursPage from "./pages/visit/OperatingHoursPage";
import PlaceManagePage from "./pages/place/PlaceManagePage";
import SettingsPage from "./pages/settings/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", element: <AuthLayout><LoginPage /></AuthLayout> },
  { path: "/signup", element: <AuthLayout wide><SignupRequestPage /></AuthLayout> },
  {
    path: "/approval-pending",
    element: (
      <AuthLayout>
        <ApprovalStatusPage status="pending" />
      </AuthLayout>
    ),
  },
  {
    path: "/approval-rejected",
    element: (
      <AuthLayout>
        <ApprovalStatusPage status="rejected" />
      </AuthLayout>
    ),
  },
  {
    path: "/approval-approved",
    element: (
      <AuthLayout>
        <ApprovalStatusPage status="approved" />
      </AuthLayout>
    ),
  },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/visit-auth" replace /> },
      { path: "stats", element: <StatsDashboardPage /> },
      { path: "monitoring", element: <MonitoringPage /> },
      { path: "monitoring/report", element: <ReportErrorPage /> },
      { path: "visit-auth", element: <VisitAuthManagePage /> },
      { path: "visit-auth/:id", element: <VisitAuthConfirmPage /> },
      { path: "places", element: <PlaceManagePage /> },
      { path: "places/hours", element: <OperatingHoursPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
