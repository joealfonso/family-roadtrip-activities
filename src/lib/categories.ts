import { ActivityType } from "./activities";

export const SLUG_TO_TYPE: Record<string, ActivityType> = {
  talk:      "conversation",
  fact:      "fact",
  truefalse: "trueFalse",
  quiz:      "quiz",
  game:      "game",
  riddle:    "riddle",
};

export const TYPE_TO_SLUG: Record<ActivityType, string> = {
  conversation: "talk",
  fact:         "fact",
  trueFalse:    "truefalse",
  quiz:         "quiz",
  game:         "game",
  riddle:       "riddle",
};

export const CATEGORY_META: Record<ActivityType, {
  color: string;
  label: string;
  tagline: string;
}> = {
  conversation: { color: "#E8472A", label: "Talk It Out",  tagline: "Start a conversation"   },
  fact:         { color: "#2F9E6E", label: "Fun Fact",      tagline: "Learn something wild"   },
  trueFalse:    { color: "#1B72C0", label: "True or False", tagline: "Think you know?"        },
  quiz:         { color: "#C98A00", label: "Quiz Time",     tagline: "Test the crew"          },
  game:         { color: "#7048B6", label: "Mini Game",     tagline: "Everyone gets involved" },
  riddle:       { color: "#C93475", label: "Riddle",        tagline: "Figure it out"          },
};

export const ALL_TYPES: ActivityType[] = [
  "conversation", "fact", "trueFalse", "quiz", "game", "riddle",
];
