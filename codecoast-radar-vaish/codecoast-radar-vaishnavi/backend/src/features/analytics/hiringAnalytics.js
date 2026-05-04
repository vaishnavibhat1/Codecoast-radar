import Job from '../../core/jobs/Job.js';
import { analyzeSalaryTrends } from '../matching/nlpMatcher.js';

// Detect hiring spikes for companies
export async function detectHiringSpikes() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get jobs posted in last 24 hours grouped by company
  const todayJobs = await Job.aggregate([
    {
      $match: {
        postedDate: { $gte: oneDayAgo },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$company',
        count: { $sum: 1 },
        jobs: { $push: '$$ROOT' }
      }
    }
  ]);

  // Get average jobs per day over last 7 days for each company
  const weeklyAvg = await Job.aggregate([
    {
      $match: {
        postedDate: { $gte: sevenDaysAgo, $lt: oneDayAgo },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$company',
        totalJobs: { $sum: 1 }
      }
    }
  ]);

  // Calculate spikes (companies posting >2x their daily average)
  const spikes = [];
  
  for (const todayData of todayJobs) {
    const weekData = weeklyAvg.find(w => w._id === todayData._id);
    const avgPerDay = weekData ? weekData.totalJobs / 6 : 0;
    
    if (todayData.count > avgPerDay * 2 && todayData.count >= 3) {
      spikes.push({
        company: todayData._id,
        todayCount: todayData.count,
        avgCount: Math.round(avgPerDay * 10) / 10,
        percentIncrease: weekData ? Math.round(((todayData.count - avgPerDay) / avgPerDay) * 100) : 100,
        jobs: todayData.jobs.slice(0, 5) // Top 5 jobs
      });
    }
  }

  // Sort by percent increase
  spikes.sort((a, b) => b.percentIncrease - a.percentIncrease);

  return spikes;
}

// Predict hiring trends (Growth Rate Algorithm)
export async function predictHiringTrends() {
  const now = new Date();
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Jobs this week
  const thisWeek = await Job.aggregate([
    {
      $match: {
        postedDate: { $gte: thisWeekStart },
        isActive: true
      }
    },
    {
      $unwind: '$skills'
    },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 }
      }
    }
  ]);

  // Jobs last week
  const lastWeek = await Job.aggregate([
    {
      $match: {
        postedDate: { $gte: lastWeekStart, $lt: thisWeekStart },
        isActive: true
      }
    },
    {
      $unwind: '$skills'
    },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 }
      }
    }
  ]);

  // Calculate growth rate
  const trends = [];
  
  for (const thisWeekData of thisWeek) {
    const lastWeekData = lastWeek.find(lw => lw._id === thisWeekData._id);
    const lastWeekCount = lastWeekData ? lastWeekData.count : 0;
    
    if (lastWeekCount > 0) {
      const growthRate = ((thisWeekData.count - lastWeekCount) / lastWeekCount) * 100;
      
      if (Math.abs(growthRate) > 10) { // Only show significant changes
        trends.push({
          skill: thisWeekData._id,
          thisWeekCount: thisWeekData.count,
          lastWeekCount,
          growthRate: Math.round(growthRate),
          trend: growthRate > 0 ? 'up' : 'down'
        });
      }
    } else if (thisWeekData.count >= 3) {
      // New trending skill
      trends.push({
        skill: thisWeekData._id,
        thisWeekCount: thisWeekData.count,
        lastWeekCount: 0,
        growthRate: 100,
        trend: 'new'
      });
    }
  }

  // Sort by growth rate
  trends.sort((a, b) => Math.abs(b.growthRate) - Math.abs(a.growthRate));

  return trends.slice(0, 10); // Top 10 trends
}

// Generate salary heatmap data
export async function generateSalaryHeatmap() {
  const jobs = await Job.find({
    isActive: true,
    'salary.max': { $exists: true, $gt: 0 }
  });

  const salaryTrends = analyzeSalaryTrends(jobs);

  // Group by location
  const locationSalaries = await Job.aggregate([
    {
      $match: {
        isActive: true,
        'salary.max': { $exists: true, $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$location.city',
        avgSalary: { $avg: '$salary.max' },
        minSalary: { $min: '$salary.min' },
        maxSalary: { $max: '$salary.max' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { avgSalary: -1 }
    }
  ]);

  return {
    bySkill: salaryTrends,
    byLocation: locationSalaries.map(loc => ({
      city: loc._id,
      average: Math.round(loc.avgSalary),
      min: loc.minSalary,
      max: loc.maxSalary,
      jobCount: loc.count
    }))
  };
}

// Get company analytics
export async function getCompanyAnalytics(company) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const analytics = await Job.aggregate([
    {
      $match: {
        company: new RegExp(company, 'i'),
        postedDate: { $gte: thirtyDaysAgo }
      }
    },
    {
      $facet: {
        totalJobs: [{ $count: 'count' }],
        skillsNeeded: [
          { $unwind: '$skills' },
          { $group: { _id: '$skills', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        salaryRange: [
          {
            $group: {
              _id: null,
              avgMin: { $avg: '$salary.min' },
              avgMax: { $avg: '$salary.max' }
            }
          }
        ],
        locations: [
          { $group: { _id: '$location.city', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        postingTrend: [
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$postedDate' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  const result = analytics[0];

  return {
    company,
    totalJobs: result.totalJobs[0]?.count || 0,
    topSkills: result.skillsNeeded.map(s => ({ skill: s._id, count: s.count })),
    salaryRange: result.salaryRange[0] || null,
    locations: result.locations.map(l => ({ city: l._id, count: l.count })),
    dailyPostings: result.postingTrend
  };
}
