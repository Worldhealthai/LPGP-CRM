#!/usr/bin/env python3
"""
Split a SQL file into parts that each run on their own, and keep the text ASCII.

Two jobs, both aimed at the same failure: a browser SQL editor that silently
truncates a long paste, cutting a statement in half so Postgres reports a
syntax error on a line that is perfectly valid in the file.

  1. Cut only on statement boundaries, never inside one. The scanner
     understands single-quoted strings (with '' escapes), dollar-quoted blocks
     ($$ ... $$ and $tag$ ... $tag$), line comments and block comments, so a
     semicolon inside any of those is not a boundary.

  2. Fold typographic punctuation (em dash, ellipsis, arrow ...) down to ASCII
     inside COMMENTS ONLY. Comment prose is the only place these appear for
     decoration; a multi-byte character inside a string literal is data and is
     left exactly as it is.

Usage:
    split_sql.py SOURCE OUTDIR PREFIX [--max-bytes N] [--ascii-only]
"""

import sys
import os

# Decoration -> ASCII. Applied to comment text only.
FOLD = {
    "—": "--",   # em dash
    "–": "-",    # en dash
    "…": "...",  # ellipsis
    "→": "->",   # rightwards arrow
    "·": "-",    # middle dot
    "‘": "'",
    "’": "'",
    "“": '"',
    "”": '"',
    " ": " ",    # no-break space
}


class Scan:
    """Walks SQL once, reporting where each statement ends and which spans are comments."""

    def __init__(self, text):
        self.text = text
        self.ends = []        # index just past each statement-terminating ';'
        self.comments = []    # (start, end) spans of comment text

    def run(self):
        t = self.text
        n = len(t)
        i = 0
        while i < n:
            c = t[i]

            # line comment
            if c == "-" and t.startswith("--", i):
                j = t.find("\n", i)
                j = n if j < 0 else j
                self.comments.append((i, j))
                i = j
                continue

            # block comment (Postgres nests them)
            if c == "/" and t.startswith("/*", i):
                depth = 1
                j = i + 2
                while j < n and depth:
                    if t.startswith("/*", j):
                        depth += 1
                        j += 2
                    elif t.startswith("*/", j):
                        depth -= 1
                        j += 2
                    else:
                        j += 1
                self.comments.append((i, j))
                i = j
                continue

            # single-quoted string, '' escapes a quote
            if c == "'":
                j = i + 1
                while j < n:
                    if t[j] == "'":
                        if j + 1 < n and t[j + 1] == "'":
                            j += 2
                            continue
                        j += 1
                        break
                    j += 1
                i = j
                continue

            # quoted identifier
            if c == '"':
                j = i + 1
                while j < n:
                    if t[j] == '"':
                        if j + 1 < n and t[j + 1] == '"':
                            j += 2
                            continue
                        j += 1
                        break
                    j += 1
                i = j
                continue

            # dollar-quoted block: $tag$ ... $tag$
            if c == "$":
                tag = self._dollar_tag(i)
                if tag is not None:
                    close = t.find(tag, i + len(tag))
                    i = n if close < 0 else close + len(tag)
                    continue

            if c == ";":
                self.ends.append(i + 1)
                i += 1
                continue

            i += 1

        if not self.ends or self.ends[-1] != n:
            # trailing text with no final semicolon still forms a chunk
            if t[self.ends[-1] if self.ends else 0:].strip():
                self.ends.append(n)
        return self

    def _dollar_tag(self, i):
        t = self.text
        j = i + 1
        while j < len(t) and (t[j].isalnum() or t[j] == "_"):
            j += 1
        if j < len(t) and t[j] == "$":
            return t[i:j + 1]
        return None


def fold_comments(text, spans):
    """Rewrite comment spans with ASCII punctuation, leaving everything else byte-identical."""
    out = []
    last = 0
    for start, end in spans:
        out.append(text[last:start])
        chunk = text[start:end]
        for bad, good in FOLD.items():
            chunk = chunk.replace(bad, good)
        out.append(chunk)
        last = end
    out.append(text[last:])
    return "".join(out)


def statements(text):
    """The source, sliced into whole statements (each keeps its leading comments)."""
    ends = Scan(text).run().ends
    parts = []
    last = 0
    for e in ends:
        parts.append(text[last:e])
        last = e
    return parts


def pack(parts, max_bytes):
    """Greedily fill parts up to max_bytes, never splitting a statement."""
    out = []
    cur = ""
    for p in parts:
        if cur and len(cur.encode()) + len(p.encode()) > max_bytes:
            out.append(cur)
            cur = p
        else:
            cur += p
    if cur.strip():
        out.append(cur)
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    max_bytes = 30000
    for a in sys.argv[1:]:
        if a.startswith("--max-bytes="):
            max_bytes = int(a.split("=", 1)[1])
    if len(args) < 3:
        print(__doc__)
        return 2
    src, outdir, prefix = args[0], args[1], args[2]

    text = open(src, encoding="utf-8").read()
    scan = Scan(text).run()
    text = fold_comments(text, scan.comments)

    left = sorted({ch for ch in text if ord(ch) > 127})
    if left:
        where = ", ".join(f"U+{ord(c):04X} {c!r}" for c in left)
        if "--ascii-only" in flags:
            print(f"error: non-ASCII left outside comments: {where}", file=sys.stderr)
            return 1
        print(f"note: non-ASCII kept inside string literals (data): {where}")

    chunks = pack(statements(text), max_bytes)
    os.makedirs(outdir, exist_ok=True)
    total = len(chunks)
    written = []
    for i, chunk in enumerate(chunks, 1):
        name = f"{prefix}_{i:02d}_of_{total:02d}.sql"
        head = (
            f"-- {prefix}: part {i} of {total}\n"
            f"-- Run the parts in order. Each one is whole statements, so a part\n"
            f"-- never ends mid-statement. Safe to re-run.\n\n"
        )
        path = os.path.join(outdir, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(head + chunk.strip() + "\n")
        written.append((name, os.path.getsize(path)))

    for name, size in written:
        print(f"{name}  {size:>7,} bytes")
    print(f"{total} parts, largest {max(s for _, s in written):,} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
