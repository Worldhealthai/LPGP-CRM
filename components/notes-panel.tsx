"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { addNote, deleteNote } from "@/lib/actions";
import type { Note } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

export function NotesPanel({
  entityType,
  entityId,
  notes,
}: {
  entityType: "company" | "contact" | "lead";
  entityId: string;
  notes: Note[];
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      const res = await addNote(entityType, entityId, body);
      if (res.ok) setBody("");
      else setError(res.error ?? "Could not save note");
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note — meeting recap, mandate, intro, anything…"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={submit} disabled={pending || !body.trim()}>
            <MessageSquarePlus className="h-4 w-4" /> Add note
          </Button>
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {notes.map((n) => (
            <li key={n.id} className="group rounded-lg border bg-secondary/40 p-3">
              <p className="text-sm whitespace-pre-wrap break-words">{n.body}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {n.author ? `${n.author} · ` : ""}
                  {timeAgo(n.created_at)}
                </span>
                <button
                  onClick={() =>
                    start(async () => {
                      await deleteNote(n.id, entityType, entityId);
                    })
                  }
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  aria-label="Delete note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
