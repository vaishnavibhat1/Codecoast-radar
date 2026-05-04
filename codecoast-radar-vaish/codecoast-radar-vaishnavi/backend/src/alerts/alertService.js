import cron from 'node-cron';
import nodemailer from 'nodemailer';
import User from '../core/users/User.js';
import Job from '../core/jobs/Job.js';
import { calculateMatchScore } from '../features/matching/nlpMatcher.js';
import { detectHiringSpikes, predictHiringTrends } from '../features/analytics/hiringAnalytics.js';

let transporter;

// Initialize email transporter
function initTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
}

// Check for new jobs and send instant alerts (Change Data Capture)
export async function checkNewJobsAndAlert(io) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Get jobs posted in last 5 minutes
    const newJobs = await Job.find({
      postedDate: { $gte: fiveMinutesAgo },
      isActive: true
    });

    if (newJobs.length === 0) return;

    console.log(`🆕 Found ${newJobs.length} new jobs posted in last 5 minutes`);

    // Get all users who can receive alerts
    const users = await User.find({
      'profile.skills': { $exists: true, $ne: [] }
    });

    for (const user of users) {
      // Check if user can receive alerts (free tier limit check)
      if (!user.canReceiveAlert()) {
        continue;
      }

      // Match jobs with user skills
      const matchedJobs = newJobs
        .map(job => ({
          job,
          matchScore: calculateMatchScore(user.profile.skills, job.skills, job.description)
        }))
        .filter(({ matchScore }) => {
          const threshold = user.subscription.tier === 'pro' ? 80 : 85;
          return matchScore >= threshold;
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      // Send alerts for matched jobs
      for (const { job, matchScore } of matchedJobs) {
        // Check if this is a "perfect" match for Pro users (>92%)
        const isUrgent = user.subscription.tier === 'pro' && matchScore >= 92;

        // Emit socket.io event
        if (io) {
          io.to(user._id.toString()).emit('job:alert', {
            job: {
              id: job._id,
              title: job.title,
              company: job.company,
              location: job.location.city,
              matchScore
            },
            isUrgent,
            timestamp: new Date()
          });
        }

        // Update alert count for free users
        if (user.subscription.tier === 'free') {
          user.subscription.alertsUsed.count++;
          await user.save();
        }

        console.log(`🔔 Alert sent to ${user.email}: ${job.company} - ${matchScore}% match`);
      }
    }
  } catch (error) {
    console.error('❌ Alert check error:', error);
  }
}

// Send daily email summary (9 AM)
export async function sendDailyEmailSummary() {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const users = await User.find({
      'profile.skills': { $exists: true, $ne: [] }
    });

    const transport = initTransporter();

    for (const user of users) {
      // Get jobs from last 24 hours
      const recentJobs = await Job.find({
        postedDate: { $gte: yesterday },
        isActive: true
      }).limit(50);

      // Match and rank jobs (Top-K Selection Algorithm)
      const matchedJobs = recentJobs
        .map(job => ({
          ...job.toObject(),
          matchScore: calculateMatchScore(user.profile.skills, job.skills, job.description)
        }))
        .filter(job => job.matchScore >= 80)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Top 5

      if (matchedJobs.length === 0) continue;

      // Generate email HTML
      const jobsHtml = matchedJobs.map(job => `
        <div style="border: 1px solid #e0e0e0; padding: 15px; margin: 10px 0; border-radius: 8px;">
          <h3 style="color: #2563eb; margin: 0 0 10px 0;">${job.title}</h3>
          <p style="margin: 5px 0;"><strong>${job.company}</strong> • ${job.location.city}</p>
          <p style="margin: 5px 0;">Match Score: <span style="color: #16a34a; font-weight: bold;">${job.matchScore}%</span></p>
          <p style="margin: 5px 0; font-size: 14px;">Skills: ${job.skills.slice(0, 5).join(', ')}</p>
          ${job.sourceUrl ? `<a href="${job.sourceUrl}" style="color: #2563eb;">View Job →</a>` : ''}
        </div>
      `).join('');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af;">Good Morning, ${user.name}! 🌅</h1>
          <p>Here are your top ${matchedJobs.length} matched jobs from yesterday:</p>
          ${jobsHtml}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #6b7280; font-size: 14px;">
            You're using CodeCoast Radar ${user.subscription.tier === 'pro' ? 'Pro' : 'Free'} plan.
            ${user.subscription.tier === 'free' ? `<br>Alerts used this week: ${user.subscription.alertsUsed.count}/50` : ''}
          </p>
        </body>
        </html>
      `;

      // Send email
      await transport.sendMail({
        from: `"CodeCoast Radar" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🎯 ${matchedJobs.length} Perfect Jobs for You Today`,
        html: emailHtml
      });

      console.log(`📧 Daily email sent to ${user.email}`);
    }
  } catch (error) {
    console.error('❌ Daily email error:', error);
  }
}

// Send trend prediction emails (weekly)
export async function sendTrendPredictions() {
  try {
    const trends = await predictHiringTrends();
    const spikes = await detectHiringSpikes();

    if (trends.length === 0 && spikes.length === 0) return;

    const users = await User.find({ email: { $exists: true } });
    const transport = initTransporter();

    for (const user of users) {
      const trendsHtml = trends.slice(0, 5).map(t => `
        <li>
          <strong>${t.skill}</strong>: 
          <span style="color: ${t.trend === 'up' ? '#16a34a' : '#dc2626'}">
            ${t.growthRate > 0 ? '+' : ''}${t.growthRate}%
          </span>
          (${t.thisWeekCount} jobs this week)
        </li>
      `).join('');

      const spikesHtml = spikes.slice(0, 3).map(s => `
        <li>
          <strong>${s.company}</strong>: ${s.todayCount} jobs posted today 
          (${s.percentIncrease}% increase from ${s.avgCount} avg)
        </li>
      `).join('');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af;">📈 Mangalore IT Job Market Trends</h1>
          
          ${trends.length > 0 ? `
            <h2 style="color: #2563eb;">Skills in Demand</h2>
            <ul style="line-height: 1.8;">${trendsHtml}</ul>
          ` : ''}
          
          ${spikes.length > 0 ? `
            <h2 style="color: #2563eb;">🚨 Hiring Spikes Detected</h2>
            <ul style="line-height: 1.8;">${spikesHtml}</ul>
          ` : ''}
          
          <p style="margin-top: 30px; color: #6b7280;">
            Stay ahead of the market with CodeCoast Radar!
          </p>
        </body>
        </html>
      `;

      await transport.sendMail({
        from: `"CodeCoast Radar" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '📈 Weekly IT Job Market Trends - Mangalore',
        html: emailHtml
      });

      console.log(`📊 Trend email sent to ${user.email}`);
    }
  } catch (error) {
    console.error('❌ Trend email error:', error);
  }
}

// Initialize alert system with cron jobs
export function initializeAlertSystem(io) {
  console.log('⏰ Initializing alert system...');

  // Check for new jobs every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    checkNewJobsAndAlert(io);
  });

  // Send daily email at 9 AM
  cron.schedule('0 9 * * *', () => {
    sendDailyEmailSummary();
  });

  // Send weekly trends every Monday at 8 AM
  cron.schedule('0 8 * * 1', () => {
    sendTrendPredictions();
  });

  console.log('✅ Alert system initialized');
}
