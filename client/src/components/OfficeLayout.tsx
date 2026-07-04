"use client";

import type { Device, DeviceType } from "../lib/types";

const ROOMS = [
  { name: "Drawing Room", x: 20 },
  { name: "Work Room 1", x: 280 },
  { name: "Work Room 2", x: 540 },
];
const ROOM_WIDTH = 240;
const ROOM_HEIGHT = 220;

interface OfficeLayoutProps {
  devices: Device[];
}

export default function OfficeLayout({ devices }: OfficeLayoutProps) {
  const byRoom = (room: string, type: DeviceType) =>
    devices.filter((d) => d.room === room && d.type === type);

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-3">Office Layout</h2>
      <svg viewBox="0 0 800 260" className="w-full min-w-175">
        {ROOMS.map(({ name, x }) => {
          const fans = byRoom(name, "fan");
          const lights = byRoom(name, "light");
          return (
            <g key={name}>
              <rect
                x={x}
                y={10}
                width={ROOM_WIDTH}
                height={ROOM_HEIGHT}
                rx={10}
                fill="#0b0d12"
                stroke="#374151"
                strokeWidth="1.5"
              />
              <text x={x + 12} y={30} fill="#9ca3af" fontSize="13" fontWeight="600">
                {name}
              </text>

              {/* Lights */}
              {lights.map((l, i) => {
                const cx = x + 30 + i * 70;
                const cy = 60;
                return (
                  <g key={l._id}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={14}
                      fill={l.status ? "#fde68a" : "#1f2937"}
                      stroke={l.status ? "#f59e0b" : "#4b5563"}
                      strokeWidth="2"
                    >
                      {l.status && (
                        <animate attributeName="opacity" values="1;0.6;1" dur="1.8s" repeatCount="indefinite" />
                      )}
                    </circle>
                    <text x={cx} y={cy + 30} fill="#6b7280" fontSize="9" textAnchor="middle">
                      {l.name}
                    </text>
                  </g>
                );
              })}

              {/* Fans */}
              {fans.map((f, i) => {
                const cx = x + 60 + i * 110;
                const cy = 150;
                return (
                  <g key={f._id}>
                    <g transform={`translate(${cx},${cy})`}>
                      {f.status && (
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0"
                          to="360"
                          dur="1.2s"
                          repeatCount="indefinite"
                          additive="sum"
                        />
                      )}
                      <circle r={18} fill="none" stroke={f.status ? "#34d399" : "#4b5563"} strokeWidth="2" />
                      {[0, 90, 180, 270].map((deg) => (
                        <line
                          key={deg}
                          x1="0"
                          y1="0"
                          x2={18 * Math.cos((deg * Math.PI) / 180)}
                          y2={18 * Math.sin((deg * Math.PI) / 180)}
                          stroke={f.status ? "#34d399" : "#6b7280"}
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      ))}
                    </g>
                    <text x={cx} y={cy + 32} fill="#6b7280" fontSize="9" textAnchor="middle">
                      {f.name}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
