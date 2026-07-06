// The "magic picture password" icon set. Kids tap a sequence of these in
// order instead of typing anything — works for a 3-year-old just as well
// as an 11-year-old. Order in this array = the index used to store a code.
export const GATE_ICONS = [
  { id: "mouse", emoji: "🐭", label: "Mouse" },
  { id: "snowflake", emoji: "❄️", label: "Snowflake" },
  { id: "wave", emoji: "🌊", label: "Wave" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "moon", emoji: "🌙", label: "Moon" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow" },
  { id: "balloon", emoji: "🎈", label: "Balloon" },
  { id: "crown", emoji: "👑", label: "Crown" },
  { id: "flower", emoji: "🌸", label: "Flower" },
] as const;

export const DEFAULT_GATE_CODE = [3, 4, 5]; // Star, Heart, Moon
