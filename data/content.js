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
  POPUP_REPEAT_DAYS: 7              // after closing, do not show again for this many days
};

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
      title: "Measure Prescriptions Acted On, Not Alerts Sent",
      outlet: "Reliable Plant",
      date: "2026-12",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    },
    {
      title: "Five Early Warnings Your Pump Is Heading for Failure",
      outlet: "Engineering Review",
      date: "2026-12",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    },
    {
      title: "Connected Machine Tools: How Indian Builders Can Turn Service into a Competitive Edge",
      outlet: "Modern Manufacturing India",
      date: "2026-12",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    },
    {
      title: "Why Industrial AI Pilots Stall in Indian Plants After the Model Works",
      outlet: "Express Computer",
      date: "2026-12",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    },
    {
      title: "The Two-Factory World: How Industrial AI Stitches India's Manufacturing Rise to America's Industrial Renewal",
      outlet: "Essay",
      date: "2026",
      track: "Industrial AI",
      url: "",
      status: "Forthcoming"
    }
  ]
};
