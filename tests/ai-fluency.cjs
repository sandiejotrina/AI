const { chromium } = require('playwright');
const { createServer } = require('node:http');
const { readFile, stat } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root + path.sep) && file !== root) throw new Error('Outside root');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg' }[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': mime }); response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
});

(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const errors = [];
  let checks = 0;
  const passed = text => { checks++; console.log(`PASS ${text}`); };
  try {
    const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${base}/ai-fluency/`);
    await page.getByRole('heading', { name: /From aware/ }).waitFor();
    await page.screenshot({ path: '/tmp/ai-fluency-desktop.png', fullPage: true });
    passed('Course subpath serves the learning experience; local assets load');

    await page.getByRole('link', { name: 'Start learning' }).click();
    await page.getByText('Licenses were purchased for every marketer.', { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    assert.match(await page.locator('#quiz-feedback').innerText(), /Not quite/);
    assert.equal(await page.locator('#progress-count').innerText(), '0 of 4');
    await page.getByText('A workflow with a named reviewer is in daily use and its cycle time is measured.', { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    assert.equal(await page.locator('#progress-count').innerText(), '1 of 4');
    await page.getByRole('button', { name: 'Check answer' }).click();
    assert.equal(await page.locator('#progress-count').innerText(), '1 of 4');
    await page.getByText('Capability team', { exact: true }).click();
    assert.equal(await page.locator('details').first().getAttribute('open'), '');
    passed('Incorrect answers do not award progress; correct answers complete once; guidance expands');

    await page.getByRole('link', { name: 'Next lesson' }).click();
    for (let i = 0; i < 3; i++) await page.locator(`#match-${i}`).selectOption('Aware');
    await page.getByRole('button', { name: 'Check matches' }).click();
    assert.match(await page.locator('#match-feedback').innerText(), /1 of 3/);
    assert.equal(await page.locator('#progress-count').innerText(), '1 of 4');
    for (const [i, value] of ['Fluent', 'Builder', 'Aware'].entries()) await page.locator(`#match-${i}`).selectOption(value);
    await page.getByRole('button', { name: 'Check matches' }).click();
    assert.equal(await page.locator('#progress-count').innerText(), '2 of 4');
    passed('Evidence matching requires all three correct artifacts');

    await page.getByRole('link', { name: 'Next lesson' }).click();
    for (let i = 0; i < 6; i++) {
      await page.getByRole('tab', { name: `Week ${i + 1}`, exact: true }).click();
      assert.equal(await page.locator('#week-panel').getAttribute('aria-labelledby'), `week-tab-${i}`);
      assert.match(await page.locator('#week-panel').innerText(), new RegExp(`WEEK 0${i + 1}`));
    }
    await page.getByRole('tab', { name: 'Week 6', exact: true }).press('ArrowRight');
    assert.equal(await page.getByRole('tab', { name: 'Week 1', exact: true }).getAttribute('aria-selected'), 'true');
    await page.getByRole('tab', { name: 'Week 1', exact: true }).press('End');
    assert.equal(await page.getByRole('tab', { name: 'Week 6', exact: true }).getAttribute('aria-selected'), 'true');
    await page.getByRole('tab', { name: 'Week 6', exact: true }).press('Home');
    assert.equal(await page.getByRole('tab', { name: 'Week 1', exact: true }).getAttribute('aria-selected'), 'true');
    await page.getByText('It stays in place; AI shortens the work before and after it.', { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    assert.equal(await page.locator('#progress-count').innerText(), '3 of 4');
    passed('All six weeks display their content; arrow/Home/End tab interaction and Week 3 review check work');

    await page.getByRole('link', { name: 'Next lesson' }).click();
    const score = async values => { for (let i = 0; i < 5; i++) await page.locator(`#score-${i}`).selectOption(String(values[i])); };
    await score([1, 1, 1, 1, 1]);
    assert.match(await page.locator('#score-result').innerText(), /Return to Fluent practice/);
    await score([4, 4, 1, 1, 1]);
    assert.match(await page.locator('#score-result').innerText(), /Return to Fluent practice/); // 11
    await score([4, 4, 2, 1, 1]);
    assert.match(await page.locator('#score-result').innerText(), /Revise and resubmit/); // 12
    await score([4, 4, 4, 2, 1]);
    assert.match(await page.locator('#score-result').innerText(), /Revise and resubmit/); // 15
    await score([4, 4, 4, 2, 2]);
    assert.match(await page.locator('#score-result').innerText(), /Ready for governed pilot consideration/); // 16
    await score([4, 4, 1, 4, 4]);
    assert.match(await page.locator('#score-result').innerText(), /controls still required/); // 17, unsafe data
    await score([4, 1, 4, 4, 4]);
    assert.match(await page.locator('#score-result').innerText(), /controls still required/); // 17, missing controls
    await score([4, 4, 4, 4, 4]);
    assert.match(await page.locator('#score-result').innerText(), /20 \/ 20/);
    await page.getByText('True', { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    assert.match(await page.locator('#quiz-feedback').innerText(), /Not quite/);
    await page.getByText('False', { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    assert.equal(await page.locator('#progress-count').innerText(), '4 of 4');
    passed('Rubric validates 11/12/15/16/20 boundaries and blocks unsafe high scores; final quiz works');

    await page.getByRole('link', { name: 'Your next step', exact: false }).last().click();
    const plan = 'Draft an internal brief <with a reviewer> & measure cycle time.';
    await page.locator('#action-plan').fill(plan);
    await page.reload();
    assert.equal(await page.locator('#action-plan').inputValue(), plan);
    assert.equal(await page.locator('#progress-count').innerText(), '4 of 4');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download my action plan' }).click();
    const download = await downloadEvent;
    const artifact = await readFile(await download.path(), 'utf8');
    assert.match(artifact, /Learning checks completed: 4\/4/);
    assert.ok(artifact.includes(plan));
    assert.match(artifact, /Total: 20\/20/);
    passed('Progress, scoring, and safely escaped reflection survive reload; download contains actual learner data');

    await page.getByRole('button', { name: 'Reset course progress', exact: true }).click();
    await page.getByRole('button', { name: 'Keep learning' }).click();
    assert.equal(await page.locator('#progress-count').innerText(), '4 of 4');
    await page.getByRole('button', { name: 'Reset course progress', exact: true }).click();
    await page.getByRole('button', { name: 'Reset course', exact: true }).click();
    await page.getByRole('link', { name: 'Start learning' }).waitFor();
    assert.equal(await page.locator('#progress-count').innerText(), '0 of 4');
    passed('Reset requires confirmation and clears course state');

    await page.setViewportSize({ width: 390, height: 844 });
    for (const id of ['overview', 'why-fluency', 'capability-ladder', 'six-week-cohort', 'governance', 'your-next-step']) {
      await page.goto(`${base}/ai-fluency/#${id}`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Horizontal overflow on ${id}`);
    }
    await page.goto(`${base}/ai-fluency/`);
    await page.screenshot({ path: '/tmp/ai-fluency-mobile.png', fullPage: true });
    passed('All six screens fit a 390px mobile viewport');

    const restrictedContext = await browser.newContext();
    await restrictedContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
    });
    const restrictedPage = await restrictedContext.newPage();
    restrictedPage.on('pageerror', error => errors.push(error.message));
    await restrictedPage.goto(`${base}/ai-fluency/#your-next-step`);
    await restrictedPage.locator('.storage-warning').waitFor();
    await restrictedPage.locator('#action-plan').fill('A plan still works without storage.');
    assert.match(await restrictedPage.locator('#save-note').innerText(), /unavailable/);
    const restrictedDownload = restrictedPage.waitForEvent('download');
    await restrictedPage.getByRole('button', { name: 'Download my action plan' }).click();
    assert.ok((await readFile(await (await restrictedDownload).path(), 'utf8')).includes('A plan still works without storage.'));
    await restrictedContext.close();
    passed('Blocked browser storage is explained and does not prevent plan download');

    assert.deepEqual(errors, []);
    passed('No browser JavaScript errors or failing asset requests');
    console.log(`\n${checks} browser checks passed.`);
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
