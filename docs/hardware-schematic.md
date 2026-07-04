# Hardware / electrical schematic — build guide

**Live circuit**: https://wokwi.com/projects/468599334433890305
<!-- e.g. https://wokwi.com/projects/XXXXXXXXXXXXXXXXXX -->

This is a build guide, not a Wokwi export. The assignment requires you to
actually construct the circuit in Wokwi or Tinkercad yourself — a generated
project file wouldn't demonstrate the wiring reasoning the evaluation is
looking for anyway. Everything below is what you need to lay it out in ~15
minutes.

**Scope**: one representative room (Drawing Room — 2 fans, 3 lights), per the
assignment's explicit note that you don't need to wire all 15 devices.

## Why this design

The real hardware problem: an ESP32 can't safely switch mains-voltage
lights/fans directly — its GPIO pins output 3.3V at a few mA, and a fan/light
draws mains voltage at much higher current. Two separate concerns, two
separate parts of the circuit:

1. **Control path** — ESP32 GPIO → relay module → mains device. The relay is
   the isolation boundary: a low-voltage signal switches a high-voltage load
   without the two ever touching.
2. **Sensing path** — the ESP32 needs to *know* the actual on/off state (not
   just assume "I sent the command, so it must be on"). Two options, in
   increasing order of realism:
   - **Cheap/simple**: read back the relay's own control line — tells you what
     you commanded, not what physically happened.
   - **Better (the spec's "optionally sensing current draw")**: an ACS712
     current sensor on the live wire — tells you a device is *actually*
     drawing power, which catches a burnt-out bulb or a relay stuck open.

This project uses the second approach for one device (to show the concept),
and relay-readback for the rest — a reasonable trade-off for a hackathon
timeframe, and worth saying out loud to judges.

## Bill of materials (one room)

| Qty | Part | Purpose |
|---|---|---|
| 1 | ESP32 dev board | Main controller |
| 1 | 5-channel relay module (or 5x 1-channel) | Switches 2 fans + 3 lights |
| 1 | ACS712 (5A or 20A variant) | Current sensing on one fan, as a demo of real power sensing |
| 5 | LEDs (simulate the actual lights/fan motors in Wokwi, since Wokwi can't simulate mains AC) | Stand-in load, since Wokwi has no mains AC components |
| 5 | 220Ω resistors | Current-limit the demo LEDs |
| 1 | Breadboard + jumper wires | Assembly |

**Important Wokwi-specific note**: Wokwi doesn't simulate real mains AC or
real relays switching real loads — it simulates 3.3V/5V logic. So in your
Wokwi build, each "device" is represented as an LED (standing in for a fan/
light) driven through a simulated relay module component. This is exactly
what the assignment means by "must make physical sense" for a *concept*
schematic — you're demonstrating the control/sensing topology, not literally
switching a fan in the simulator.

## Pin mapping (ESP32 → relay module)

| Device | Type | Watt (from backend) | ESP32 GPIO | Relay channel |
|---|---|---|---|---|
| Fan 1 | Fan | 60W | GPIO 16 | Relay CH1 |
| Fan 2 | Fan | 60W | GPIO 17 | Relay CH2 |
| Light 1 | Light | 15W | GPIO 18 | Relay CH3 |
| Light 2 | Light | 15W | GPIO 19 | Relay CH4 |
| Light 3 | Light | 15W | GPIO 21 | Relay CH5 |

Avoid GPIO 34–39 for the relay control lines — those are input-only on most
ESP32 boards and can't drive the relay module's IN pins.

## Connection list

**ESP32 ↔ relay module (control path)**
```
ESP32 3V3   -> Relay VCC
ESP32 GND   -> Relay GND
ESP32 GPIO16 -> Relay IN1   (Fan 1)
ESP32 GPIO17 -> Relay IN2   (Fan 2)
ESP32 GPIO18 -> Relay IN3   (Light 1)
ESP32 GPIO19 -> Relay IN4   (Light 2)
ESP32 GPIO21 -> Relay IN5   (Light 3)
```

**Relay ↔ load (Wokwi: LED stand-ins; real world: mains device)**
```
Relay CH1 COM -> supply (+)         Relay CH1 NO -> Fan 1 (+)     Fan 1 (-) -> supply GND
Relay CH2 COM -> supply (+)         Relay CH2 NO -> Fan 2 (+)     Fan 2 (-) -> supply GND
Relay CH3 COM -> supply (+)         Relay CH3 NO -> Light 1 (+)   Light 1 (-) -> supply GND
Relay CH4 COM -> supply (+)         Relay CH4 NO -> Light 2 (+)   Light 2 (-) -> supply GND
Relay CH5 COM -> supply (+)         Relay CH5 NO -> Light 3 (+)   Light 3 (-) -> supply GND
```
(NO = normally open — the load only gets power when the ESP32 drives that
relay channel HIGH. This is the safer default: on ESP32 boot/crash, all
devices default to OFF rather than staying stuck ON.)

**Current sensing (Fan 1, demonstrating real power sensing)**
```
Supply (+) -> ACS712 IP+
ACS712 IP- -> Relay CH1 COM   (sensor sits in series with the load, on the live side)
ACS712 VCC -> ESP32 5V (VIN)
ACS712 GND -> ESP32 GND
ACS712 OUT -> ESP32 GPIO 34   (ADC1_CH6 — analog input, safe to use here since it's read-only)
```
Electrical reasoning: the ACS712 is a Hall-effect sensor — it measures the
magnetic field produced by current flowing through it, giving an analog
voltage proportional to current. Placing it between the relay's COM and the
supply means it reads the actual current flowing to the load, not just
whether the relay is commanded on — so a stuck relay or dead bulb shows up as
"commanded ON, 0W measured," which is a legitimately better alert condition
than what this backend currently does (it only asks "is status true", not
"is current actually flowing").

## What the ESP32 firmware would do (conceptually — no code needed for the deliverable)

1. On device command from backend (PATCH), or on a local button, set the
   relevant GPIO HIGH/LOW.
2. Read back relay state for devices without current sensing; read the
   ACS712 ADC value for Fan 1 and convert to watts.
3. POST the resulting state to `POST /api/devices/:id` (or your own
   ingestion endpoint) so the backend's `status`/`watt` fields reflect
   reality instead of just being simulated.

This is the seam where the current in-repo simulator (`server/src/jobs/
simulator.js`) would be swapped out for real hardware without changing
anything else in the backend, dashboard, or bot — which is the point of
keeping "power is derived, not stored" and "one write path" as the backend's
core design decisions.

## Building it in Wokwi

1. New Wokwi project → ESP32 dev board.
2. Add a 5-channel relay module component, wire per the control-path table.
3. Add 5 LEDs (with resistors) as load stand-ins, wired to the relay outputs.
4. Add one ACS712 component in series with Fan 1's relay channel, wired per
   the sensing table.
5. Label each LED clearly (Fan 1, Fan 2, Light 1, Light 2, Light 3) so the
   schematic is self-explanatory without extra narration.
6. Save the project and put the public Wokwi link in your README/repo.
