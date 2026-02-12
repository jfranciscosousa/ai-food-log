import { Navigate } from "react-router";

// This route is no longer needed in CSR mode
// Theme switching is handled client-side
export default function Theme() {
  return <Navigate to="/" replace />;
}
