import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupRequestPage from "./pages/auth/SignupRequestPage";
import ApprovalStatusPage from "./pages/auth/ApprovalStatusPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
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
  { path: "/signup", element: <AuthLayout><SignupRequestPage /></AuthLayout> },
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
      { index: true, element: <DashboardPage /> },
      { path: "stats", element: <StatsDashboardPage /> },
      { path: "monitoring", element: <MonitoringPage /> },
      { path: "monitoring/report", element: <ReportErrorPage /> },
      { path: "visit-auth", element: <VisitAuthManagePage /> },
      { path: "visit-auth/:id", element: <VisitAuthConfirmPage /> },
      { path: "visit-auth/hours", element: <OperatingHoursPage /> },
      { path: "places", element: <PlaceManagePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
