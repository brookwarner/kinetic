"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { resetAllPhysiosOptIn } from "@/actions/dev-utils";

export function GlobalResetButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-orange-700 hover:bg-orange-50 hover:text-orange-800"
      onClick={async () => {
        await resetAllPhysiosOptIn();
        window.location.reload();
      }}
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      Reset
    </Button>
  );
}
