import express from 'express';
import Job from './Job.js';
import { protect } from '../../middleware/auth.js';
import { seedTestData } from '../../utils/seedTestData.js';

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      skills,
      company,
      minSalary,
      maxSalary,
      experience,
      location,
      page = 1,
      limit = 20,
      sortBy = 'score'
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    // Company filter
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    // Salary filter
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) query['salary.max'].$lte = parseInt(maxSalary);
    }

    // Experience filter
    if (experience) {
      const exp = parseInt(experience);
      query['experience.min'] = { $lte: exp };
      query['experience.max'] = { $gte: exp };
    }

    // Location filter (geo-fencing)
    if (location) {
      const [lng, lat] = location.split(',').map(parseFloat);
      const maxDistance = parseInt(process.env.GEO_RADIUS_KM || 50) * 1000; // Convert to meters

      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      };
    }

    // Sorting
    const sortOptions = {};
    if (sortBy === 'score') sortOptions.score = -1;
    else if (sortBy === 'date') sortOptions.postedDate = -1;
    else if (sortBy === 'salary') sortOptions['salary.max'] = -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      jobs
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/jobs/match
// @desc    Get matched jobs for user based on skills
// @access  Private
router.post('/match', protect, async (req, res, next) => {
  try {
    const userSkills = req.user.profile.skills || [];
    
    // Get all active jobs
    const jobs = await Job.find({ isActive: true }).limit(100);

    // Calculate match score for each job
    const matchedJobs = jobs.map(job => {
      const matchScore = Job.calculateUserScore(job, userSkills);
      return {
        ...job.toObject(),
        matchScore
      };
    });

    // Sort by match score
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Filter jobs with >75% match for free, >90% for recommendations
    const threshold = req.user.subscription.tier === 'pro' ? 75 : 80;
    const filtered = matchedJobs.filter(j => j.matchScore >= threshold);

    res.json({
      success: true,
      count: filtered.length,
      jobs: filtered
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/jobs/stats/overview
// @desc    Get job statistics
// @access  Public
router.get('/stats/overview', async (req, res, next) => {
  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalJobs,
      weekJobs,
      monthJobs,
      companies,
      topSkills
    ] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: true, postedDate: { $gte: lastWeek } }),
      Job.countDocuments({ isActive: true, postedDate: { $gte: lastMonth } }),
      Job.distinct('company', { isActive: true }),
      Job.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs,
        weekJobs,
        monthJobs,
        companiesCount: companies.length,
        topSkills: topSkills.map(s => ({ skill: s._id, count: s.count }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/jobs/seed
// @desc    Seed database with test user and jobs (dev only)
// @access  Public
router.post('/seed', async (req, res, next) => {
  try {
    const { user, jobs } = await seedTestData();
    
    res.json({
      success: true,
      message: `Seeded test user and ${jobs.length} test jobs`,
      data: {
        user: {
          email: user.email,
          name: user.name
        },
        jobCount: jobs.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
