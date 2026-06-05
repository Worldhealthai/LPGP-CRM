"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Download className="h-4 w-4" /> Download Report
    </Button>
  );
}
