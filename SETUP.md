# bulusuhub.com: Writing site setup

## What is in this folder

| File | Upload to GitHub? | Purpose |
|---|---|---|
| index.html | Yes (replaces the placeholder) | Home: daily notes + published articles + subscribe |
| post.html | Yes | Page that shows one daily note, with its discussion |
| community.html | Yes | Community: idea form, idea wall, discussion rooms |
| assets/style.css, assets/site.js | Yes (keep the `assets` folder) | Design and behaviour |
| data/content.js | Yes (keep the `data` folder) | **Your content. The only file you edit to publish.** |
| apps-script/Code.gs | No | Paste into Google Apps Script (step 2) |
| SETUP.md | No | This guide |

## Step 1: Upload the site to GitHub
1. Open your `bulusuhub` repository on GitHub.
2. **Add file → Upload files**. Drag in `index.html`, `post.html`, and the `assets` and `data` folders (drag the folders themselves so the structure is kept).
3. **Commit changes**. The site updates in about a minute.

## Step 2: Create the subscriber repository (Google Sheet, free)
1. Go to sheets.google.com and create a blank sheet. Name it **bulusuhub subscribers**.
2. In the sheet: **Extensions → Apps Script**.
3. Delete the sample code, paste all of `apps-script/Code.gs`, and click **Save**.
4. At the top of the code, replace `POSTAL_ADDRESS` with your postal address or a PO box (US anti-spam law requires one in every newsletter email).
5. In the function dropdown pick **setup**, click **Run**, and approve the permissions Google asks for. This creates two tabs: **Subscribers** and **Outbox**.
6. Click **Deploy → New deployment → gear icon → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, then copy the **Web app URL** (ends in `/exec`).
7. Open `data/content.js`, paste that URL into `SUBSCRIBE_ENDPOINT` between the quotes, and upload `content.js` to the `data` folder on GitHub again.

**Test:** open bulusuhub.com, subscribe with your own email, and check that a row appears in the **Subscribers** tab.

## Step 3: Publish a daily note
1. In `data/content.js`, copy an existing post block and paste it at the **top** of the `posts` list. Change `id`, `date`, `title`, `track`, `summary`, `body`.
2. Upload `content.js` to GitHub. The note is live at `https://bulusuhub.com/post.html?p=YOUR-ID`.
3. To email it: in the Google Sheet **Outbox** tab, add a row with Title, URL and Summary. Then in Apps Script run **sendNextPost**.
4. To automate sending: Apps Script → **Triggers** (clock icon) → **Add Trigger** → function `sendNextPost`, event source **Time-driven**, **Day timer**, pick an hour. Each day it sends the next unsent Outbox row (and does nothing if there is none).

## Step 4: Add a published article
In `data/content.js`, edit the `articles` list. When a piece goes live, paste its link into `url` and change `status` to `"Published"`. The five pieces already listed are marked Forthcoming with no links.

## Step 5: Turn on discussions (free, GitHub Discussions + Giscus)
Discussion rooms on the Community page and the comments under each daily note use **Giscus**. Visitors sign in with a free GitHub account to post. Everything is stored as Discussions in your own repository.
1. In your `bulusuhub` repository: **Settings → General → Features → tick Discussions**.
2. Install the Giscus app: open **github.com/apps/giscus → Install**, and choose **Only select repositories → bulusuhub**.
3. Go to **giscus.app**. In "Repository" type `bulusuchaitanya-ctrl/bulusuhub` (it should say the repository meets all criteria). Under "Discussion Category" pick **General**.
4. Scroll to "Enable giscus". In the code shown, copy the values of `data-repo-id` and `data-category-id`.
5. Paste them into `data/content.js` under `GISCUS` (`repoId` and `categoryId`) and upload `content.js` again.
6. You moderate everything from the repository's **Discussions** tab (edit, hide, lock or delete).

## Step 6: Moderate the idea wall
New ideas land in the **Ideas** tab of the Google Sheet with Status `pending`. Type `approved` in the Status cell to publish one on the idea wall. Anything else stays private. If you deployed the Apps Script before this update, paste the new `Code.gs`, run `setup` once, then **Deploy → Manage deployments → edit → Version: New version → Deploy** (the URL stays the same).

## Limits to know
- **Sending limit.** Free Google accounts can only send a limited number of emails per day from Apps Script (around 100 recipients per day; check Google's "Apps Script quotas" page for the current figure). `sendNextPost` checks the quota first and sends nothing if your list is larger than what is left that day.
- **When you outgrow it:** download the Subscribers tab as CSV (File → Download → CSV) and import the active rows into a newsletter service with a large free tier (for example Substack). The Google Sheet stays your master copy.
- **Sender address.** Emails go out from the Google account that owns the script, with replies directed to cb@bulusuhub.com.
- **Discussions need a GitHub login.** Many plant engineers do not have one. That is why the idea form needs no login at all. If the community grows, a LinkedIn group can run alongside.
- **Consent.** Only email people who subscribed through the form. Never add contacts by hand from LinkedIn or business cards.
