import express from 'express';
import ExcelJS from 'exceljs';
import Job from '../../core/jobs/Job.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// @route   GET /api/export/excel
// @desc    Export jobs to Excel
// @access  Private
router.get('/excel', protect, async (req, res, next) => {
  try {
    const { jobIds } = req.query;
    
    let jobs;
    if (jobIds) {
      const ids = jobIds.split(',');
      jobs = await Job.find({ _id: { $in: ids } });
    } else {
      // Export user's matched jobs
      jobs = await Job.find({ isActive: true }).limit(100);
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');

    // Define columns
    worksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Salary Range', key: 'salary', width: 20 },
      { header: 'Experience', key: 'experience', width: 15 },
      { header: 'Skills', key: 'skills', width: 40 },
      { header: 'Posted Date', key: 'postedDate', width: 15 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Link', key: 'link', width: 50 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' }
    };

    // Add data
    jobs.forEach(job => {
      worksheet.addRow({
        title: job.title,
        company: job.company,
        location: `${job.location.city}, ${job.location.state}`,
        salary: job.salary.min && job.salary.max 
          ? `₹${(job.salary.min/100000).toFixed(1)}-${(job.salary.max/100000).toFixed(1)}L`
          : 'Not specified',
        experience: `${job.experience.min}-${job.experience.max} years`,
        skills: job.skills.join(', '),
        postedDate: job.postedDate.toISOString().split('T')[0],
        source: job.source,
        link: job.sourceUrl || ''
      });
    });

    // Auto-filter
    worksheet.autoFilter = 'A1:I1';

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=codecoast-jobs-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/export/csv
// @desc    Export jobs to CSV
// @access  Private
router.get('/csv', protect, async (req, res, next) => {
  try {
    const { jobIds } = req.query;
    
    let jobs;
    if (jobIds) {
      const ids = jobIds.split(',');
      jobs = await Job.find({ _id: { $in: ids } });
    } else {
      jobs = await Job.find({ isActive: true }).limit(100);
    }

    // Generate CSV
    const csvHeader = 'Title,Company,Location,Salary Min,Salary Max,Experience,Skills,Posted Date,Source,Link\n';
    const csvRows = jobs.map(job => {
      return [
        `"${job.title}"`,
        `"${job.company}"`,
        `"${job.location.city}, ${job.location.state}"`,
        job.salary.min || '',
        job.salary.max || '',
        `${job.experience.min}-${job.experience.max}`,
        `"${job.skills.join(', ')}"`,
        job.postedDate.toISOString().split('T')[0],
        job.source,
        job.sourceUrl || ''
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=codecoast-jobs-${Date.now()}.csv`);
    res.send(csv);

  } catch (error) {
    next(error);
  }
});

export default router;
