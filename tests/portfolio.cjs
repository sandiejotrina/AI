const { chromium } = require('playwright');
const { createServer } = require('node:http');
const { readFile, stat } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
// Model GitHub Pages' repository subpath, including the course beneath it.
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith('/AI/')) throw new Error('Wrong mount');
    let file = path.resolve(root, '.' + pathname.slice(3));
    if (!file.startsWith(root + path.sep) && file !== root) throw new Error('Outside root');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': mime }); response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('Not found'); }
});
(async () => {
  let browser;
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/AI/`;
  const errors = [];
  let count = 0;
  const pass = label => { count++; console.log(`PASS ${label}`); };
  try {
    const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({ executablePath, args: ['--no-sandbox'], headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base);
    assert.match(await page.title(), /Director, Marketing AI Capabilities/);
    await page.getByRole('heading', { name: 'Strategy that people can put to work.' }).waitFor();
    await page.screenshot({ path: '/tmp/marketing-portfolio-desktop.png' });
    pass('Amgen application portfolio serves at the GitHub Pages repository subpath');

    assert.match(await page.locator('#pilot-results').innerText(), /Scale candidate/);
    assert.match(await page.locator('#pilot-results').innerText(), /75%/);
    assert.match(await page.locator('#pilot-results').innerText(), /30%/);
    assert.match(await page.locator('#pilot-results').innerText(), /approvals/);
    await page.locator('#pilot-select').selectOption('insight');
    assert.match(await page.locator('#pilot-results').innerText(), /Revise the pilot/);
    assert.match(await page.locator('#pilot-results').innerText(), /source traceability/);
    assert.match(await page.locator('#pilot-results').innerText(), /38%/);
    await page.locator('#pilot-select').selectOption('agent');
    assert.match(await page.locator('#pilot-results').innerText(), /Hold at the sandbox/);
    assert.match(await page.locator('#pilot-results').innerText(), /Not yet measured/);
    assert.match(await page.locator('#pilot-results').innerText(), /All data in this demo is fictional/);
    await page.locator('[data-open-pilot="content"]').click();
    assert.equal(await page.locator('#pilot-select').inputValue(), 'content');
    await page.locator('#command-center').screenshot({ path: '/tmp/marketing-command-center.png' });
    pass('Three fictional pilot decisions update adoption, value, control evidence, and next actions');

    for (const [id, phrase] of [['alignment', 'The handoffs are breaking'], ['ai', 'The priority list is'], ['adoption', 'Behavior hasn’t changed']]) {
      await page.locator(`[data-scenario="${id}"]`).click();
      assert.match(await page.locator('#scenario-panel').innerText(), new RegExp(phrase));
      assert.equal(await page.locator('#scenario-panel').getAttribute('aria-labelledby'), `scenario-tab-${id}`);
    }
    await page.locator('[data-scenario="adoption"]').press('End');
    assert.equal(await page.locator('[data-scenario="ai"]').getAttribute('aria-selected'), 'true');
    await page.locator('[data-scenario="ai"]').press('ArrowRight');
    assert.equal(await page.locator('[data-scenario="adoption"]').getAttribute('aria-selected'), 'true');
    pass('Leadership scenarios and keyboard tab navigation expose the decisions and trade-offs');

    for (const [index, phrase] of [[1, 'Make one workflow'], [2, 'Make the scale decision'], [0, 'Earn the context']]) {
      await page.locator(`[data-phase="${index}"]`).click();
      assert.match(await page.locator('#phase-panel').innerText(), new RegExp(phrase));
    }
    await page.locator('[data-phase="0"]').press('ArrowRight');
    assert.equal(await page.locator('[data-phase="1"]').getAttribute('aria-selected'), 'true');
    await page.locator('[data-phase="1"]').press('Home');
    assert.equal(await page.locator('[data-phase="0"]').getAttribute('aria-selected'), 'true');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download the 90-day brief' }).click();
    const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), 'Sandie-Dela-Cruz-Amgen-90-Day-Brief.txt');
    const brief = await readFile(await download.path(), 'utf8');
    for (const phrase of ['THE FIRST 30 DAYS', 'DAYS 31–60', 'DAYS 61–90', 'Neural Nexis', 'PARTNER EVALUATION', 'EXTERNAL LANDSCAPE', 'fictional']) assert.ok(brief.includes(phrase), phrase);
    pass('All 90-day phases work; downloadable brief includes the complete proposed plan');

    const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.hash.slice(1)));
    for (const id of anchors) assert.equal(await page.locator(`[id="${id}"]`).count(), 1, `Anchor ${id}`);
    await page.getByRole('link', { name: 'Try the learning experience' }).click();
    await page.getByRole('link', { name: 'Start learning' }).waitFor();
    await page.getByRole('link', { name: 'Sandie’s portfolio' }).click();
    await page.getByRole('heading', { name: 'Strategy that people can put to work.' }).waitFor();
    await page.goto(base + '#capability-ladder');
    await page.waitForURL('**/ai-fluency/#capability-ladder');
    await page.getByRole('heading', { name: /Fluency is a ladder/ }).waitFor();
    pass('Section links, portfolio-to-course navigation, and legacy course bookmarks work');

    await page.goto(base);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const pilot of ['content', 'insight', 'agent']) {
        await page.locator('#pilot-select').selectOption(pilot);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px on ${pilot}`);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: '/tmp/marketing-portfolio-mobile.png' });
    pass('Portfolio and all pilot states fit 320px, 390px, 768px, and desktop widths');

    const staticContext = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await staticContext.newPage();
    await staticPage.goto(base);
    await staticPage.getByRole('heading', { name: 'Strategy that people can put to work.' }).waitFor();
    assert.match(await staticPage.locator('#phase-panel').innerText(), /Earn the context/);
    assert.match(await staticPage.locator('noscript').innerText(), /require JavaScript/);
    await staticContext.close();
    assert.deepEqual(errors, []);
    pass('Core portfolio remains readable without JavaScript; no failed assets or runtime errors');
    console.log(`\n${count} portfolio browser checks passed.`);
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
