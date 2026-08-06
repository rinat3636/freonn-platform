---
name: Testing freonn-platform locally
description: How to set up, seed, and end-to-end test the freonn-platform construction workspace app (Node/Vite/React + tRPC + Drizzle + MySQL).
---

# Testing freonn-platform

## Stack & setup
- Node/Vite/React + tRPC + Drizzle + MySQL 8.0. Package manager **pnpm 10.4.1**.
- If pnpm/corepack fails with "Cannot find matching keyid", prefix commands with `COREPACK_INTEGRITY_KEYS=0`.
- DB via Docker: `docker compose up -d mysql` (service `mysql`, db `freonn_platform`, user `freonn`/`freonn`). Wait ~15s for MySQL init before pushing schema (a too-early `db:push` fails with "Connection lost").
- Create `.env` at repo root BEFORE `docker compose` (compose reads it): `DATABASE_URL=mysql://freonn:freonn@localhost:3306/freonn_platform`, `JWT_SECRET=dev-secret-min-32-chars-long-please`, `PORT=3000`.
- Schema: `COREPACK_INTEGRITY_KEYS=0 pnpm db:push --force`. Server: `COREPACK_INTEGRITY_KEYS=0 pnpm dev` → http://localhost:3000.

## Seeding via UI (no seed data exists)
- Register the FIRST user via the Регистрация tab → it auto-becomes role `director` regardless of selected role.
- As director, create a project on the dashboard (Новый объект). The create dialog only exposes name/address/plannedEndDate — **no startDate**, so the `at_risk` (🟡) risk state cannot be triggered via UI; only `on_track` (🟢) and `overdue` (🔴, past date) are reachable.

## Cyrillic input gotchas
- The automated `type` computer action drops/garbles Cyrillic. Instead: click the field, then run `DISPLAY=:0 xdotool type --clearmodifiers "текст"`.
- If you fix test data directly in MySQL, ALWAYS pass `--default-character-set=utf8mb4` to the mysql CLI, otherwise Cyrillic gets double-encoded (mojibake). Verify with `SELECT HEX(name)`.

## Workspace tabs to verify (8)
Обзор (ConstructionTimer + aggregated stat cards, "Вся лента" switches tabs), Таймлайн (add stages; status colors done=green✓/active=amber clock/planned=grey), Лента (worklog under "Сегодня"), Фото (upload via `/api/upload` + lightbox), Камеры (empty states + add dialog; live RTSP not testable without a source), Документы (upload + category filter chips), Чат (bubble + initials + day separator), AI (graceful fallback "AI временно недоступен" when GROQ_API_KEY unset — this is PASS).

## Map / Leaflet testing
- The in-VM Chrome cannot reach `tile.openstreetmap.org` (a/b/c subdomains): shell `curl` to a tile returns 200, but in the browser an `Image` load fails (`naturalWidth=0`) and `fetch` throws "Failed to fetch"; no service worker is registered. So map tiles render **gray in-browser regardless of code** — do NOT report this as a regression.
- Verify the map instead via the console: `.leaflet-container` has non-zero size (proves `invalidateSize` ran), `.leaflet-tile` count > 0 at a zoom fit to the markers, and marker count matches the number of projects with coordinates (proves `fitBounds`).

## Devin Secrets Needed
- None required for local testing. `GROQ_API_KEY` is optional; leaving it unset is expected and yields the AI graceful-fallback path.
