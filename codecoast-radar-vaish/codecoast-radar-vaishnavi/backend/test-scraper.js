import puppeteer from 'puppeteer';

async function testScraper() {
  console.log('🧪 Testing Naukri scraper...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const searchUrl = 'https://www.naukri.com/software-developer-jobs-in-mangalore';
  console.log('📍 URL:', searchUrl);
  
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('✅ Page loaded');
  
  // Wait for page to render
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'naukri-debug.png', fullPage: true });
  console.log('📸 Screenshot saved: naukri-debug.png');
  
  // Try to find job elements
  const selectors = [
    '.jobTuple',
    '.srp-jobtuple-wrapper', 
    'article.jobTuple',
    '.cust-job-tuple',
    'article',
    '.row'
  ];
  
  console.log('\n🔍 Trying selectors:');
  for (const selector of selectors) {
    const elements = await page.$$(selector);
    console.log(`  ${selector}: ${elements.length} elements`);
    if (elements.length > 0 && elements.length < 100) {
      console.log(`  ✅ Potential match: ${selector}`);
      
      // Try to extract data from first element
      const firstEl = elements[0];
      const html = await page.evaluate(el => el.outerHTML.substring(0, 500), firstEl);
      console.log(`  Sample HTML: ${html}...`);
    }
  }
  
  // Get page HTML
  const html = await page.content();
  console.log(`\n📄 Page HTML length: ${html.length} characters`);
  
  // Check for common job site patterns
  const patterns = ['job', 'title', 'company', 'location', 'salary', 'experience'];
  console.log('\n🔎 Checking for patterns in HTML:');
  patterns.forEach(pattern => {
    const count = (html.match(new RegExp(pattern, 'gi')) || []).length;
    console.log(`  "${pattern}": ${count} occurrences`);
  });
  
  console.log('\n⏸️  Browser will stay open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
  console.log('✅ Test complete');
}

testScraper().catch(console.error);
