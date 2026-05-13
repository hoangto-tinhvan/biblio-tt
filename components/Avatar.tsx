"use client";

const COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return COLORS[h % COLORS.length];
}

interface Props {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-9 h-9 text-sm", md: "w-14 h-14 text-xl", lg: "w-20 h-20 text-2xl" };

export default function Avatar({ name, avatarUrl, size = "md" }: Props) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} ${colorFor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}
