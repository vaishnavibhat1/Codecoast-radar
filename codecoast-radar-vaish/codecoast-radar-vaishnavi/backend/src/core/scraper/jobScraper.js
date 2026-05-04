import puppeteer from 'puppeteer';
import cron from 'node-cron';
import Job from '../jobs/Job.js';

// Mangalore coordinates
const MANGALORE_COORDS = { lat: 12.9141, lng: 74.8560 };
const RADIUS_KM = 50;

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Mock coordinates for cities (in production, use geocoding API)
const getCityCoordinates = (city) => {
  const coords = {
    'mangalore': { lat: 12.9141, lng: 74.8560 },
    'mangaluru': { lat: 12.9141, lng: 74.8560 },
    'udupi': { lat: 13.3409, lng: 74.7421 },
    'manipal': { lat: 13.3467, lng: 74.7870 },
    'karwar': { lat: 14.8137, lng: 74.1290 },
    'kundapura': { lat: 13.6271, lng: 74.6903 }
  };
  return coords[city?.toLowerCase()] || MANGALORE_COORDS;
};

// Scrape Naukri.com (simplified version)
async function scrapeNaukri() {
  console.log('🔍 Starting Naukri scraper...');
  const jobs = [];

  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Search for IT jobs in Mangalore/Karnataka
    const searchUrl = 'https://www.naukri.com/software-developer-jobs-in-mangalore';
    console.log('📍 Navigating to:', searchUrl);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to load with multiple strategies
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try multiple selectors for job listings
    const selectors = ['.srp-jobtuple-wrapper', '.cust-job-tuple', '.jobTuple', 'article.jobTuple'];
    let jobSelector = null;
    
    console.log('🔎 Checking for job elements...');
    for (const selector of selectors) {
      try {
        const count = await page.$$eval(selector, elements => elements.length);
        if (count > 0) {
          jobSelector = selector;
          console.log(`✅ Found ${count} job elements with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`  ❌ Selector ${selector} failed:`, e.message);
      }
    }

    if (!jobSelector) {
      console.log('⚠️  No job listings found with known selectors');
      console.log('   Page title:', await page.title());
      await browser.close();
      return jobs;
    }

    // Extract job data with improved selectors
    const scrapedJobs = await page.evaluate((selector) => {
      const jobElements = document.querySelectorAll(selector);
      const results = [];
      console.log('Found', jobElements.length, 'job elements');

      jobElements.forEach((elem, index) => {
        try {
          // Updated selectors based on actual Naukri structure
          const titleElem = elem.querySelector('a.title, .title a');
          const title = titleElem?.innerText?.trim() || titleElem?.textContent?.trim() || '';
          
          // Company info - try multiple patterns
          let company = elem.querySelector('.companyInfo, .company, .comp-name, .subTitle')?.innerText?.trim() || '';
          
          const location = elem.querySelector('.location, .locWdg')?.innerText?.trim() || '';
          const experience = elem.querySelector('.experience, .expwdg')?.innerText?.trim() || '';
          const salary = elem.querySelector('.salary, .salWdg')?.innerText?.trim() || '';
          const description = elem.querySelector('.job-description, .desc, .ellipsis, [class*=\"desc\"]')?.innerText?.trim() || '';
          const skills = elem.querySelector('.tags, .tag-li, [class*=\"tag\"]')?.innerText?.trim() || '';
          const link = titleElem ? (titleElem.href || titleElem.getAttribute('href')) : '';

          if (title) {
            results.push({
              title,
              company: company || 'Company Not Listed',
              location: location || 'Mangalore',
              experience: experience || '0-3 years',
              salary: salary || 'Not disclosed',
              description: description || title,
              skills: skills || 'Software Development',
              link: link ? (link.startsWith('http') ? link : 'https://www.naukri.com' + link) : ''
            });
          }
        } catch (e) {
          // Skip problematic elements
        }
      });

      return results;
    }, jobSelector);

    console.log(`📊 Scraped ${scrapedJobs.length} jobs from Naukri`);

    // Process and save jobs
    for (const job of scrapedJobs) {
      const city = job.location.split(',')[0].trim();
      const coords = getCityCoordinates(city);
      const distance = calculateDistance(
        MANGALORE_COORDS.lat, 
        MANGALORE_COORDS.lng, 
        coords.lat, 
        coords.lng
      );

      // Only save jobs within 50km radius
      if (distance <= RADIUS_KM) {
        const skillsArray = job.skills
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const salaryMatch = job.salary.match(/(\d+)-(\d+)/);
        const minSalary = salaryMatch ? parseInt(salaryMatch[1]) * 100000 : null;
        const maxSalary = salaryMatch ? parseInt(salaryMatch[2]) * 100000 : null;

        const expMatch = job.experience.match(/(\d+)-(\d+)/);
        const minExp = expMatch ? parseInt(expMatch[1]) : 0;
        const maxExp = expMatch ? parseInt(expMatch[2]) : 0;

        const jobData = {
          title: job.title,
          company: job.company,
          description: job.description || job.title,
          location: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat],
            city: city,
            state: 'Karnataka'
          },
          salary: {
            min: minSalary,
            max: maxSalary,
            currency: 'INR'
          },
          skills: skillsArray,
          experience: {
            min: minExp,
            max: maxExp
          },
          source: 'naukri',
          sourceUrl: job.link,
          postedDate: new Date(),
          isActive: true
        };

        // Check if job already exists
        const exists = await Job.findOne({
          title: jobData.title,
          company: jobData.company,
          source: 'naukri'
        });

        if (!exists) {
          const newJob = new Job(jobData);
          newJob.calculateScore();
          await newJob.save();
          jobs.push(newJob);
        }
      }
    }

    await browser.close();
    console.log(`✅ Saved ${jobs.length} new jobs from Naukri`);
  } catch (error) {
    console.error('❌ Naukri scraper error:', error.message);
  }

  return jobs;
}

// Scrape Indeed (simplified version)
async function scrapeIndeed() {
  console.log('🔍 Starting Indeed scraper...');
  const jobs = [];

  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const searchUrl = 'https://in.indeed.com/jobs?q=software+developer&l=Mangalore%2C+Karnataka';
    console.log('📍 Navigating to:', searchUrl);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try multiple selectors
    const selectors = ['.job_seen_beacon', '.resultContent', '.jobsearch-ResultsList li', 'div[data-testid="job-result"]'];
    let jobSelector = null;
    
    console.log('🔎 Checking for Indeed job elements...');
    for (const selector of selectors) {
      try {
        const count = await page.$$eval(selector, elements => elements.length);
        if (count > 0) {
          jobSelector = selector;
          console.log(`✅ Found ${count} Indeed job elements with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`  ❌ Selector ${selector} failed:`, e.message);
      }
    }

    if (!jobSelector) {
      console.log('⚠️  No job listings found on Indeed with known selectors');
      console.log('   Page title:', await page.title());
      await browser.close();
      return jobs;
    }

    const scrapedJobs = await page.evaluate((selector) => {
      const jobElements = document.querySelectorAll(selector);
      const results = [];
      console.log('Found', jobElements.length, 'Indeed job elements');

      jobElements.forEach((elem, index) => {
        try {
          // Try multiple selector patterns for Indeed's changing structure
          const titleElem = elem.querySelector('.jobTitle, h2.jobTitle span, [data-testid="job-title"]');
          const title = titleElem?.innerText?.trim() || titleElem?.textContent?.trim() || '';
          
          const companyElem = elem.querySelector('.companyName, [data-testid="company-name"], .company');
          const company = companyElem?.innerText?.trim() || companyElem?.textContent?.trim() || '';
          
          const locationElem = elem.querySelector('.companyLocation, [data-testid="job-location"], .location');
          const location = locationElem?.innerText?.trim() || locationElem?.textContent?.trim() || '';
          
          const descElem = elem.querySelector('.job-snippet, .job-snippet-body, .jobCardShelfContainer li');
          const description = descElem?.innerText?.trim() || descElem?.textContent?.trim() || '';

          if (title && company) {
            results.push({ 
              title, 
              company, 
              location: location || 'Mangalore, Karnataka', 
              description: description || title 
            });
          }
        } catch (e) {
          console.error('Error parsing Indeed job element', index, ':', e.message);
        }
      });

      return results;
    }, jobSelector);

    console.log(`📊 Scraped ${scrapedJobs.length} jobs from Indeed`);

    // Process and save (similar to Naukri)
    for (const job of scrapedJobs) {
      const city = job.location.split(',')[0].trim();
      const coords = getCityCoordinates(city);

      const jobData = {
        title: job.title,
        company: job.company,
        description: job.description || job.title,
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
          city: city,
          state: 'Karnataka'
        },
        skills: [],
        source: 'indeed',
        postedDate: new Date(),
        isActive: true
      };

      const exists = await Job.findOne({
        title: jobData.title,
        company: jobData.company,
        source: 'indeed'
      });

      if (!exists) {
        const newJob = new Job(jobData);
        newJob.calculateScore();
        await newJob.save();
        jobs.push(newJob);
      }
    }

    await browser.close();
    console.log(`✅ Saved ${jobs.length} new jobs from Indeed`);
  } catch (error) {
    console.error('❌ Indeed scraper error:', error.message);
  }

  return jobs;
}

// Main scraper function
export async function runJobScraper(io) {
  console.log('🚀 Running job scraper...');
  
  // Emit scraper start
  if (io) {
    io.emit('scraper:status', {
      status: 'scraping',
      site: 'naukri',
      message: 'Searching Naukri.com...',
      timestamp: new Date()
    });
  }
  
  const naukriJobs = await scrapeNaukri();
  
  // Emit Naukri completion
  if (io) {
    io.emit('scraper:status', {
      status: 'completed',
      site: 'naukri',
      message: `Found ${naukriJobs.length} jobs from Naukri`,
      count: naukriJobs.length,
      timestamp: new Date()
    });
    
    io.emit('scraper:status', {
      status: 'scraping',
      site: 'indeed',
      message: 'Searching Indeed.com...',
      timestamp: new Date()
    });
  }
  
  const indeedJobs = await scrapeIndeed();
  
  // Emit Indeed completion
  if (io) {
    io.emit('scraper:status', {
      status: 'completed',
      site: 'indeed',
      message: `Found ${indeedJobs.length} jobs from Indeed`,
      count: indeedJobs.length,
      timestamp: new Date()
    });
  }
  
  const totalJobs = naukriJobs.length + indeedJobs.length;
  
  if (totalJobs > 0 && io) {
    // Emit final summary
    io.emit('jobs:update', {
      message: `Scraped ${totalJobs} new jobs (Naukri: ${naukriJobs.length}, Indeed: ${indeedJobs.length})`,
      count: totalJobs,
      naukriCount: naukriJobs.length,
      indeedCount: indeedJobs.length,
      timestamp: new Date()
    });
  }
  
  return totalJobs;
}

// Start cron job - runs every 6 hours
export function startJobScraper(io) {
  console.log('⏰ Job scraper scheduled (runs every 6 hours)');
  
  // Run immediately on startup
  setTimeout(() => runJobScraper(io), 5000);
  
  // Schedule to run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    runJobScraper(io);
  });
}
