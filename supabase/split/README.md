# Split scripts

`all_in_one.sql` is ~111 KB, which is more than the Supabase SQL editor will
take in a single paste — a truncated paste cuts a statement in half and the
next chunk fails with `syntax error at or near ")"`.

These parts are the same file cut **only at statement boundaries** (respecting
the `$$ … $$` function bodies and `DO` blocks, which a naive split on `;`
would break), so each part is valid SQL on its own.

Run them **in order**, one at a time. Each is idempotent — re-running changes
nothing.

| File | Contents |
| --- | --- |
| `all_in_one_part1_of_3.sql` | Schema + the first of the seed data |
| `all_in_one_part2_of_3.sql` | More seed data |
| `all_in_one_part3_of_3.sql` | Remaining seed data + the sales layer |

**You probably don't need these.** If you don't want the sample companies and
contacts, `../schema.sql` is 24 KB, pastes in one go, and creates every table
the app uses. Use that instead.
