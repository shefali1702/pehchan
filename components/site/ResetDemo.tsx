"use client";

import { useState } from "react";

export default function ResetDemo() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  return (
    <button
      className="reset-btn"
      disabled={state === "busy"}
      onClick={async () => {
        if (state !== "idle") return setState("idle");
        setState("busy");
        await fetch("/api/reset", { method: "POST" });
        setState("done");
      }}
    >
      {state === "done" ? "Demo data reset to the Sharma family" : state === "busy" ? "Resetting" : "Reset demo data"}
    </button>
  );
}
