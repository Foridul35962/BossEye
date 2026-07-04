# Boss Eye Dashboard — Lights, Fans, Discord

A live office monitoring system: a Next.js dashboard + a Discord bot, both backed
by one shared Express/MongoDB/Redis API. Built for the Techathon hackathon
preliminary round.

## Architecture

See `docs/system-architecture.svg` for the full diagram (also embedded below).

```
[Simulator / node-cron]  --writes-->  [MongoDB: Device, PowerHistory, Alert]
                                              |
                                        [Express API]  <-- REST -->  [Discord Bot]
                                              |
                                        [Socket.IO]
                                              |
                                    [Next.js Dashboard] (live, no refresh)
```

- **Single source of truth**: the dashboard and the Discord bot both read from
  the same Express API. Neither has its own copy of device state.
- **Power is never stored** on a device — it's always recalculated from
  `status * watt` at request time (see `powerService.getCurrentPower`). This
  avoids any risk of stale/duplicated wattage data.
- **Two-layer alerting**: alerts are checked immediately after every `PATCH`
  (so a toggle reflects instantly) *and* every 5 minutes via `node-cron` (so
  passively-building conditions — like the clock crossing into after-hours —
  are still caught even with no user action).
- **Redis** caches the two heaviest aggregate endpoints (`/api/power`,
  `/api/status`) for 5 seconds, and is invalidated on every device write.
  RedisInsight is included in `docker-compose.yml` for inspecting the cache.

## Project structure

```
server/         Express API (ES modules — Mongoose models, services, routes, cron, simulator)
client/         Next.js dashboard (TypeScript, App Router)
discord-bot/    discord.js bot, same REST API, plus a Socket.IO listener for alerts
docker-compose.yml
```

## Running it

1. Copy env files and fill in real values where needed:
   ```
   cp server/.env.example server/.env.docker
   cp discord-bot/.env.example discord-bot/.env.docker   # add your DISCORD_TOKEN + ALERT_CHANNEL_ID
   cp client/.env.example client/.env.local              # for local (non-docker) client dev
   ```
2. Start everything:
   ```
   docker compose up --build
   ```
3. Seed the 18 devices (run once, after `mongo` is up):
   ```
   docker compose exec server npm run seed
   ```
4. Open the dashboard: http://localhost:3000
   Backend health check: http://localhost:5000/api/health
   RedisInsight: http://localhost:5540

If you don't have a Discord bot token yet, you can comment out the
`discord-bot` service in `docker-compose.yml` — the dashboard and API work
independently of it.

## API

| Method | Route | Notes |
|---|---|---|
| GET | `/api/devices` | all 15 devices |
| GET | `/api/devices/:id` | single device |
| PATCH | `/api/devices/:id` | body `{ "status": true }` — the one control path; triggers power recalc, alert check, socket emits |
| GET | `/api/rooms` | per-room device/on counts |
| GET | `/api/rooms/:roomName` | accepts full name or slug (`drawing`, `work1`, `work2`) |
| GET | `/api/power` | current total + per-room watts + today's estimated kWh (cached 5s) |
| GET | `/api/alerts` | active (unresolved) alerts |
| GET | `/api/status` | aggregate summary — what `!status` and the dashboard header use |
| GET | `/api/health` | `{ "status": "OK" }` |

Socket.IO events emitted by the server: `deviceUpdated`, `powerUpdated`, `alertCreated`.

## Simulated data

There's no real hardware. `server/src/data/seedDevices.js` builds the fixed
18-device layout (3 rooms × 2 fans @60W + 3 lights @15W) and seeds a few
devices as already-on so the dashboard has something live immediately. A
background simulator (`server/src/jobs/simulator.js`) flips one random device
every 30s through the *same* code path a real PATCH request uses, so the data
stays dynamic without a physical device.

## Alerts

Two conditions, per the spec:
- **After-hours**: any device ON outside 9AM–5PM.
- **Long-running room**: every device in a room has been ON continuously for 2+ hours.

Alerts are de-duplicated (won't re-fire while already active) and
auto-resolved once the condition clears.

## Discord bot commands

| Command | Behavior |
|---|---|
| `!status` | Per-room ON counts + total power, pulled live from `/api/status` |
| `!room <drawing\|work1\|work2>` | Status of one room |
| `!usage` | Current watts + today's estimated kWh |

Bonus: the bot also listens to the backend's `alertCreated` Socket.IO event
and proactively posts to `ALERT_CHANNEL_ID` when an alert fires.

## Hardware / electrical schematic

**Live Wokwi circuit**: https://wokwi.com/projects/468599334433890305

Full pin-mapping, connection list, and electrical reasoning: see
`docs/hardware-schematic.md`. You still need to build the actual circuit in
Wokwi or Tinkercad yourself — that guide has everything needed to do it in
about 15 minutes, plus the reasoning for why it's wired the way it is
(relay isolation for mains switching, ACS712 for real current sensing on one
device as a demo of the "optionally sensing current draw" bonus).

## What's intentionally simplified for the hackathon timeframe

- The simulator picks a uniformly random device rather than modeling
  realistic occupancy patterns.
- Alert de-dup is per (type, room, device) rather than a fuller state machine.
- The Discord bot's responses are template-based, not LLM-generated — swapping
  in an LLM call (e.g. Claude) for `humanizeStatus`/`humanizeRoom`/`humanizeUsage`
  in `discord-bot/src/index.js` is a clean bonus extension.
