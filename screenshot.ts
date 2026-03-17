import { chromium, Page } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = 'e:\\Green University\\Semester 07\\2) HCI\\RoomCraft_Pro\\docs\\screenshots';

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

function sanitizeTitle(title: string) {
  // Remove invalid file characters
  return title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim() || 'Untitled';
}

async function runScreenshotAutomation() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1, // Standard scaling
  });

  const page = await context.newPage();
  
  const visited = new Set<string>();
  const toVisit = [BASE_URL];

  while (toVisit.length > 0) {
    let currentUrl = toVisit.shift()!;
    // Normalize URL to avoid duplicates like http://localhost:5173 and http://localhost:5173/
    currentUrl = currentUrl.split('#')[0]; // ignore hash parts
    if (currentUrl.endsWith('/')) {
      currentUrl = currentUrl.slice(0, -1);
    }

    if (visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    console.log(`Navigating to: ${currentUrl}`);
    
    try {
      // Wait for network idle to ensure everything is downloaded
      await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Additional wait for fonts and glassmorphism CSS
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2000); // Wait for any entry animations
      
      const title = await page.title();
      const safeTitle = sanitizeTitle(title);
      
      // If there are multiple pages with the same title, append a counter
      let fileName = `${safeTitle}.png`;
      let iteration = 1;
      while (fs.existsSync(path.join(SCREENSHOT_DIR, fileName))) {
        fileName = `${safeTitle} (${iteration}).png`;
        iteration++;
      }
      
      const savePath = path.join(SCREENSHOT_DIR, fileName);
      console.log(`Saving screenshot: ${savePath}`);
      
      // User specifically requested standard viewport screenshot (no full-page scroll).
      // But we might want to trigger lazy load images. We'll do a quick scroll down and up.
      await autoScroll(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500); // allow top elements to re-render
      
      await page.screenshot({ path: savePath, fullPage: false });
      
      // Extract links to crawl
      const hrefs: string[] = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a');
        return Array.from(anchors)
          .map(a => a.href)
          .filter(href => href.startsWith('http'))
      });

      for (const href of hrefs) {
        let cleanHref = href.split('#')[0];
        if (cleanHref.endsWith('/')) {
          cleanHref = cleanHref.slice(0, -1);
        }
        if (cleanHref.startsWith(BASE_URL) && !visited.has(cleanHref) && !toVisit.includes(cleanHref)) {
          toVisit.push(cleanHref);
        }
      }
    } catch (error) {
      console.error(`Failed to process ${currentUrl}:`, error);
    }
  }

  await browser.close();
  console.log('Screenshot automation complete!');
}

runScreenshotAutomation().catch(console.error);
