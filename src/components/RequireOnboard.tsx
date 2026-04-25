import { Navigate } from "react-router-dom";
import { isOnboarded } from "@/lib/storage";

export default function RequireOnboard({ children }: { children: React.ReactNode }) {
  if (!isOnboarded()) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
