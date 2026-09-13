import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export function RequireApproved({ children }: { children: ReactElement }) {
  const { isAuthenticated, businessAccount } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (businessAccount?.status !== "APPROVED") return <Navigate to="/approval-status" replace />;
  return children;
}
