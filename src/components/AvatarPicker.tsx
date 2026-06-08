"use client";
import { useState } from "react";

export const AVATARS = [
  { emoji: "🦙", name: "Llamaface McGee" },
  { emoji: "🐸", name: "Frogsworth III" },
  { emoji: "🦄", name: "Glitter Hooves" },
  { emoji: "🤖", name: "Beep Boop 3000" },
  { emoji: "🧌", name: "Grumpy Troll" },
  { emoji: "🦖", name: "Tiny Arms Rex" },
  { emoji: "🐙", name: "Eight Legs Earl" },
  { emoji: "🦑", name: "Squidward Jr." },
  { emoji: "🧟", name: "Undead Carl" },
  { emoji: "👾", name: "Pixel Destroyer" },
  { emoji: "🐵", name: "Banana Bandit" },
  { emoji: "🦊", name: "Sneaky McFox" },
  { emoji: "🐳", name: "Blowhole Betty" },
  { emoji: "🦩", name: "Fancy Flamingo" },
  { emoji: "🐉", name: "Discount Dragon" },
  { emoji: "🧸", name: "Stinky Bear" },
  { emoji: "🐡", name: "Pufferfish Pete" },
  { emoji: "🦔", name: "Spike McPrickle" },
  { emoji: "🐧", name: "Tuxedo Wobbles" },
  { emoji: "🦭", name: "Clappy McSeal" },
  { emoji: "🧊", name: "Glacier Gary" },
  { emoji: "🏔️", name: "Mountain Maniac" },
  { emoji: "🐻", name: "Bear Grylls Jr." },
  { emoji: "🦅", name: "Eagle McScreech" },
];

interface Props {
  value: string;
  playerName: string;
  onSelect: (emoji: string, name: string) => void;
}

export default function AvatarPicker({ value, playerName, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const current = AVATARS.find((a) => a.emoji === value) ?? AVATARS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col items-center gap-1 group"
        title="Change avatar"
      >
        <span className="text-5xl transition-transform group-hover:scale-110 group-active:scale-95">
          {current.emoji}
        </span>
        <span className="text-xs font-bold text-gray-500">{playerName || current.name}</span>
        <span className="text-xs text-indigo-500 underline">change</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 w-72 max-h-64 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            Pick your avatar
          </p>
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((av) => (
              <button
                key={av.emoji}
                onClick={() => {
                  onSelect(av.emoji, av.name);
                  setOpen(false);
                }}
                className={`flex flex-col items-center p-2 rounded-xl transition-all hover:bg-indigo-50 active:scale-90
                  ${av.emoji === value ? "bg-indigo-100 ring-2 ring-indigo-400" : ""}`}
                title={av.name}
              >
                <span className="text-2xl">{av.emoji}</span>
                <span className="text-[9px] text-gray-500 mt-0.5 text-center leading-tight line-clamp-2">
                  {av.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
