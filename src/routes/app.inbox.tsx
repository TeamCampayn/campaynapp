import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/app/inbox")({ component: () => <Navigate to="/app/campaigns" /> });
