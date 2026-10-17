# Sandie Dela Cruz · Marketing AI Capabilities Portfolio

An independent application portfolio tailored to Amgen’s **Director, Marketing AI Capabilities** role in GCCI. The homepage demonstrates proposed strategic thinking and leadership approaches; the interactive **AI Fluency for Marketing Teams: From Aware to Builder** course is featured at `ai-fluency/`.

Four lessons cover the operating model, capability ladder, six-week cohort, and governance and measurement. Activities include quizzes with feedback, evidence matching, a cohort explorer, a showcase scoring tool, saved progress, and a downloadable action plan.

## Publish with GitHub Pages

1. In this repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/ (root)**, then **Save**.
4. Wait for GitHub's deployment to finish. The expected address is https://sandiejotrina.github.io/AI/.

The portfolio is at the repository root; the course is at `ai-fluency/`. All assets use relative paths and work under the `/AI/` Pages path. No build, backend, API key, or application dependency installation is required. `.nojekyll` allows GitHub Pages to serve the static files directly.

Pushing the files does not itself enable GitHub Pages. Use the deployment status in Settings → Pages to confirm publication.

## Run locally

From this checkout:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open the server's root path. All course assets are local; the application makes no third-party font, image, analytics, or AI API requests.

## Browser validation

Requires Node.js, Playwright, and Chromium. Run:

```sh
node tests/portfolio.cjs
node tests/ai-fluency.cjs
```

If Playwright is unavailable, install test tooling outside the checkout:

```sh
npm install --prefix /tmp/ai-fluency-tools --no-save playwright
NODE_PATH=/tmp/ai-fluency-tools/node_modules node tests/ai-fluency.cjs
```

The test uses `/usr/bin/chromium` when available. Set `CHROMIUM_PATH` for another installed browser, or install Playwright's Chromium browser. Both tests start their own temporary HTTP servers. The portfolio test models the `/AI/` Pages mount and checks pilot decisions, scenario and timeline tabs, keyboard navigation, the downloadable brief, course navigation, legacy bookmarks, mobile layouts, and readable content without JavaScript. The course test checks lesson activities, scoring boundaries and controls, persistence, downloads, reset confirmation, mobile layout, and unavailable storage.

## Content and privacy

Adapted from the user-supplied Rise 360 build sheet, with sources attributed within the course. This is an illustrative portfolio sample, not Amgen material, medical advice, or a course reviewed by Medical, Legal, or Regulatory. Career results and posting quotations are attributed as supplied. This standalone website is not a Rise 360 source file or SCORM/LMS package.

Progress and reflections are stored only in the current browser and origin. Nothing is sent to a server. Do not enter patient, customer, or confidential information. Completing the lesson checks does not certify a capability rung or authorize a pilot.

## Portfolio evidence and concepts

- **Career outcomes:** 45% improvement in adoption and 63% improvement in new-hire success, attributed to the Envista and Sonova career materials referenced in the user-supplied build sheet. No new revenue, campaign, people-management, degree, or employment claims are added.
- **Command center:** a front-end decision-support concept, with three entirely fictional pilots and explicitly illustrative metrics. It is not connected to Amgen systems or live data, and does not claim to implement the company's Marketing Command Center or Neural Nexis.
- **Foresight and partnerships:** proposed hypotheses, screening gates, and pilot-to-scale decisions rather than claims about current market research or actual vendor engagements.
- **First 90 days:** a proposed discussion framework, available as a downloadable text brief. It assumes no internal knowledge of Amgen.

The former root course bookmarks (for example `#capability-ladder`) redirect to the corresponding `ai-fluency/` lesson. The local-storage key is unchanged, so existing progress on the same origin is retained. No analytics, forms that transmit data, or application backend are added.
