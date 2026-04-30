import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/campaigns")({
  head: () => ({ meta: [{ title: "My Campaigns — Campayn" }] }),
  component: () => (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-black tracking-tight">My Campaigns</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Kanban workspace, status-aware flow, script & video submission ship in the next build pass.
      </p>
    </div>
  ),
});