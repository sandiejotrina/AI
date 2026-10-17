'use strict';

// This course is entirely local: no analytics, account, or AI service is connected.
const STORAGE_KEY = 'sandie-ai-fluency-v1';
const lessons = [
  { id: 'why-fluency', title: 'Why fluency, not tools', description: 'Recognize what makes AI a capability your team can trust.', activity: 'Explore the operating model' },
  { id: 'capability-ladder', title: 'The capability ladder', description: 'Move from Aware to Fluent to Builder—with evidence at every rung.', activity: 'Match the evidence' },
  { id: 'six-week-cohort', title: 'The six-week cohort', description: 'Turn a learning program into a rhythm of real marketing work.', activity: 'Explore the six-week plan' },
  { id: 'governance', title: 'Governance & measurement', description: 'Build the controls, choose the metrics, and score a pilot.', activity: 'Try the showcase rubric' }
];
const emptyState = () => ({ completed: [], answers: {}, matches: ['', '', ''], week: 0, scores: [0, 0, 0, 0, 0], plan: '' });
let state = emptyState();
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && typeof saved === 'object') {
    state.completed = [...new Set(Array.isArray(saved.completed) ? saved.completed.filter(id => lessons.some(l => l.id === id)) : [])];
    for (const id of ['why-fluency', 'six-week-cohort', 'governance']) {
      if (Number.isInteger(saved.answers?.[id]) && saved.answers[id] >= 0 && saved.answers[id] < 4) state.answers[id] = saved.answers[id];
    }
    if (Array.isArray(saved.matches) && saved.matches.length === 3) state.matches = saved.matches.map(v => ['Aware', 'Fluent', 'Builder'].includes(v) ? v : '');
    if (Number.isInteger(saved.week) && saved.week >= 0 && saved.week < 6) state.week = saved.week;
    if (Array.isArray(saved.scores) && saved.scores.length === 5) state.scores = saved.scores.map(v => Number.isInteger(v) && v >= 0 && v <= 4 ? v : 0);
    if (typeof saved.plan === 'string') state.plan = saved.plan.slice(0, 3000);
  }
} catch { storageAvailable = false; }

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const main = document.querySelector('#main');
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { storageAvailable = false; }
  const note = document.querySelector('#save-note');
  if (note) note.textContent = storageAvailable ? 'Saved in this browser. No information is sent to a server.' : 'Browser storage is unavailable. Download your plan before leaving this page.';
  if (!storageAvailable && !document.querySelector('.storage-warning')) main.insertAdjacentHTML('afterbegin', '<p class="storage-warning" role="status">Browser storage is unavailable. Your progress lasts for this visit only; download your action plan before leaving.</p>');
}
function announce(message) { document.querySelector('#announcement').textContent = message; }
function route() {
  const hash = location.hash.slice(1);
  return ['overview', ...lessons.map(l => l.id), 'your-next-step'].includes(hash) ? hash : 'overview';
}
function updateNav() {
  const pages = [{ id: 'overview', title: 'Start here', label: 'COURSE OVERVIEW' }, ...lessons.map((l, i) => ({ ...l, label: `LESSON 0${i + 1}` })), { id: 'your-next-step', title: 'Your next step', label: 'TAKE IT TO WORK' }];
  document.querySelector('#lesson-nav').innerHTML = pages.map((p, i) => `<a class="nav-item ${route() === p.id ? 'active' : ''}" href="#${p.id}" ${route() === p.id ? 'aria-current="page"' : ''}><span class="nav-number" aria-hidden="true">${state.completed.includes(p.id) ? '✓' : i === 0 ? '→' : i === 5 ? '→' : '0' + i}</span><span class="nav-title"><small>${p.label}</small>${p.title}${state.completed.includes(p.id) ? '<span class="sr-only"> — completed</span>' : ''}</span></a>`).join('');
  document.querySelector('#progress-count').textContent = `${state.completed.length} of 4`;
  document.querySelector('#course-progress').value = state.completed.length;
}
const accordion = items => `<div class="accordion">${items.map(([title, text]) => `<details><summary>${title}</summary><p>${text}</p></details>`).join('')}</div>`;
const quote = (text, source) => `<figure class="pullquote"><blockquote>“${text}”</blockquote><figcaption><cite>SANDIE DELA CRUZ · ${source}</cite></figcaption></figure>`;
const heading = (number, title, subtitle) => `<section class="hero"><p class="eyebrow">Lesson 0${number} of 04</p><h1>${title}</h1><p class="lead">${subtitle}</p></section>`;
const quizData = {
  'why-fluency': { question: 'Which is evidence that AI has become a capability rather than a tool?', options: ['Licenses were purchased for every marketer.', 'A workflow with a named reviewer is in daily use and its cycle time is measured.', 'A vendor demo impressed leadership.', 'Everyone completed an awareness video.'], correct: 1, feedback: 'Use + review + measurement is the test. Licenses, demos, and completions are activity, not capability.' },
  'six-week-cohort': { question: 'In Week 3, what happens to the Medical, Legal, and Regulatory review step?', options: ['AI replaces it for low-risk content.', 'It stays in place; AI shortens the work before and after it.', 'It moves to the champion.', 'It is sampled at 10 percent.'], correct: 1, feedback: 'Review is a fixed point. The program speeds up the draft and the rework, not the approval. FDA’s OPDP oversees prescription drug promotion.' },
  'governance': { question: '“A Builder submission that uses a sample of real customer emails for testing can pass if the reviewer is named.”', options: ['True', 'False'], correct: 1, feedback: 'De-identified or synthetic data is required for testing regardless of the reviewer (control 2). A named reviewer does not remove the data-handling requirement.' }
};
function quiz(id) {
  const q = quizData[id];
  return `<section class="quiz" aria-label="Knowledge check"><p class="quiz-tag">PAUSE & PRACTICE</p><form id="quiz-form"><fieldset><legend>${q.question}</legend>${q.options.map((option, i) => `<label class="option"><input type="radio" name="answer" value="${i}" ${state.answers[id] === i ? 'checked' : ''} required><span>${option}</span></label>`).join('')}</fieldset><button class="button" type="submit">Check answer <span aria-hidden="true">→</span></button><div id="quiz-feedback" class="feedback" role="status"></div></form></section>`;
}
function footer(id) {
  const i = lessons.findIndex(l => l.id === id);
  const next = lessons[i + 1]?.id || 'your-next-step';
  return `<div class="lesson-footer"><p id="completion-hint">${state.completed.includes(id) ? '✓ Lesson completed. You can revisit the activity anytime.' : 'Complete the knowledge check to mark this lesson complete.'}</p><div class="button-row"><a class="button secondary" href="#${i ? lessons[i - 1].id : 'overview'}">← ${i ? 'Previous lesson' : 'Overview'}</a><a class="button" href="#${next}">${i === 3 ? 'Your next step' : 'Next lesson'} <span aria-hidden="true">→</span></a></div></div>`;
}
function complete(id) {
  if (!state.completed.includes(id)) state.completed.push(id);
  save(); updateNav();
  document.querySelector('#completion-hint').textContent = '✓ Lesson completed. You can revisit the activity anytime.';
  announce(`Lesson complete. ${state.completed.length} of 4 lessons completed.`);
}
function bindQuiz(id) {
  document.querySelector('#quiz-form').addEventListener('submit', event => {
    event.preventDefault();
    const answer = Number(new FormData(event.target).get('answer'));
    state.answers[id] = answer; save();
    const correct = answer === quizData[id].correct;
    const feedback = document.querySelector('#quiz-feedback');
    feedback.className = `feedback ${correct ? 'correct' : 'incorrect'}`;
    feedback.textContent = correct ? `That’s right. ${quizData[id].feedback}` : `Not quite. ${quizData[id].feedback} Choose another answer and try again.`;
    if (correct) complete(id);
  });
}
function overview() {
  const next = lessons.find(l => !state.completed.includes(l.id));
  return `<section class="hero hero-layout"><div><p class="eyebrow">A practical learning experience</p><h1>AI fluency.<br>From aware<br>to <em>builder.</em></h1><p class="lead">Build a team that knows how to use AI, how to question it, and how to make it part of everyday marketing work.</p><div class="hero-meta"><span>4 interactive lessons</span><span>Self-paced</span><span>A six-week blueprint</span></div><a class="button" href="#${next?.id || 'your-next-step'}">${state.completed.length ? next ? 'Continue learning' : 'View your next step' : 'Start learning'} <span aria-hidden="true">→</span></a></div><div class="ladder-art" role="img" aria-label="The capability ladder: Aware, then Fluent, then Builder. Every rung requires evidence."><div class="ladder-step"><span>Builder</span><small>Design it</small></div><div class="ladder-step"><span>Fluent</span><small>Use it</small></div><div class="ladder-step"><span>Aware</span><small>Understand it</small></div><p class="art-caption">EVERY RUNG. REAL EVIDENCE.</p></div></section><p class="notice">An illustrative portfolio sample built from public information. This is not Amgen material, has not been reviewed by Medical, Legal, or Regulatory, and is not medical advice.</p><section class="section"><div class="section-heading"><h2>Your path to capability</h2><span>LEARN → APPLY → BUILD</span></div><div class="lesson-grid">${lessons.map((l, i) => `<a class="lesson-card" href="#${l.id}"><div class="card-top"><span>LESSON 0${i + 1}</span><span class="arrow" aria-hidden="true">→</span></div><h3>${l.title}</h3><p>${l.description}</p><div class="card-bottom">${state.completed.includes(l.id) ? '✓ Completed · Revisit lesson' : l.activity}</div></a>`).join('')}</div></section>${quote('A tool that was bought is not a capability.', 'THE IDEA BEHIND THIS PROGRAM')}<section><h2>What you’ll take back to work</h2><p class="lead">A clear rung on the capability ladder. A plan for documented prompts and human review. A six-week program, and a rubric to decide which workflows are ready for a governed pilot.</p><p class="source">Your lesson progress is saved on this device. The exercises use illustrative examples; no AI service is connected. Don’t enter patient, customer, or confidential information.</p></section>`;
}
function whyFluency() {
  return `${heading(1, 'A capability.<br><em>Not just a tool.</em>', 'A workflow people trust. A governance pattern reviewers accept. A team that knows how to use it on an ordinary Tuesday.')}<div class="content-block"><p class="intro-statement">This program builds all three.</p><p>A license gives someone access. A capability gives a team a repeatable way to get work done—with clear ownership, human review, and evidence that it helps.</p><div class="callout"><p class="callout-label">THE BRIEF</p><p>Amgen’s public posting for R-252748 asks for “capability-building programs to increase AI fluency across marketing teams” and operating models “that embed AI into day-to-day execution.” This course is one answer.</p><p class="source">Source supplied in the build sheet: Amgen careers, R-252748 (2026). Role-specific wording is attributed to that posting; this sample is independent.</p></div><section class="section"><h2>Three roles. One operating model.</h2><p>Open each role to see who makes the change stick.</p>${accordion([['Capability team', 'Owns approved tools, governance, the prompt library, measurement, and intake and prioritization of pilots.'], ['Champions', 'One per brand or function. Run office hours, collect use cases, and surface what is stuck.'], ['People leaders', 'Set the expectation that AI-assisted work is normal work and protect time for the cohort.']])}</section>${quote('I diagnose the work before prescribing the technology: redesign the workflow, decide what AI should own and what people keep, govern the risk, and teach teams to use it.', 'MASTER RESUME SUMMARY')}${quiz('why-fluency')}${footer('why-fluency')}</div>`;
}
const matchEvidence = ['Three work products with reviewer sign-off', 'One workflow accepted into governed pilot', 'Rules-of-use check passed and one task named'];
const matchAnswers = ['Fluent', 'Builder', 'Aware'];
function ladder() {
  return `${heading(2, 'Fluency is a ladder.<br><em>Evidence is the rung.</em>', 'Progress is proven by work, not by time spent in a course. Know what each level looks like—and what it takes to move up.')}<div class="rung-grid"><article class="rung"><span class="rung-number">01 / UNDERSTAND IT</span><h3>Aware</h3><p>Knows what generative AI does well and where it fails, knows the rules of use, and knows where the approved tools live.</p><div class="evidence"><strong>THE EVIDENCE</strong>Passes the rules-of-use check and names one task they will try.</div></article><article class="rung"><span class="rung-number">02 / USE IT</span><h3>Fluent</h3><p>Uses approved tools for daily briefs, summaries, first drafts, insight synthesis, and tagging—with a documented prompt and a reviewer. Can explain the output to a colleague.</p><div class="evidence"><strong>THE EVIDENCE</strong>Three documented work products with reviewer sign-off.</div></article><article class="rung"><span class="rung-number">03 / DESIGN IT</span><h3>Builder</h3><p>Designs a reusable workflow or agent with an approved knowledge source, test data, a human review gate, and a measurement plan. Hands it to the capability team to govern.</p><div class="evidence"><strong>THE EVIDENCE</strong>One workflow accepted into governed pilot.</div></article></div><div class="content-block"><h2>What each rung is not</h2>${accordion([['Aware ≠ watched a video', 'It requires a stated first use. Knowing the rules must turn into a specific task to try.'], ['Fluent ≠ uses AI a lot', 'It requires a documented prompt and a reviewer. Frequent use alone does not prove a repeatable capability.'], ['Builder ≠ can code', 'Builders design the workflow and the controls; the capability team and IT build and run it.']])}<div class="callout"><p class="callout-label">BUILT AROUND THE PEOPLE RECEIVING THE CHANGE</p><p>The ladder borrows from how Sandie ran enablement at Envista and Sonova. Her master resume reports a 45% improvement in adoption across global SaaS rollouts and a 63% improvement in new-hire success.</p><p class="source">Source: Sandie Dela Cruz master resume, Envista and Sonova bullets, as cited in the supplied build sheet. These are attributed career results, not outcomes measured by this sample.</p></div><section class="quiz"><p class="quiz-tag">CONNECT THE EVIDENCE</p><h2>Which rung does it prove?</h2><p>Choose a level for each artifact. You’ll need all three to complete this lesson.</p><form id="match-form">${matchEvidence.map((text, i) => `<div class="match-row"><label for="match-${i}">${text}</label><select id="match-${i}" name="match-${i}" required><option value="">Choose a rung</option>${['Aware', 'Fluent', 'Builder'].map(rung => `<option ${state.matches[i] === rung ? 'selected' : ''}>${rung}</option>`).join('')}</select></div>`).join('')}<button class="button" type="submit">Check matches <span aria-hidden="true">→</span></button><div id="match-feedback" class="feedback" role="status"></div></form></section>${footer('capability-ladder')}</div>`;
}
const weeks = [
  ['Foundations', 'What AI is good at, where it fails, the rules of use, and where approved tools live.', 'Try one task and log it.'],
  ['Prompt craft', 'Practice prompts on real marketing work and add to the shared prompt library.', 'Create two documented prompts with a reviewer.'],
  ['Content & insight workflows', 'Move from brief to first draft to reviewer. Medical, Legal, and Regulatory review stays exactly where it is. Prescription drug promotion in the United States is overseen by FDA’s Office of Prescription Drug Promotion. Review is a fixed point in the design, not a step AI removes.', 'Map the draft-to-review handoff and name the human reviewer.'],
  ['Data & customer insight', 'Summarize and question customer and channel data without over-trusting it. Check sources and flag what the model cannot know.', 'Practice with approved, de-identified or synthetic data and record what needs source checking.'],
  ['Build week', 'Map one workflow and propose what AI should own and what people keep. Define the review gate and the metric.', 'Prepare a workflow proposal with controls and a measurement plan.'],
  ['Showcase', 'Present your workflow and score it using the five-part rubric. The top two eligible proposals go to the capability team for a governed pilot.', 'Use the rubric in Lesson 4. A score of 16 or above is eligible for pilot consideration, subject to governance and cohort selection.']
];
function weekContent() {
  const [title, text, homework] = weeks[state.week];
  return `<p class="week-tag">WEEK 0${state.week + 1}</p><h3>${title}</h3><p>${text}</p>${state.week === 2 ? '<p class="source">Source: <a href="https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder/office-prescription-drug-promotion-opdp" target="_blank" rel="noopener noreferrer">FDA · Office of Prescription Drug Promotion →</a></p>' : ''}<div class="callout"><p class="callout-label">${state.week < 2 ? 'HOMEWORK' : 'APPLY IT'}</p><p>${homework}</p></div>`;
}
function cohort() {
  return `${heading(3, 'Six weeks.<br><em>Real work, every week.</em>', 'One brand team or function. 12–20 people. 90 minutes live each week, plus about one hour of applied work.')}<div class="content-block"><h2>A rhythm that builds confidence</h2><p>Select a week to explore the plan. Foundations lead to daily practice, then to a workflow worth sharing.</p><div class="week-tabs" role="tablist" aria-label="Six-week cohort">${weeks.map((w, i) => `<button type="button" id="week-tab-${i}" role="tab" aria-controls="week-panel" aria-selected="${state.week === i}" tabindex="${state.week === i ? 0 : -1}" data-week="${i}">Week ${i + 1}</button>`).join('')}</div><section class="week-panel" id="week-panel" role="tabpanel" aria-labelledby="week-tab-${state.week}" tabindex="0">${weekContent()}</section><p class="source">Weeks 3–6 “Apply it” prompts are practice activities adapted from the supplied course plan.</p><section class="section"><h2>Inside a 90-minute live session</h2>${accordion([['15 minutes · One real example', 'Start with one real example from the cohort’s own work.'], ['30 minutes · A new skill', 'Demonstrate the new skill on that example.'], ['35 minutes · Hands-on practice', 'Work in pairs with a champion circulating.'], ['10 minutes · Commitments', 'Name what each person will try in the coming week.']])}</section>${quote('Completion shows activity. Share of teams at Fluent and workflows at Builder in production show whether AI became a way of working.', 'PORTFOLIO PAGE FOR THIS ROLE')}${quiz('six-week-cohort')}${footer('six-week-cohort')}</div>`;
}
const rubricCriteria = [
  ['Workflow clarity', ['Task only', 'Steps listed', 'Steps plus owners', 'Steps, owners, and what AI owns vs. people keep']],
  ['Governance', ['No controls named', 'Reviewer named', 'Reviewer plus approved source', 'All five controls present']],
  ['Data handling', ['Uses real customer data', 'Unclear', 'De-identified stated', 'De-identified and tested']],
  ['Measurement', ['None', 'Activity only', 'One value metric', 'Adoption, value, and risk metrics']],
  ['Reusability', ['One-off', 'Team-specific', 'Reusable with edits', 'Reusable as-is, documented']]
];
function scoreText() {
  const total = state.scores.reduce((a, b) => a + b, 0);
  if (state.scores.some(v => !v)) return ['Choose all five scores', 'Select the evidence that best describes the submission.'];
  if (total < 12) return ['Return to Fluent practice', 'Under 12: strengthen the work products and review practice before resubmitting.'];
  if (total < 16) return ['Revise and resubmit', '12–15: use the criteria to identify the gaps in your proposal.'];
  if (state.scores[1] < 4 || state.scores[2] < 4) return ['Score threshold met · controls still required', '16+ meets the scoring threshold, but all five controls and safe, tested data are required before a governed pilot.'];
  return ['Ready for governed pilot consideration', '16+ with controls evidenced: submit to the capability team. The top two eligible cohort proposals advance. This tool does not grant approval.'];
}
function scoreMarkup() {
  const [title, description] = scoreText();
  return `<span class="score-number">${state.scores.reduce((a, b) => a + b, 0)}<small> / 20</small></span><span class="score-result"><strong>${title}</strong>${description}</span>`;
}
function governance() {
  return `${heading(4, 'Move faster.<br><em>Keep the controls.</em>', 'A governed workflow defines what AI can do, what people keep, and how the team knows the work is getting better.')}<div class="content-block"><p>The governance pattern Sandie describes in a regulated Medical Affairs function is applied here to marketing work.</p><h2>Five controls, every time</h2><ol class="controls"><li><div><strong>Approved knowledge sources only</strong><p>No open-web answers for anything customer-facing.</p></div></li><li><div><strong>De-identified or synthetic test data</strong><p>No patient or customer personal data in prompts.</p></div></li><li><div><strong>Documented and versioned prompts</strong><p>Every prompt lives in the shared library.</p></div></li><li><div><strong>A named human review gate</strong><p>A human approves before any output reaches a customer, a reviewer, or a system of record.</p></div></li><li><div><strong>Registered agents and automations</strong><p>Every one has an owner, a purpose, and a kill switch.</p></div></li></ol><p class="source">Source: master resume result R3, as cited in the supplied build sheet: “approved knowledge source, de-identified testing, documented prompts, and a human review gate before any output is sent.”</p><section class="section"><h2>What leadership sees monthly</h2>${accordion([['Adoption · Is it becoming a way of working?', 'Weekly active use of approved tools; share of each team at Fluent or above; workflows at Builder in production.'], ['Value · Is the work getting better?', 'Cycle time from brief to reviewed asset; hours returned per person per week (self-reported and sampled); review rework rate; reviewer satisfaction.'], ['Risk · Are the controls holding?', 'Unapproved tool use found; outputs sent without review; prompt library coverage.']])}</section><section class="section"><h2>Would this workflow make the cut?</h2><p>Use the Week 6 showcase rubric to score a proposal. Choose one evidence level for each criterion, from 1 to 4.</p><div class="rubric"><p class="callout-label">SHOWCASE SCORING WORKBENCH</p>${rubricCriteria.map(([name, levels], i) => `<div class="rubric-row"><label for="score-${i}">${name}</label><select id="score-${i}" data-score="${i}"><option value="0">Choose evidence…</option>${levels.map((text, j) => `<option value="${j + 1}" ${state.scores[i] === j + 1 ? 'selected' : ''}>${j + 1} · ${text}</option>`).join('')}</select></div>`).join('')}<div class="score-box" id="score-result" role="status" aria-live="polite">${scoreMarkup()}</div><p class="score-note">16+ → governed pilot threshold · 12–15 → revise and resubmit · under 12 → Fluent practice. All five controls remain prerequisites, regardless of total score.</p></div><details><summary>View the complete scoring rubric</summary><div class="table-scroll"><table><caption class="sr-only">Showcase rubric: five criteria scored from one to four, twenty points total</caption><thead><tr><th scope="col">Criterion</th>${[1, 2, 3, 4].map(n => `<th scope="col">${n} point${n > 1 ? 's' : ''}</th>`).join('')}</tr></thead><tbody>${rubricCriteria.map(([name, levels]) => `<tr><th scope="row">${name}</th>${levels.map(text => `<td>${text}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details></section>${quiz('governance')}${footer('governance')}</div>`;
}
function closing() {
  const finished = state.completed.length === 4;
  return `<section class="hero"><p class="eyebrow">Take it to work</p><h1>Make AI a way<br><em>of working.</em></h1><p class="lead">Your rung on the ladder. Your documented prompts in the shared library. And, if you reach Builder, a workflow in governed pilot—with your name on it as owner.</p></section><div class="content-block"><div class="completion-banner"><h2>${finished ? 'Four lessons. A new starting point.' : 'Keep building your foundation.'}</h2><p>${finished ? 'You’ve completed all four lesson checks. That is learning progress, not proof of a capability rung: the work artifacts and human review establish Aware, Fluent, or Builder.' : `You’ve completed ${state.completed.length} of 4 lesson checks. Revisit the remaining activities to complete the learning path.`}</p>${!finished ? `<a href="#${lessons.find(l => !state.completed.includes(l.id)).id}">Continue your learning →</a>` : ''}</div><h2>Your next ordinary Tuesday</h2><p>Name one task you’ll try with an approved tool. What will AI own? What will you keep? Who will review it, and what will you measure?</p><label class="field-label" for="action-plan">My first workflow commitment</label><p class="source">Use a general description only. Don’t enter patient, customer, or confidential information.</p><textarea id="action-plan" maxlength="3000" placeholder="For example: Use an approved source to draft an internal brief. I will verify the claims, my named reviewer will approve it, and we will track time to a reviewed draft.">${escapeHTML(state.plan)}</textarea><div class="button-row"><button class="button" id="download-plan">Download my action plan <span aria-hidden="true">↓</span></button><a class="button secondary" href="mailto:sandiejotrina@gmail.com">Talk to Sandie <span aria-hidden="true">→</span></a></div><p class="save-note" id="save-note">${storageAvailable ? 'Saved in this browser. No information is sent to a server.' : 'Browser storage is unavailable. Download your plan before leaving this page.'}</p><section class="section"><h2>Keep the momentum</h2><p>The next cohort opens to the next brand team. Champions carry the office hours forward. The capability team publishes adoption, value, and risk metrics monthly.</p><p>Build evidence, not just completions. Your first reviewed work product is the next step.</p></section><section class="section" id="sources"><h2>About this sample & sources</h2><p class="notice">Illustrative sample built from public information. It is not Amgen material, has not been through medical, legal, or regulatory review, and is not medical advice.</p><ul class="resource-list"><li>Amgen careers posting R-252748 (2026), as quoted in the supplied build sheet. The original posting is not bundled with this sample.</li><li><a href="https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder/office-prescription-drug-promotion-opdp" target="_blank" rel="noopener noreferrer">FDA · Office of Prescription Drug Promotion (OPDP) →</a>: oversight of prescription drug advertising and promotion.</li><li>Sandie Dela Cruz master resume: summary, Envista and Sonova bullets, and result R3; portfolio page for this role. Career results and quotations are attributed as supplied, not independently verified here.</li><li>Course content adapted from the supplied “Rise 360 build sheet: AI Fluency for Marketing Teams.” This is a standalone web experience, not a Rise 360 or SCORM package. Matching, scoring, and reflection activities were added for practice.</li></ul></section><div class="lesson-footer"><div class="button-row"><a class="button secondary" href="#governance">← Governance & measurement</a><a class="button" href="#overview">Back to overview ↑</a></div><p>Progress is stored only in this browser and is not an LMS record.</p><button class="text-button" id="closing-reset">Reset course progress</button></div></div>`;
}
function selectWeek(index, focus = false) {
  state.week = index; save();
  document.querySelectorAll('[data-week]').forEach(button => {
    const selected = Number(button.dataset.week) === index;
    button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  const panel = document.querySelector('#week-panel');
  panel.setAttribute('aria-labelledby', `week-tab-${index}`); panel.innerHTML = weekContent();
}
function downloadPlan() {
  const lines = ['AI FLUENCY FOR MARKETING TEAMS', 'My action plan', '', `Learning checks completed: ${state.completed.length}/4`, ...lessons.map(l => `${state.completed.includes(l.id) ? '[complete]' : '[not yet complete]'} ${l.title}`), '', 'MY FIRST WORKFLOW COMMITMENT', state.plan || 'No commitment entered yet.', '', 'SHOWCASE SELF-ASSESSMENT', ...rubricCriteria.map(([name, levels], i) => `${name}: ${state.scores[i] ? `${state.scores[i]}/4 — ${levels[state.scores[i] - 1]}` : 'not scored'}`), `Total: ${state.scores.reduce((a, b) => a + b, 0)}/20`, ...scoreText(), '', 'CAPABILITY EVIDENCE', 'Aware: rules-of-use check passed and one task named.', 'Fluent: three documented work products with reviewer sign-off.', 'Builder: one workflow accepted into governed pilot.', '', 'FIVE CONTROLS', 'Approved sources; de-identified or synthetic test data; versioned prompts; named human review; registered automations with owner, purpose, and kill switch.', '', 'Learning completion does not certify a capability level or authorize a pilot.', 'Illustrative sample. Not Amgen material. Not reviewed by Medical, Legal, or Regulatory. Not medical advice.', 'Contact: sandiejotrina@gmail.com'];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'my-ai-fluency-action-plan.txt'; document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000); announce('Your action plan has been downloaded.');
}
function render(focus = true) {
  const id = route();
  const screens = { overview, 'why-fluency': whyFluency, 'capability-ladder': ladder, 'six-week-cohort': cohort, governance, 'your-next-step': closing };
  main.innerHTML = (!storageAvailable ? '<p class="storage-warning" role="status">Browser storage is unavailable. Your progress lasts for this visit only; download your action plan before leaving.</p>' : '') + screens[id]();
  updateNav();
  document.title = `${lessons.find(l => l.id === id)?.title || (id === 'overview' ? 'From Aware to Builder' : 'Your next step')} · AI Fluency`;
  if (quizData[id]) bindQuiz(id);
  if (id === 'capability-ladder') {
    document.querySelectorAll('select[id^="match-"]').forEach(select => select.addEventListener('change', () => { state.matches = [0, 1, 2].map(i => document.querySelector(`#match-${i}`).value); save(); }));
    document.querySelector('#match-form').addEventListener('submit', event => {
      event.preventDefault(); state.matches = [0, 1, 2].map(i => document.querySelector(`#match-${i}`).value); save();
      const correctCount = state.matches.filter((value, i) => value === matchAnswers[i]).length;
      const feedback = document.querySelector('#match-feedback');
      feedback.className = `feedback ${correctCount === 3 ? 'correct' : 'incorrect'}`;
      feedback.textContent = correctCount === 3 ? 'All three matched. Each rung is proven by an artifact, never by time spent.' : `${correctCount} of 3 matched. Think: rules and a first task → Aware; reviewed daily work → Fluent; a governed workflow → Builder. Adjust your matches and try again.`;
      if (correctCount === 3) complete(id);
    });
  }
  if (id === 'six-week-cohort') document.querySelectorAll('[data-week]').forEach(button => {
    button.addEventListener('click', () => selectWeek(Number(button.dataset.week)));
    button.addEventListener('keydown', event => {
      const index = Number(button.dataset.week);
      const target = { ArrowRight: (index + 1) % 6, ArrowLeft: (index + 5) % 6, Home: 0, End: 5 }[event.key];
      if (target !== undefined) { event.preventDefault(); selectWeek(target, true); }
    });
  });
  if (id === 'governance') document.querySelectorAll('[data-score]').forEach(select => select.addEventListener('change', () => { state.scores[Number(select.dataset.score)] = Number(select.value); save(); document.querySelector('#score-result').innerHTML = scoreMarkup(); }));
  if (id === 'your-next-step') {
    document.querySelector('#action-plan').addEventListener('input', event => { state.plan = event.target.value; save(); });
    document.querySelector('#download-plan').addEventListener('click', downloadPlan);
    document.querySelector('#closing-reset').addEventListener('click', () => document.querySelector('#reset-dialog').showModal());
  }
  if (focus) { main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
}
document.querySelector('#reset-progress').addEventListener('click', () => document.querySelector('#reset-dialog').showModal());
document.querySelector('#cancel-reset').addEventListener('click', () => document.querySelector('#reset-dialog').close());
document.querySelector('#confirm-reset').addEventListener('click', () => {
  state = emptyState(); save(); document.querySelector('#reset-dialog').close();
  if (location.hash === '#overview') render(); else location.hash = 'overview';
  announce('Course progress reset.');
});
window.addEventListener('hashchange', () => render());
render(false);
