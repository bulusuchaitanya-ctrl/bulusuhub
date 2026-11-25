/*
  ============================================================
  CONTENT FILE: the only file you edit to publish.
  ============================================================

  1) SUBSCRIBE_ENDPOINT
     Paste your Google Apps Script web app URL here (see SETUP.md).
     Until you do, the subscribe form shows a "not connected yet" note.

  2) DAILY POSTS (posts list)
     Add a new post at the TOP of the list each day. Fields:
       id:      short unique slug, lowercase, hyphens only (used in the URL)
       date:    "YYYY-MM-DD"
       title:   headline
       track:   "Industrial AI" or "Physical AI"
       summary: one or two sentences shown in the list
       body:    the full post. Separate paragraphs with a blank line.
                Lines starting with "## " become subheadings.

  3) PUBLISHED ARTICLES (articles list)
     Your pieces in magazines and other sites. Fields:
       title, outlet, date ("YYYY-MM" or "YYYY-MM-DD"), track,
       url:    full link once it is live; leave "" while forthcoming
       status: "Published" or "Forthcoming"
*/

window.SITE_CONFIG = {
  SUBSCRIBE_ENDPOINT: "",          // e.g. "https://script.google.com/macros/s/XXXX/exec"
  AUTHOR: "Chaiitanya Bulusu",
  EMAIL: "cb@bulusuhub.com",
  LINKEDIN: "https://www.linkedin.com/in/bulusuchaiitanya",
  POPUP_DELAY_SECONDS: 25,          // popup appears after this many seconds...
  POPUP_SCROLL_PERCENT: 50,         // ...or after scrolling this far, whichever comes first
  POPUP_REPEAT_DAYS: 7,             // after closing, do not show again for this many days

  // ---- Community: discussions (Giscus, powered by GitHub Discussions; see SETUP.md step 5) ----
  // Copy these four values from giscus.app after enabling Discussions on your repository.
  GISCUS: {
    repo: "bulusuchaitanya-ctrl/bulusuhub",
    repoId: "",        // e.g. "R_kgDOxxxxxx"
    category: "General",
    categoryId: ""     // e.g. "DIC_kwDOxxxxxx"
  }
};

// Discussion rooms on the Community page. Add, rename or remove freely.
// "id" must stay the same once people have posted in a room.
window.COMMUNITY_TOPICS = [
  { id: "pilot-to-plant",  title: "From pilot to plant",          prompt: "Why do industrial AI pilots stall, and what has actually helped them scale in your plant?" },
  { id: "physical-ai",     title: "Physical AI on the floor",     prompt: "Robots, inspection crawlers, autonomous systems. What is real today and what is still a demo?" },
  { id: "reliability",     title: "Reliability and maintenance",  prompt: "Prescriptive maintenance, alerts that get acted on, and the metrics that matter." },
  { id: "ask-cb",          title: "Ask me anything",              prompt: "Questions on industrial AI strategy, go-to-market, or building a career in this space." }
];

window.SITE_DATA = {
  posts: [
    {
      id: "why-this-journal",
      date: "2026-11-25",
      title: "Why I am writing one note a day on industrial AI",
      track: "Industrial AI",
      summary: "Most industrial AI works in the pilot and stalls before the plant. This journal is a daily record of why, and what fixes it.",
      body: `Most industrial AI does not fail in the lab. It fails in the gap between a pilot that worked and a plant that never adopted it.

I have spent two decades in that gap: selling automation, building analytics products, and sitting with maintenance teams in cement, steel, pulp, tyre and chemical plants across several countries.

## What to expect here

One short note every day. Some on industrial AI: reliability, prescriptive maintenance, why pilots stall. Some on physical AI: robots, autonomy and machines that act in the real world.

No vendor pitches. Just what I see working, what does not, and why.

If that is useful to you, subscribe and it will arrive in your inbox.`
    }
  ],

  articles: [
    {
      title: "Why Cranes Break Differently, and Why Conventional Monitoring Misses It",
      outlet: "Machine Maker",
      date: "2026-11-11",
      track: "Industrial AI",
      url: "https://themachinemaker.com/technology/ladle-crane-condition-monitoring/",
      status: "Published"
    },
    {
      title: "The Two-Factory World: How Industrial AI Stitches India's Manufacturing Rise to America's Industrial Renewal",
      outlet: "Machine Maker",
      date: "2026-10-11",
      track: "Industrial AI",
      url: "https://themachinemaker.com/technology/industrial-ai-india-us-manufacturing/",
      status: "Published"
    },
    {
      title: "Autonomy Is Not a Software Module: Designing the Operating Model Behind the Autonomous Plant",
      outlet: "Machine Maker",
      date: "2026-08-07",
      track: "Industrial AI",
      url: "https://themachinemaker.com/technology/autonomous-plant-operating-model/",
      status: "Published"
    },
    {
      title: "The Reliability Balance Sheet: Converting Uptime Into a Measurable Capital Multiplier",
      outlet: "Machine Maker",
      date: "2026-05-13",
      track: "Industrial AI",
      url: "https://themachinemaker.com/technology/reliability-balance-sheet-uptime-capital/",
      status: "Published"
    },
    {
      title: "The Automation Stack Can Execute Any Decision Except the One That Matters: Why Physical AI Is the Missing Layer of Industrial Reliability",
      outlet: "Machine Maker",
      date: "2026-02-27",
      track: "Physical AI",
      url: "https://themachinemaker.com/technology/physical-ai-industrial-reliability/",
      status: "Published"
    },
    {
      title: "The Install Was Yours. The Annuity Never Was.",
      outlet: "Infinite Uptime Blog",
      date: "2026-10-01",
      track: "Industrial AI",
      url: "https://www.infinite-uptime.com/system-integrators-recurring-revenue-ai-shield/",
      status: "Published"
    },
    {
      title: "How System Integrators Can Deliver Prescriptive Maintenance Without Building It From Scratch",
      outlet: "Infinite Uptime Blog",
      date: "2026-09-16",
      track: "Industrial AI",
      url: "https://www.infinite-uptime.com/prescriptive-maintenance-for-system-integrators/",
      status: "Published"
    },
    {
      title: "The Prescriptive Imperative: Rethinking Mechanical Fault Reliability in EOT & Ladle Cranes",
      outlet: "Overhead Crane & Hoist (whitepaper)",
      date: "2026-08",
      track: "Industrial AI",
      url: "https://www.ochmagazine.com/whitepapers/the-prescriptive-imperative-rethinking-mechanical-fault-reliability-in-eot-ladle-cranes/",
      status: "Published"
    },
    {
      title: "Your Crane Doesn't Fail on a Schedule. So Why Is It Monitored on One?",
      outlet: "Infinite Uptime Blog",
      date: "2026-06-24",
      track: "Industrial AI",
      url: "https://www.infinite-uptime.com/your-crane-doesnt-fail-on-a-schedule-so-why-is-it-monitored-on-one/",
      status: "Published"
    },
    {
      title: "Your Crane Is Already Going Down. You Just Don't Know It Yet",
      outlet: "Infinite Uptime Blog",
      date: "2026",
      track: "Industrial AI",
      url: "https://www.infinite-uptime.com/your-crane-is-already-going-down-you-just-dont-know-it-yet/",
      status: "Published"
    },
    {
      title: "Why Industrial AI Pilots Stall in Indian Plants After the Model Works",
      outlet: "Express Computer",
      date: "",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    },
    {
      title: "Measure Prescriptions Acted On, Not Alerts Sent",
      outlet: "Reliable Plant",
      date: "",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    },
    {
      title: "Five Early Warnings Your Pump Is Heading for Failure",
      outlet: "Engineering Review",
      date: "",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    },
    {
      title: "Connected Machine Tools: How Indian Builders Can Turn Service into a Competitive Edge",
      outlet: "Modern Manufacturing India",
      date: "",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    }
  ],

  // Interviews and features about you (same fields as articles)
  interviews: [
    {
      title: "Interview: Redefining Industrial Operations with Agentic AI",
      outlet: "TechBullion",
      date: "2026-02-11",
      track: "Industrial AI",
      url: "https://techbullion.com/interview-redefining-industrial-operations-with-agentic-ai/",
      status: "Published"
    },
    {
      title: "Transforming Manufacturing Reliability: Outcome-Driven Partnerships in the Americas",
      outlet: "The Sun Bulletin",
      date: "2025-08-30",
      track: "Industrial AI",
      url: "https://www.thesunbulletin.com/transforming-manufacturing-reliability-an-interview-with-chaiitanya-bulusu-cb-on-outcome-driven-partnerships-in-the-americas/",
      status: "Published"
    },
    {
      title: "Executive Growth Movers & Shakers Interview",
      outlet: "Frost & Sullivan",
      date: "2025-05-29",
      track: "Industrial AI",
      url: "https://www.frost.com/growth-opportunity-news/industrial/executive-growth-movers-shakers-interview-with-chaiitanya-bulusu-svp-business-head-americas-infinite-uptime/",
      status: "Published"
    }
  ]
};
