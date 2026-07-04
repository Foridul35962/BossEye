// Minimal demo sketch for the Wokwi circuit — NOT connected to the backend.
// Purpose: just prove the wiring is correct by cycling each relay/LED on and
// off in sequence. This satisfies "the design must make physical sense" from
// the assignment; it is not meant to mirror the real backend's logic.

const int PINS[] = {16, 17, 18, 19, 21}; // Fan1, Fan2, Light1, Light2, Light3
const int NUM_DEVICES = 5;

void setup() {
  for (int i = 0; i < NUM_DEVICES; i++) {
    pinMode(PINS[i], OUTPUT);
    digitalWrite(PINS[i], LOW); // all off at boot — matches the backend's
                                 // "relay NO = safe default off" reasoning
  }
}

void loop() {
  // Cycle through devices one at a time so you can visually confirm each
  // relay/LED responds to its correct GPIO in the Wokwi simulation.
  for (int i = 0; i < NUM_DEVICES; i++) {
    digitalWrite(PINS[i], HIGH);
    delay(800);
    digitalWrite(PINS[i], LOW);
    delay(200);
  }
}
