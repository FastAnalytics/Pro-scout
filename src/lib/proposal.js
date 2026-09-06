const OPENERS = [
  (ccu, visits) =>
    `we've been watching it sit around ${ccu} live players on ${visits} total visits, which is honestly a wild retention ratio for any genre on the platform.`,
  (ccu, visits) =>
    `${ccu} live players on just ${visits} visits is honestly a wild ratio, way above what we normally see even in established titles.`,
  (ccu, visits) =>
    `we've been watching it sit at ${ccu} live players on only ${visits} total visits, which is honestly a wild ratio compared to platform average.`,
  (ccu, visits) =>
    `we've been watching it sit at ${ccu} live players on only ${visits} total visits, which is a pretty insane conversion for any genre on the platform right now.`,
];

const ASKS = [
  "would you be open to sharing some stats — retention, DAU, revenue if you're comfortable — and anything else you think tells the full story?",
  "would you be open to sharing some stats — retention, DAU, revenue if you're comfortable — and anything else you think tells the story?",
  "would you be open to sharing some stats — retention, DAU, revenue if you're comfortable — and anything else you think tells the story of where the game's at?",
  "would you be open to sharing some stats — retention, DAU, revenue if you're comfortable — and anything else you think matters about where the game's headed?",
];

const INVITES = [
  "also would it be okay if we added you to a group chat with the rest of our team so we can talk properly?",
  "also would it be okay if we added you to a group chat with the rest of the team so we can talk properly?",
  "also wanted to see if it'd be cool to pull you into a group chat with the rest of our team so we can actually talk through things properly.",
];

const CLOSERS = {
  acquisition:
    "thanks — we're potentially looking at acquisition so want to make sure the right people are in the room early.",
  "IP licensing":
    "thanks — we're particularly interested in the IP side of things and what that could look like.",
  "revenue share":
    "thanks — we'd love to explore what a revenue share setup could look like for you.",
  "group chat intro": "thanks — looking forward to the intro",
  "clone rights":
    "thanks — we're especially interested in understanding the IP and whether clone rights are something you'd consider discussing.",
};

function roundLoose(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n / 100) * 100 || n);
}

// Deterministic per game+focus so the same card always drafts the same DM.
function pick(list, seed) {
  return list[Math.abs(seed) % list.length];
}

export function buildProposal(game, focus = "acquisition") {
  const seed = Number(game.universeId || 0) + focus.length;
  const ccu = roundLoose(game.playing);
  const visits = roundLoose(game.visits);
  const closer = CLOSERS[focus] || CLOSERS.acquisition;

  return [
    `hey, i'm a scout from pain interactive — wanted to reach out about ${game.name}.`,
    pick(OPENERS, seed)(ccu, visits),
    pick(ASKS, seed),
    pick(INVITES, seed),
    closer,
  ].join(" ");
}
