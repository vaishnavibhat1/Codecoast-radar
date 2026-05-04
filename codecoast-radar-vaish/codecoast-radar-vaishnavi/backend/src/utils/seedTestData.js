import User from '../core/users/User.js';
import Job from '../core/jobs/Job.js';

// Test user data
const TEST_USER = {
  name: 'John Doe',
  email: 'john.doe@codecoast.com',
  password: 'test123456',
  profile: {
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    location: {
      city: 'Mangalore',
      coordinates: {
        type: 'Point',
        coordinates: [74.8560, 12.9141] // [longitude, latitude]
      }
    },
    experience: '3-5',
    qualification: 'Bachelor\'s in Computer Science',
    preferences: {
      minSalary: 500000,
      maxDistance: 50
    }
  },
  phone: '+91 9876543210'
};

// Test jobs data
const TEST_JOBS = [
  {
    title: 'React Developer',
    company: 'Tech Solutions Mangalore',
    description: 'Looking for an experienced React developer with strong JavaScript skills. Experience with Node.js is a plus. You will work on building modern web applications.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
    location: { 
      type: 'Point',
      coordinates: [74.8560, 12.9141],
      city: 'Mangalore',
      state: 'Karnataka'
    },
    salary: { min: 500000, max: 800000, currency: 'INR' },
    experience: { min: 2, max: 5 },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/1',
    sourceUrl: 'https://example.com/jobs/react-dev',
    isActive: true,
    source: 'manual'
  },
  {
    title: 'Full Stack Developer',
    company: 'Innovate IT Services',
    description: 'Full stack developer role requiring expertise in React, Node.js, and MongoDB. Build and maintain scalable web applications.',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST API'],
    location: { 
      type: 'Point',
      coordinates: [74.8500, 12.9100],
      city: 'Mangalore',
      state: 'Karnataka'
    },
    salary: { min: 700000, max: 1200000, currency: 'INR' },
    experience: { min: 3, max: 7 },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/2',
    sourceUrl: 'https://example.com/jobs/fullstack-dev',
    isActive: true,
    source: 'manual'
  },
  {
    title: 'Senior Node.js Developer',
    company: 'CloudTech Solutions',
    description: 'Senior developer position for building cloud-based backends. Strong Node.js, Express, and database skills required.',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
    location: { 
      type: 'Point',
      coordinates: [74.8420, 12.9200],
      city: 'Mangalore',
      state: 'Karnataka'
    },
    salary: { min: 1000000, max: 1800000, currency: 'INR' },
    experience: { min: 5, max: 10 },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/3',
    sourceUrl: 'https://example.com/jobs/senior-nodejs',
    isActive: true,
    source: 'manual'
  },
  {
    title: 'Frontend Developer',
    company: 'Digital Dreams',
    description: 'Join our frontend team to create beautiful user interfaces. HTML, CSS, JavaScript expertise required.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'React'],
    location: { 
      type: 'Point',
      coordinates: [74.8510, 12.9150],
      city: 'Mangalore',
      state: 'Karnataka'
    },
    salary: { min: 400000, max: 700000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/4',
    sourceUrl: 'https://example.com/jobs/frontend-dev',
    isActive: true,
    source: 'manual'
  },
  {
    title: 'Python Developer',
    company: 'DataTech Analytics',
    description: 'Python developer for data processing and backend development. Experience with Django/Flask required.',
    skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'Pandas', 'NumPy'],
    location: { 
      type: 'Point',
      coordinates: [74.8450, 12.9180],
      city: 'Mangalore',
      state: 'Karnataka'
    },
    salary: { min: 600000, max: 1000000, currency: 'INR' },
    experience: { min: 2, max: 6 },
    employmentType: 'Full-Time',
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: 'https://example.com/apply/5',
    sourceUrl: 'https://example.com/jobs/python-dev',
    isActive: true,
    source: 'manual'
  }
];

// Seed test user
export async function seedTestUser() {
  try {
    // Always delete existing test user to ensure fresh credentials
    await User.deleteOne({ email: TEST_USER.email });
    console.log('🗑️  Cleared existing test user');

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      ...TEST_USER
    });

    console.log('✅ Test user created:', TEST_USER.email);
    console.log('   📧 Email:', TEST_USER.email);
    console.log('   🔑 Password:', TEST_USER.password);
    return user;
  } catch (error) {
    console.error('❌ Error seeding test user:', error.message);
    console.error('   Error details:', error);
    throw error;
  }
}

// Seed test jobs
export async function seedTestJobs() {
  try {
    // Clear existing manual test jobs
    await Job.deleteMany({ source: 'manual' });
    console.log('🗑️  Cleared existing test jobs');

    // Insert test jobs
    const inserted = await Job.insertMany(TEST_JOBS);
    console.log(`✅ Successfully seeded ${inserted.length} test jobs`);
    
    return inserted;
  } catch (error) {
    console.error('❌ Error seeding test jobs:', error.message);
    throw error;
  }
}

// Seed all test data
export async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');
    
    const user = await seedTestUser();
    const jobs = await seedTestJobs();
    
    console.log('✅ Test data seeding complete!');
    console.log(`   📧 Test User: ${TEST_USER.email} / ${TEST_USER.password}`);
    console.log(`   💼 Test Jobs: ${jobs.length} jobs created`);
    
    return { user, jobs };
  } catch (error) {
    console.error('❌ Failed to seed test data:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.js').then(async (dbModule) => {
    await dbModule.default();
    await seedTestData();
    process.exit(0);
  });
}
