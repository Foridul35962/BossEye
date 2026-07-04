export const ROOMS = ["Drawing Room", "Work Room 1", "Work Room 2"];

export const ROOM_SLUGS = {
  drawing: "Drawing Room",
  work1: "Work Room 1",
  work2: "Work Room 2",
};

export function resolveRoomName(input) {
  if (!input) return null;
  const exact = ROOMS.find((r) => r.toLowerCase() === input.toLowerCase());
  if (exact) return exact;
  return ROOM_SLUGS[input.toLowerCase()] || null;
}

export const WATTAGE = {
  fan: 60,
  light: 15,
};

export const OFFICE_HOURS = { start: 9, end: 17 }; // 9 AM - 5 PM, 24h clock
export const LONG_RUNNING_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

export const CACHE_TTL_SECONDS = 5; // short TTL: dashboard/bot poll often, data changes often
