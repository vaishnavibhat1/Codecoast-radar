import express from 'express';
import User from './User.js';
import { protect } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res, next) => {
  try {
    const { name, phone, skills, experience, qualification, preferences } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (skills) updateFields['profile.skills'] = skills;
    if (experience) updateFields['profile.experience'] = experience;
    if (qualification) updateFields['profile.qualification'] = qualification;
    if (preferences) updateFields['profile.preferences'] = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/saved-jobs/:jobId
// @desc    Save a job
// @access  Private
router.post('/saved-jobs/:jobId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.savedJobs.includes(req.params.jobId)) {
      throw new AppError('Job already saved', 400);
    }

    user.savedJobs.push(req.params.jobId);
    await user.save();

    res.json({ success: true, message: 'Job saved successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/saved-jobs/:jobId
// @desc    Remove saved job
// @access  Private
router.delete('/saved-jobs/:jobId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedJobs = user.savedJobs.filter(job => job.toString() !== req.params.jobId);
    await user.save();

    res.json({ success: true, message: 'Job removed from saved' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/saved-searches
// @desc    Save a search
// @access  Private
router.post('/saved-searches', async (req, res, next) => {
  try {
    const { name, filters } = req.body;
    
    const user = await User.findById(req.user.id);
    user.savedSearches.push({ name, filters });
    await user.save();

    res.json({ success: true, savedSearch: user.savedSearches[user.savedSearches.length - 1] });
  } catch (error) {
    next(error);
  }
});

export default router;
