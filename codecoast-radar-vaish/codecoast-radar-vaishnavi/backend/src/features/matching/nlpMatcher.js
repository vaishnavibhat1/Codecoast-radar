import natural from 'natural';
import pdfParse from 'pdf-parse';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Common tech skills keywords
const TECH_SKILLS = [
  'javascript', 'java', 'python', 'react', 'angular', 'vue', 'node', 'express',
  'mongodb', 'sql', 'mysql', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes',
  'git', 'html', 'css', 'typescript', 'c++', 'c#', 'php', 'ruby', 'django',
  'flask', 'spring', 'rest', 'api', 'graphql', 'redis', 'elasticsearch',
  'react native', 'flutter', 'android', 'ios', 'swift', 'kotlin', 'mern',
  'mean', 'full stack', 'frontend', 'backend', 'devops', 'machine learning',
  'ai', 'data science', 'agile', 'scrum', 'ci/cd', 'jenkins', 'figma'
];

// Extract skills from text using NLP
export function extractSkillsFromText(text) {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  const tokens = tokenizer.tokenize(lowerText);
  
  const foundSkills = [];
  
  // Single word skills
  for (const skill of TECH_SKILLS) {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill);
    }
  }
  
  // Remove duplicates
  return [...new Set(foundSkills)];
}

// Parse resume PDF and extract skills
export async function parseResume(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;
    
    // Extract skills
    const skills = extractSkillsFromText(text);
    
    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    
    // Extract phone
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex) || [];
    
    // Extract experience years (rough estimate)
    const expRegex = /(\d+)\+?\s*(years?|yrs?)\s*(of)?\s*(experience|exp)?/gi;
    const expMatches = text.match(expRegex);
    let experienceYears = 0;
    if (expMatches && expMatches.length > 0) {
      const numbers = expMatches[0].match(/\d+/);
      experienceYears = numbers ? parseInt(numbers[0]) : 0;
    }
    
    return {
      text,
      skills,
      email: emails[0] || null,
      phone: phones[0] || null,
      experienceYears
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume');
  }
}

// Calculate match score between resume and job with weighted algorithm
export function calculateMatchScore(userSkills, jobSkills, jobDescription = '') {
  if (!userSkills || userSkills.length === 0) return 0;
  if (!jobSkills || jobSkills.length === 0) return 0;
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
  
  // Count matching skills
  let matchCount = 0;
  let weightedScore = 0;
  
  // Weight important skills higher (MERN stack, React, etc.)
  const highPrioritySkills = ['react', 'node', 'mongodb', 'express', 'mern', 'full stack'];
  
  for (const userSkill of userSkillsLower) {
    for (const jobSkill of jobSkillsLower) {
      if (userSkill === jobSkill || userSkill.includes(jobSkill) || jobSkill.includes(userSkill)) {
        matchCount++;
        
        // Higher weight for priority skills
        const weight = highPrioritySkills.includes(userSkill) ? 3 : 1;
        weightedScore += weight;
        break;
      }
    }
  }
  
  // Calculate base match percentage
  const baseMatch = (matchCount / jobSkillsLower.length) * 100;
  
  // Boost score if user has high-priority skills
  const priorityBonus = Math.min(20, weightedScore * 2);
  
  // Final score (capped at 100)
  const finalScore = Math.min(100, baseMatch + priorityBonus);
  
  return Math.round(finalScore);
}

// Rank jobs using Bubble Sort (as per requirements)
export function rankJobsBubbleSort(jobs, userSkills) {
  const jobsWithScores = jobs.map(job => ({
    ...job,
    userMatchScore: calculateMatchScore(userSkills, job.skills, job.description)
  }));
  
  // Bubble Sort Algorithm
  const arr = [...jobsWithScores];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Sort by combined score (job.score + userMatchScore)
      const score1 = (arr[j].score || 0) + (arr[j].userMatchScore || 0);
      const score2 = (arr[j + 1].score || 0) + (arr[j + 1].userMatchScore || 0);
      
      if (score1 < score2) {
        // Swap
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  
  return arr;
}

// Calculate distance using Haversine formula (Geo-fencing algorithm)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

// Extract entities from job description (NLP Entity Recognition)
export function extractJobEntities(description) {
  const lowerDesc = description.toLowerCase();
  
  // Extract company mentions (simplified)
  const companies = ['wipro', 'tcs', 'infosys', 'cognizant', 'accenture', 'capgemini'];
  const foundCompanies = companies.filter(c => lowerDesc.includes(c));
  
  // Extract role types
  const roles = ['mca', 'developer', 'engineer', 'analyst', 'designer', 'manager'];
  const foundRoles = roles.filter(r => lowerDesc.includes(r));
  
  // Extract benefits
  const benefits = [];
  if (lowerDesc.includes('work from home') || lowerDesc.includes('wfh')) {
    benefits.push('Remote Work');
  }
  if (lowerDesc.includes('health insurance')) {
    benefits.push('Health Insurance');
  }
  if (lowerDesc.includes('flexible')) {
    benefits.push('Flexible Hours');
  }
  
  return {
    companies: foundCompanies,
    roles: foundRoles,
    benefits
  };
}

// Analyze salary trends
export function analyzeSalaryTrends(jobs) {
  const skillSalaries = {};
  
  jobs.forEach(job => {
    if (job.salary && job.salary.max && job.skills) {
      job.skills.forEach(skill => {
        if (!skillSalaries[skill]) {
          skillSalaries[skill] = [];
        }
        skillSalaries[skill].push(job.salary.max);
      });
    }
  });
  
  // Calculate average salary per skill
  const trends = {};
  for (const [skill, salaries] of Object.entries(skillSalaries)) {
    const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    const min = Math.min(...salaries);
    const max = Math.max(...salaries);
    
    trends[skill] = {
      average: Math.round(avg),
      min,
      max,
      count: salaries.length
    };
  }
  
  return trends;
}
