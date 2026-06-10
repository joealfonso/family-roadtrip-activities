import { ActivityType } from "./activities";

export const SLUG_TO_TYPE: Record<string, ActivityType> = {
  talk:      "conversation",
  fact:      "fact",
  truefalse: "trueFalse",
  quiz:      "quiz",
  game:      "game",
  riddle:    "riddle",
  rhyme:     "rhyme",
};

export const TYPE_TO_SLUG: Record<ActivityType, string> = {
  conversation: "talk",
  fact:         "fact",
  trueFalse:    "truefalse",
  quiz:         "quiz",
  game:         "game",
  riddle:       "riddle",
  rhyme:        "rhyme",
};

export const CATEGORY_META: Record<ActivityType, {
  color:   string;
  label:   string;
  tagline: string;
  emoji:   string;
}> = {
  conversation: { color: "#E8472A", label: "Talk It Out",  tagline: "Spark a real conversation",  emoji: "💬" },
  fact:         { color: "#2F9E6E", label: "Fun Fact",      tagline: "Learn something wild",        emoji: "💡" },
  trueFalse:    { color: "#1B72C0", label: "True or False", tagline: "Think you know?",             emoji: "🤔" },
  quiz:         { color: "#C98A00", label: "Quiz Time",     tagline: "Test the whole crew",         emoji: "🧠" },
  game:         { color: "#7048B6", label: "Mini Game",     tagline: "Everyone gets involved",      emoji: "🎮" },
  riddle:       { color: "#C93475", label: "Riddle",        tagline: "Can you figure it out?",      emoji: "🔍" },
  rhyme:        { color: "#D97706", label: "Rhyme Time",    tagline: "Verse, rap, and wordplay",    emoji: "🎤" },
};

export const ALL_TYPES: ActivityType[] = [
  "conversation", "fact", "trueFalse", "quiz", "game", "riddle", "rhyme",
];
