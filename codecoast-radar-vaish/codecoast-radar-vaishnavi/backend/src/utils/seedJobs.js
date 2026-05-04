import Job from '../core/jobs/Job.js';

const testJobs = [
  {
    title: 'React Developer',
    company: 'Tech Solutions Mangalore',
    description: 'Looking for an experienced React developer with strong JavaScript skills. Experience with Node.js is a plus. You will work on building modern web applications.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
    location: {
      city: 'Mangalore',
      coordinates: [74.8560, 12.9141]
    },
    salary: {
      min: 500000,
      max: 800000,
      currency: 'INR'
    },
    experience: {
      min: 2,
      max: 5
    },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/1',
    isActive: true,
    source: 'Manual'
  },
  {
    title: 'Full Stack Developer',
    company: 'Innovate IT Services',
    description: 'Full stack developer role requiring expertise in React, Node.js, and MongoDB. Build and maintain scalable web applications. Experience with modern development practices.',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST API'],
    location: {
      city: 'Mangalore',
      coordinates: [74.8500, 12.9100]
    },
    salary: {
      min: 700000,
      max: 1200000,
      currency: 'INR'
    },
    experience: {
      min: 3,
      max: 7
    },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/2',
    isActive: true,
    source: 'Manual'
  },
  {
    title: 'Senior Node.js Developer',
    company: 'CloudTech Solutions',
    description: 'Senior developer position for building cloud-based backends. Strong Node.js, Express, and database skills required. Work with microservices architecture.',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
    location: {
      city: 'Mangalore',
      coordinates: [74.8420, 12.9200]
    },
    salary: {
      min: 1000000,
      max: 1800000,
      currency: 'INR'
    },
    experience: {
      min: 5,
      max: 10
    },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/3',
    isActive: true,
    source: 'Manual'
  },
  {
    title: 'Frontend Developer',
    company: 'Digital Dreams',
    description: 'Join our frontend team to create beautiful user interfaces. HTML, CSS, JavaScript expertise required. Knowledge of React is beneficial.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'React'],
    location: {
      city: 'Mangalore',
      coordinates: [74.8510, 12.9150]
    },
    salary: {
      min: 400000,
      max: 700000,
      currency: 'INR'
    },
    experience: {
      min: 1,
      max: 3
    },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/4',
    isActive: true,
    source: 'Manual'
  },
  {
    title: 'Python Developer',
    company: 'DataTech Analytics',
    description: 'Python developer for data processing and backend development. Experience with Django/Flask and data analysis libraries required.',
    skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'Pandas', 'NumPy'],
    location: {
      city: 'Mangalore',
      coordinates: [74.8450, 12.9180]
    },
    salary: {
      min: 600000,
      max: 1000000,
      currency: 'INR'
    },
    experience: {
      min: 2,
      max: 6
    },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/5',
    isActive: true,
    source: 'Manual'
  }
];

export async function seedJobs() {
  try {
    // Clear existing manual test jobs
    await Job.deleteMany({ source: 'Manual' });
    console.log('🗑️  Cleared existing test jobs');

    // Insert test jobs
    const inserted = await Job.insertMany(testJobs);
    console.log(`✅ Successfully seeded ${inserted.length} test jobs`);
    
    return inserted;
  } catch (error) {
    console.error('❌ Error seeding jobs:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.js').then(async (dbModule) => {
    await dbModule.default();
    await seedJobs();
    process.exit(0);
  });
}
