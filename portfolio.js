'use strict';

// All command-center figures are fictional. No API or analytics is connected.
const oldCoursePages = ['overview', 'why-fluency', 'capability-ladder', 'six-week-cohort', 'governance', 'your-next-step'];
function redirectCourseBookmark() {
  if (oldCoursePages.includes(location.hash.slice(1))) location.replace(`ai-fluency/${location.hash}`);
}
redirectCourseBookmark();
window.addEventListener('hashchange', redirectCourseBookmark);

const scenarios = {
  adoption: {
    title: 'People have access.<br>Behavior hasn’t changed.',
    situation: 'A launch generated interest, but sustained use is weak. Another awareness campaign may amplify a workflow problem.',
    question: 'Where does the intended behavior break down?',
    diagnose: 'Listen to users and champions. Map the moments between first exposure, first use, and repeated use.',
    decide: 'Fix the highest-friction workflow before expanding the campaign. Give the team a usable example and a named owner.',
    prove: 'Track activation, repeat use, and time to first useful outcome against a defined baseline.',
    tradeoff: 'Less launch volume now; more evidence that the next wave can sustain adoption.'
  },
  alignment: {
    title: 'Everyone is busy.<br>The handoffs are breaking.',
    situation: 'Commercial, digital, Medical, technology, and operations partners are working hard, but ownership and review handoffs are unclear.',
    question: 'Which decisions need an owner before we add another tool?',
    diagnose: 'Map a single workflow end to end. Identify duplicated effort, unclear approvals, system dependencies, and capacity constraints.',
    decide: 'Agree the future-state workflow with the relevant partners: what AI owns, what people keep, and who can approve or stop each step.',
    prove: 'Compare cycle time, review rework, and reviewer experience with the baseline. Check whether the change shifted effort to another team.',
    tradeoff: 'Fewer parallel initiatives; clearer decision rights and one reusable operating pattern.'
  },
  ai: {
    title: 'The possibilities are growing.<br>The priority list is, too.',
    situation: 'Vendors, agencies, and internal teams bring promising ideas. Pilots compete for the same time, data, and expert reviewers.',
    question: 'What must we learn before we commit to scale?',
    diagnose: 'Evaluate the user need, business value hypothesis, ecosystem fit, data readiness, risk, and learning value of each opportunity.',
    decide: 'Choose a bounded pilot with explicit success and stop criteria. Assign a business owner and a cross-functional review cadence.',
    prove: 'Require adoption, value, control readiness, operating cost, and integration evidence before a scale decision. Document what did not work.',
    tradeoff: 'Say no or not yet to attractive demos so the team can generate decision-quality evidence.'
  }
};

const phases = [
  { label: 'THE FIRST 30 DAYS', title: 'Earn the context<br>before setting the agenda.', text: 'Listen to marketing, brand teams, Medical, Legal, Regulatory, IT, and existing capability owners. Understand business priorities, approved tools, review requirements, and the team’s capacity before proposing a pilot.', outputs: ['A workflow and stakeholder map, with existing review gates preserved.', 'An adoption, value, and risk baseline with agreed definitions and data gaps.', 'A prioritized use-case shortlist, with owners and work to stop or defer.'], gate: 'Do the team and relevant partners agree on the problem, the controls, the baseline, and the first priority?' },
  { label: 'DAYS 31–60', title: 'Make one workflow<br>work in practice.', text: 'Co-design a bounded pilot with the capability team and a participating marketing group. Align any external partner to the same outcome, controls, and integration requirements. Use approved sources and de-identified or synthetic test data.', outputs: ['A pilot charter: owner, scope, success criteria, review gates, and stop conditions.', 'A champion-led fluency cohort with documented prompts and reviewed work products.', 'A minimum command-center view of adoption, value, risk, and unresolved dependencies.'], gate: 'Is the pilot safe to run, is ownership explicit, and will the evidence answer a real scale decision?' },
  { label: 'DAYS 61–90', title: 'Make the scale decision.<br>Keep the learning.', text: 'Review the pilot with the relevant business, technology, Medical, and operations partners. Recommend scale, revise, or stop based on evidence. Advise Neural Nexis partners on marketing needs and dependencies within the agreed mandate.', outputs: ['An executive readout of results versus baseline, operating cost, risks, and evidence gaps.', 'A recommended next wave with resource needs, partner accountabilities, and required approvals.', 'A reusable playbook, governance ownership, and a monthly capability and talent scorecard.'], gate: 'Does the evidence justify expansion, and are the controls, ownership, and team readiness repeatable?' }
];

const pilots = {
  content: { title: 'Content drafting', purpose: 'Approved-source drafting for an internal marketing brief.', owner: 'Brand operations lead', active: 18, eligible: 24, baseline: 10, current: 7, controls: 5, status: 'candidate', decision: 'Scale candidate', rationale: 'In this fictional example, repeated use and a shorter preparation cycle support a scale review. Review rework is unchanged and the controls are evidenced. Expansion still needs the relevant approvals.', next: 'Validate the sample, confirm operating cost, and propose the next cohort for governance review.', evidence: 'Sample comparison: 20 baseline and 20 pilot briefs; preparation time only, not review turnaround. Review rework: 2 rounds in both groups. Not a causal estimate.', checks: [['Approved knowledge source', true], ['De-identified or synthetic test data', true], ['Documented, versioned prompts', true], ['Named human review gate', true], ['Owner and tested stop mechanism', true]] },
  insight: { title: 'Insight synthesis', purpose: 'Draft synthesis of de-identified customer and channel feedback.', owner: 'Customer insight lead', active: 9, eligible: 24, baseline: 8, current: 6, controls: 4, status: 'revise', decision: 'Revise the pilot', rationale: 'Preparation is faster in the fictional sample, but use is limited and source traceability is not yet reliable. Time saved alone does not justify expansion.', next: 'Resolve source traceability with the partner, then revisit the workflow with users and repeat the check.', evidence: 'Sample comparison: 12 baseline and 12 pilot summaries; preparation time only. Source traceability is an unresolved approved-source control. No customer-facing release.', checks: [['Approved source and traceability', false], ['De-identified or synthetic test data', true], ['Documented, versioned prompts', true], ['Named human review gate', true], ['Owner and tested stop mechanism', true]] },
  agent: { title: 'Agentic workflow', purpose: 'A sandbox concept for orchestrating internal content handoffs.', owner: 'Marketing technology lead', active: 0, eligible: 12, baseline: null, current: null, controls: 3, status: 'hold', decision: 'Hold at the sandbox', rationale: 'The fictional concept has no live users or value evidence. Human review enforcement and the stop mechanism still need testing. A promising demonstration is not readiness.', next: 'Keep the workflow in a synthetic-data sandbox until the review gate and stop mechanism are tested with the technical owner.', evidence: 'No operational baseline, production activity, or time saving is claimed. All figures describe a fictional sandbox evaluation.', checks: [['Approved knowledge source', true], ['Synthetic test data', true], ['Documented, versioned prompts', true], ['Enforced human review gate', false], ['Owner and tested stop mechanism', false]] }
};

function renderPilot(key) {
  const pilot = pilots[key];
  const percent = Math.round(pilot.active / pilot.eligible * 100);
  const saving = pilot.baseline ? Math.round((pilot.baseline - pilot.current) / pilot.baseline * 100) : null;
  document.querySelector('#pilot-results').innerHTML = `<div class="pilot-heading"><div><p class="eyebrow">FICTIONAL PILOT / ${pilot.owner.toUpperCase()}</p><h3>${pilot.title}</h3><p>${pilot.purpose}</p></div><span class="pilot-status ${pilot.status}">${pilot.decision}</span></div><div class="pilot-metrics"><div><span>ADOPTION / WEEKLY ACTIVE</span><strong>${percent}%</strong><p>${pilot.active} of ${pilot.eligible} eligible participants</p><div class="metric-track" aria-hidden="true"><span style="width:${percent}%"></span></div></div><div><span>VALUE / PREPARATION TIME</span><strong>${saving === null ? 'Not yet' : `${saving}%`}<small>${saving === null ? ' measured' : ' shorter'}</small></strong><p>${saving === null ? 'Sandbox only; no outcome claimed' : `${pilot.baseline} → ${pilot.current} days · synthetic sample`}</p></div><div><span>RISK / CONTROL READINESS</span><strong>${pilot.controls}<small> / 5</small></strong><p>${pilot.controls === 5 ? 'Evidenced in this example' : 'Open controls prevent expansion'}</p></div></div><div class="pilot-detail"><div class="pilot-recommendation"><span class="step-label">THE DECISION BEHIND THE NUMBER</span><p>${pilot.rationale}</p><strong>Next action</strong><p>${pilot.next}</p></div><div class="pilot-controls"><h4>Control evidence</h4><ul>${pilot.checks.map(([name, pass]) => `<li><span class="control-icon ${pass ? 'met' : 'open'}" aria-hidden="true">${pass ? '✓' : '!'}</span><span>${name}<small>${pass ? 'Evidenced' : 'Open — resolve before advancing'}</small></span></li>`).join('')}</ul></div></div><p class="pilot-evidence">${pilot.evidence} All data in this demo is fictional.</p>`;
}

function renderScenario(key) {
  const item = scenarios[key];
  document.querySelector('#scenario-panel').innerHTML = `<div class="scenario-question"><p class="eyebrow">THE SITUATION</p><h3>${item.title}</h3><p>${item.situation}</p><div class="decision"><span>MY FIRST QUESTION</span><p>${item.question}</p></div></div><div class="scenario-response"><div><span class="step-label">01 / DIAGNOSE</span><p>${item.diagnose}</p></div><div><span class="step-label">02 / DECIDE</span><p>${item.decide}</p></div><div><span class="step-label">03 / PROVE IT</span><p>${item.prove}</p></div><div class="tradeoff"><strong>The trade-off</strong><p>${item.tradeoff}</p></div></div>`;
}
function renderPhase(index) {
  const phase = phases[index];
  document.querySelector('#phase-panel').innerHTML = `<p class="eyebrow">${phase.label}</p><h3>${phase.title}</h3><p>${phase.text}</p><div class="phase-output"><h4>What I would put on the table</h4><ul>${phase.outputs.map(text => `<li>${text}</li>`).join('')}</ul></div><div class="gate"><span>DECISION GATE</span><p>${phase.gate}</p></div>`;
}

function bindTabs(attribute, panelId, render) {
  const tabs = Array.from(document.querySelectorAll(`[${attribute}]`));
  function activate(index, focus) {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    const active = tabs[index];
    document.getElementById(panelId).setAttribute('aria-labelledby', active.id);
    render(active.getAttribute(attribute));
    if (focus) active.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index, false));
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next !== undefined) { event.preventDefault(); activate(next, true); }
    });
  });
}
bindTabs('data-scenario', 'scenario-panel', renderScenario);
bindTabs('data-phase', 'phase-panel', renderPhase);
const pilotSelect = document.querySelector('#pilot-select');
pilotSelect.addEventListener('change', () => renderPilot(pilotSelect.value));
document.querySelectorAll('[data-open-pilot]').forEach(link => link.addEventListener('click', () => {
  pilotSelect.value = link.dataset.openPilot; renderPilot(pilotSelect.value);
}));
renderPilot(pilotSelect.value);

document.querySelector('#download-brief').addEventListener('click', () => {
  const lines = ['SANDIE DELA CRUZ', 'Director, Marketing AI Capabilities — Amgen application portfolio', '', 'PROPOSED FIRST 90 DAYS', 'A discussion framework, not Amgen material or a claim of existing internal knowledge.', '', ...phases.flatMap(phase => [phase.label, phase.title.replace(/<br>/g, ' '), phase.text, 'Proposed outputs:', ...phase.outputs.map(text => `- ${text}`), `Decision gate: ${phase.gate}`, '']), 'PARTNER EVALUATION', 'Define the business use case and owner. Validate workflow fit, security, privacy, source rights, integration effort, and cost with the relevant experts. Run a bounded pilot with success and exit criteria. Require ownership and a reusable playbook before scaling.', '', 'EXTERNAL LANDSCAPE', 'Scan platform releases, partner capabilities, customer research, and channel evidence. Translate signals into hypotheses, then prioritize by business value, readiness, risk, and learning value.', '', 'MEASUREMENT', 'Adoption: active use, share at Fluent or above, governed workflows in production.', 'Value: preparation cycle time, review rework, reviewer experience, cost and capacity impact.', 'Risk: source traceability, data handling, reviewed outputs, registered automation ownership, and stop mechanisms.', '', 'CONTACT', 'sandiejotrina@gmail.com', 'https://sandiejotrina.github.io/AI/', '', 'Independent portfolio sample. Not affiliated with Amgen. No medical advice. Demo metrics on the website are fictional, not career outcomes.'];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Sandie-Dela-Cruz-Amgen-90-Day-Brief.txt'; document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#download-status').textContent = 'Your 90-day discussion brief has been downloaded.';
});
