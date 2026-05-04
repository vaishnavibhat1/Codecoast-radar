import express from 'express';
import mongoose from 'mongoose';
import Application from './Application.js';
import Job from '../core/jobs/Job.js';
import { protect } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes protected
router.use(protect);

// @route   POST /api/tracker/applications
// @desc    Add new application
// @access  Private
router.post('/applications', async (req, res, next) => {
  try {
    const { jobId, manualEntry, notes, resumeVersion } = req.body;

    const applicationData = {
      user: req.user.id,
      notes,
      resumeVersion
    };

    if (jobId) {
      // Application from database job
      const job = await Job.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      applicationData.job = jobId;
    } else if (manualEntry) {
      // Manual entry
      applicationData.manualEntry = manualEntry;
    } else {
      throw new AppError('Either jobId or manualEntry is required', 400);
    }

    const application = await Application.create(applicationData);
    const populated = await Application.findById(application._id).populate('job');

    res.status(201).json({
      success: true,
      application: populated
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tracker/applications
// @desc    Get all user applications
// @access  Private
router.get('/applications', async (req, res, next) => {
  try {
    const { status, sortBy = 'appliedDate', order = 'desc' } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const applications = await Application.find(query)
      .populate('job', 'title company location salary skills')
      .sort(sortOptions);

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tracker/applications/:id
// @desc    Get single application
// @access  Private
router.get('/applications/:id', async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('job');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tracker/applications/:id/status
// @desc    Update application status
// @access  Private
router.put('/applications/:id/status', async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    application.updateStatus(status, notes);
    await application.save();

    const populated = await Application.findById(application._id).populate('job');

    res.json({ success: true, application: populated });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tracker/applications/:id
// @desc    Update application details
// @access  Private
router.put('/applications/:id', async (req, res, next) => {
  try {
    const { notes, followUpDate, resumeVersion, coverLetter } = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        $set: {
          notes,
          followUpDate,
          resumeVersion,
          coverLetter
        }
      },
      { new: true, runValidators: true }
    ).populate('job');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tracker/applications/:id
// @desc    Delete application
// @access  Private
router.delete('/applications/:id', async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tracker/applications/bulk-update
// @desc    Bulk update applications (Batch Processing Algorithm)
// @access  Private
router.post('/applications/bulk-update', async (req, res, next) => {
  try {
    const { applicationIds, action, status, notes } = req.body;

    if (!applicationIds || applicationIds.length === 0) {
      throw new AppError('Application IDs required', 400);
    }

    let updatedCount = 0;

    if (action === 'updateStatus') {
      // Update status for multiple applications
      for (const id of applicationIds) {
        const application = await Application.findOne({
          _id: id,
          user: req.user.id
        });

        if (application) {
          try {
            application.updateStatus(status, notes);
            await application.save();
            updatedCount++;
          } catch (error) {
            console.error(`Failed to update ${id}:`, error.message);
          }
        }
      }
    } else if (action === 'delete') {
      // Bulk delete
      const result = await Application.deleteMany({
        _id: { $in: applicationIds },
        user: req.user.id
      });
      updatedCount = result.deletedCount;
    }

    res.json({
      success: true,
      message: `${updatedCount} applications updated`,
      updatedCount
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tracker/applications/:id/interview
// @desc    Add interview details
// @access  Private
router.post('/applications/:id/interview', async (req, res, next) => {
  try {
    const { round, date, notes } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    application.interviewDates.push({ round, date, notes });
    
    // Update status to interview if not already
    if (application.status === 'applied' || application.status === 'shortlisted') {
      application.updateStatus('interview', `Interview scheduled: ${round}`);
    }

    await application.save();

    const populated = await Application.findById(application._id).populate('job');

    res.json({ success: true, application: populated });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tracker/analytics
// @desc    Get application analytics (Response Analytics)
// @access  Private
router.get('/analytics', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalApplications,
      byStatus,
      responseRate,
      avgResponseTime,
      recentActivity
    ] = await Promise.all([
      // Total applications
      Application.countDocuments({ user: userId }),

      // Applications by status
      Application.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Response rate calculation (Ratio Calculation Algorithm)
      Application.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            responded: {
              $sum: { $cond: ['$responseReceived', 1, 0] }
            }
          }
        }
      ]),

      // Average response time
      Application.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            responseReceived: true,
            responseDate: { $exists: true }
          }
        },
        {
          $project: {
            daysToResponse: {
              $divide: [
                { $subtract: ['$responseDate', '$appliedDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgDays: { $avg: '$daysToResponse' }
          }
        }
      ]),

      // Recent activity (last 7 days)
      Application.find({
        user: userId,
        appliedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).countDocuments()
    ]);

    const statusBreakdown = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0
    };

    byStatus.forEach(item => {
      statusBreakdown[item._id] = item.count;
    });

    const responseRatePercent = responseRate[0]
      ? Math.round((responseRate[0].responded / responseRate[0].total) * 100)
      : 0;

    const avgDays = avgResponseTime[0]?.avgDays 
      ? Math.round(avgResponseTime[0].avgDays * 10) / 10
      : 0;

    // Get follow-up needed count
    const allApplications = await Application.find({ user: userId });
    const followUpNeeded = allApplications.filter(app => app.needsFollowUp()).length;

    res.json({
      success: true,
      analytics: {
        totalApplications,
        statusBreakdown,
        responseRate: responseRatePercent,
        avgResponseTime: avgDays,
        recentActivity,
        followUpNeeded
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tracker/follow-ups
// @desc    Get applications needing follow-up
// @access  Private
router.get('/follow-ups', async (req, res, next) => {
  try {
    const applications = await Application.find({
      user: req.user.id,
      status: { $in: ['applied', 'interview'] },
      responseReceived: false
    }).populate('job');

    // Filter using Timeout Detection Algorithm
    const needsFollowUp = applications.filter(app => app.needsFollowUp());

    res.json({
      success: true,
      count: needsFollowUp.length,
      applications: needsFollowUp
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tracker/applications/:id/follow-up
// @desc    Mark follow-up as sent
// @access  Private
router.post('/applications/:id/follow-up', async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        $set: {
          followUpSent: true,
          followUpDate: new Date()
        }
      },
      { new: true }
    ).populate('job');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
});

export default router;
