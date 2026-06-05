"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { setPortfolio } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function PortfolioButton({ id, initial }: { id: string; initial: boolean }) {
  const [inPortfolio, setIn] = useState(initial);
  const [pending, start] = useTransition();

  function toggle() {
    const next = !inPortfolio;
    setIn(next);
    start(async () => {
      const res = await setPortfolio(id, next);
      if (!res.ok) setIn(!next); // revert on failure
    });
  }

  return (
    <Button onClick={toggle} disabled={pending} variant={inPortfolio ? "secondary" : "default"}>
      {inPortfolio ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {inPortfolio ? "In Portfolio" : "Add to Portfolio"}
    </Button>
  );
}
