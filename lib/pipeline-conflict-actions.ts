"use server";

import { getSessionUser } from "./auth";
import {
  checkPipelineConflicts as check,
  listKnownEvents as list,
  type ConflictQuery,
  type KnownEvent,
} from "./pipeline-conflicts";
import type { PipelineConflicts } from "./types";

export type { KnownEvent };

/** Heads-up for a company someone is about to add. Null when signed out. */
export async function checkPipelineConflicts(
  query: ConflictQuery,
): Promise<PipelineConflicts | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return check(query);
}

/** Events a lead can be pursued for, for the picker. */
export async function listKnownEvents(): Promise<KnownEvent[]> {
  const user = await getSessionUser();
  if (!user) return [];
  return list();
}
