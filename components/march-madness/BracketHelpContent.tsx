
"use client";

import Link from "next/link";

const sections = [
  {
    number: "01",
    title: "Create Your Bracket",
    subtitle: "Your entry starts here.",
    content: [
      {
        heading: "Your Name",
        text: "The name displayed to identify you in the competition.",
      },
      {
        heading: "Username",
        text: "Optional, but recommended. Give yourself a recognizable identity in the BracketBoss community.",
      },
      {
        heading: "Passcode",
        text: "Use the passcode associated with your account. You'll need it when accessing and editing your brackets.",
      },
      {
        heading: "Bracket Name",
        text: "Give your entry a unique name. Make it competitive, creative, or completely ridiculous. It's your bracket!",
      },
      {
        heading: "Championship Tiebreaker",
        text: "Predict the combined final score of BOTH teams in the National Championship game. This prediction is used to separate players who finish with the same points.",
      },
    ],
  },
  {
    number: "02",
    title: "Fill Out Your Bracket",
    subtitle: "Pick your winners. Build your path to the championship.",
    content: [
      {
        heading: "Opening Round",
        text: "Start by selecting the winners of the Opening Round games. These teams feed into the main tournament bracket. The Opening Round is new in 2027, so don't worry if you have never heard of this round before!",
      },
      {
        heading: "The Four Regions",
        text: "Work through the East, West, South, and Midwest regions. Select the team you believe will win each matchup and advance.",
      },
      {
        heading: "Final Four",
        text: "Choose the teams you believe will survive their regions and reach the national semifinals.",
      },
      {
        heading: "National Championship",
        text: "Select your two finalists and ultimately predict the National Champion.",
      },
      {
        heading: "Think Ahead",
        text: "Every selection affects the matchups in later rounds. Your bracket is a complete prediction of how the tournament will unfold, not just a collection of individual game picks.",
      },
    ],
  },
  {
    number: "03",
    title: "How Scoring Works",
    subtitle: "Correct picks earn points. The deeper the tournament, the bigger the reward.",
    content: [],
  },
  {
    number: "04",
    title: "The BracketBoss Cheat Sheet",
    subtitle: "Don't just pick teams. Understand the matchups.",
    content: [
      {
        heading: "Matchup Projections",
        text: "Review the matchup information and projections to understand how the teams compare.",
      },
      {
        heading: "Team Comparisons",
        text: "Compare records, recent performance, strength of schedule, and results against top-10 opponents.",
      },
      {
        heading: "Historical Context",
        text: "Explore historical information that can help put a matchup into perspective.",
      },
      {
        heading: "BracketBoss Intelligence",
        text: "Read the Analyst's Take for an interpretation of the matchup and the statistical advantages each team may have.",
      },
      {
        heading: "Pick & Points",
        text: "See exactly what a correct selection could earn you. The Cheat Sheet explains the round's base points, seed bonus, and special Opening Round advancement bonus.",
      },
    ],
  },
  {
    number: "05",
    title: "Track Your Progress",
    subtitle: "The tournament doesn't stop after you submit your picks.",
    content: [
      {
        heading: "Active Leaderboard With a Twist",
        text: "Follow the competition, watch the rankings change, and see how your bracket stacks up against everyone else. Paid tournament, make sure the competition earned that payout, and if they didn't? Shame Shame!",
      },
      {
        heading: "Live Scoring",
        text: "As official game results are entered, your correct picks earn points and your leaderboard position can change.",
      },
      {
        heading: "Maximum Possible Points",
        text: "This is the highest score your bracket can still achieve based on the remaining possible outcomes. Every incorrect pick that eliminates a scoring opportunity reduces that number.",
      },
      {
        heading: "Your Brackets",
        text: "Use the Hub to view your entries or return to the editor to review and update your bracket when editing is available.",
      },
      {
        heading: "Champion Picks",
        text: "See which teams are the most popular championship selections once the pick deadline has passed and those selections are unlocked.",
      },
      {
        heading: "The Forum",
        text: "Talk basketball, debate picks, share opinions, and enjoy the tournament with the BracketBoss community.",
      },
    ],
  },
  {
    number: "06",
    title: "Important Rules & Expectations",
    subtitle: "A few things every BracketBoss competitor should know.",
    content: [
      {
        heading: "Watch the Deadline",
        text: "The official pick-lock deadline is displayed on the Hub. Your selections lock at the time specified there. Don't wait until the last minute!",
      },
      {
        heading: "Check Your Entire Bracket",
        text: "Review your selections from the Opening Round through the Championship before the deadline.",
      },
      {
        heading: "Correct Picks Matter",
        text: "Points are awarded for correctly predicting official tournament game winners. Picking a team that loses does not earn points for that game.",
      },
      {
        heading: "Keep Your Login Information",
        text: "Your email and passcode are important for accessing your BracketBoss account and managing your entries.",
      },
      {
        heading: "Enjoy the Competition",
        text: "Debate, compete, celebrate the upsets, and enjoy March Madness. There is always room for a little BracketBoss bragging rights!",
      },
    ],
  },
];

export default function BracketHelpContent() {
  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[#102a45] to-[#0b1729] p-6 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-amber-300 bg-orange-500 text-5xl shadow-lg">
            🏀
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Your BracketBoss Guide
            </div>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              Hey, Bracket Boss!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Whether this is your first bracket or your fifteenth,
              I'm here to help you understand the game, make your
              picks, and compete with confidence.
            </p>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <section
          key={section.number}
          className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0d1a2e]"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-[#142c48] to-[#0e1c30] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-sm font-black text-cyan-300">
                {section.number}
              </span>
              <div>
                <h3 className="text-lg font-black text-white">
                  {section.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {section.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            {section.number === "03" && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[280px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="py-3">Round</th>
                        <th className="py-3 text-right">Base Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Opening Round", 1],
                        ["Round of 64", 1],
                        ["Round of 32", 2],
                        ["Sweet 16", 4],
                        ["Elite 8", 8],
                        ["Final Four", 16],
                        ["Championship", 32],
                      ].map(([round, points]) => (
                        <tr
                          key={round}
                          className="border-b border-white/5"
                        >
                          <td className="py-3 font-semibold text-slate-200">
                            {round}
                          </td>
                          <td className="py-3 text-right font-black text-cyan-300">
                            {points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
                  <h4 className="font-black text-cyan-200">
                    The Seed Bonus
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    For a correct pick, you earn the round's base
                    points PLUS the winning team's seed number.
                    The seed bonus is based on the winner's seed,
                    not the difference between the teams' seeds.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                  <h4 className="font-black text-amber-200">
                    The Opening Round Special Rule
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Opening Round winners earn the 1 base point,
                    with no seed bonus.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    If a team appeared in the official Opening
                    Round, its later tournament wins receive a
                    fixed 14-point bonus INSTEAD of the normal
                    seed bonus.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
                  <h4 className="font-black text-emerald-200">
                    Scoring Examples
                  </h4>
                  <ul className="mt-3 space-y-3 text-sm text-slate-300">
                    <li>
                      <strong className="text-white">
                        Regular No. 12 seed wins in the Round of 64:
                      </strong>
                      <br />
                      1 base point + 12 seed points = 13 points.
                    </li>
                    <li>
                      <strong className="text-white">
                        Opening Round team wins in the Round of 64:
                      </strong>
                      <br />
                      1 base point + 14 play-in bonus = 15 points.
                    </li>
                    <li>
                      <strong className="text-white">
                        Opening Round team wins in the Round of 32:
                      </strong>
                      <br />
                      2 base points + 14 play-in bonus = 16 points.
                    </li>
                  </ul>
                </div>

                <p className="text-xs leading-relaxed text-slate-400">
                  Important: Points are earned only when your
                  selected winner matches the official game result.
                </p>
              </>
            )}

            {section.content.map((item) => (
              <div key={item.heading}>
                <h4 className="text-sm font-extrabold text-cyan-200">
                  {item.heading}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}

            {section.number === "04" && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
                <p className="text-sm font-bold text-amber-200">
                  BracketBoss Cheat Sheet Tip
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Strength of schedule deserves a closer look:
                  a lower SOS ranking number represents a tougher
                  schedule. Don't automatically assume a higher
                  number means a stronger team.
                </p>
              </div>
            )}
          </div>
        </section>
      ))}

      <div className="rounded-2xl border border-cyan-400/30 bg-[#10243b] p-6 text-center">
        <div className="text-4xl">🏆</div>
        <h3 className="mt-3 text-xl font-black text-white">
          Now You're Ready!
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
          Make your picks, trust your instincts, use your
          BracketBoss Cheat Sheet, and enjoy the madness.
          May your bracket survive!
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/sports/march-madness-v2"
            className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
          >
            Back to the Hub
          </Link>

          <Link
            href="/sports/march-madness-v2/bracket/new"
            className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/20"
          >
            Create a Bracket
          </Link>
        </div>
      </div>
    </div>
  );
}
