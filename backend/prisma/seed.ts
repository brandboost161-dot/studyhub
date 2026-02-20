import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting seed...');

  // Universities data
  const universities = [
    { name: 'Drexel University', domain: 'drexel.edu' },
    { name: 'SUNY Cortland', domain: 'cortland.edu' },
    { name: 'SUNY Oswego', domain: 'oswego.edu' },
  ];

  // Create schools
  console.log('Creating universities...');
  for (const uni of universities) {
    await prisma.school.upsert({
      where: { domain: uni.domain },
      update: {},
      create: uni,
    });
  }

  // Get all schools
  const schools = await prisma.school.findMany();

  // Departments per school
  const departmentNames = [
    'Computer Science',
    'Business',
    'Biology',
    'Chemistry',
    'Mathematics',
    'Economics',
    'Psychology',
    'Engineering',
    'Communications',
    'History',
  ];

  console.log('Creating departments...');
  for (const school of schools) {
    for (const deptName of departmentNames) {
      await prisma.department.upsert({
        where: {
          schoolId_name: {
            schoolId: school.id,
            name: deptName,
          },
        },
        update: {},
        create: {
          schoolId: school.id,
          name: deptName,
        },
      });
    }
  }

  // Course data by department
  const coursesByDept: Record<string, Array<{ code: string; title: string; desc: string }>> = {
    'Computer Science': [
      { code: 'CS 101', title: 'Introduction to Programming', desc: 'Learn the basics of programming' },
      { code: 'CS 164', title: 'Introduction to Computer Science', desc: 'Fundamentals of CS' },
      { code: 'CS 265', title: 'Advanced Programming', desc: 'Data structures and algorithms' },
      { code: 'CS 270', title: 'Systems Programming', desc: 'Low-level programming and systems' },
      { code: 'CS 338', title: 'Database Systems', desc: 'Design and implementation of databases' },
    ],
    'Business': [
      { code: 'BUSN 101', title: 'Introduction to Business', desc: 'Overview of business fundamentals' },
      { code: 'ACCT 115', title: 'Financial Accounting', desc: 'Principles of accounting' },
      { code: 'FIN 301', title: 'Corporate Finance', desc: 'Financial management and investment' },
      { code: 'MGMT 260', title: 'Principles of Management', desc: 'Organizational behavior and management' },
    ],
    'Biology': [
      { code: 'BIO 101', title: 'General Biology I', desc: 'Introduction to biological sciences' },
      { code: 'BIO 102', title: 'General Biology II', desc: 'Continuation of biological sciences' },
      { code: 'BIO 201', title: 'Genetics', desc: 'Principles of heredity and variation' },
      { code: 'BIO 305', title: 'Ecology', desc: 'Study of organisms and their environment' },
    ],
    'Chemistry': [
      { code: 'CHEM 101', title: 'General Chemistry I', desc: 'Basic principles of chemistry' },
      { code: 'CHEM 102', title: 'General Chemistry II', desc: 'Advanced general chemistry topics' },
      { code: 'CHEM 241', title: 'Organic Chemistry I', desc: 'Structure and reactions of organic compounds' },
    ],
    'Mathematics': [
      { code: 'MATH 121', title: 'Calculus I', desc: 'Differential calculus and applications' },
      { code: 'MATH 122', title: 'Calculus II', desc: 'Integral calculus and series' },
      { code: 'MATH 200', title: 'Linear Algebra', desc: 'Vectors, matrices, and transformations' },
      { code: 'MATH 210', title: 'Discrete Mathematics', desc: 'Logic, sets, and proofs' },
    ],
    'Economics': [
      { code: 'ECON 101', title: 'Principles of Microeconomics', desc: 'Supply, demand, and markets' },
      { code: 'ECON 102', title: 'Principles of Macroeconomics', desc: 'GDP, inflation, and policy' },
      { code: 'ECON 301', title: 'Intermediate Microeconomics', desc: 'Advanced micro theory' },
    ],
    'Psychology': [
      { code: 'PSY 101', title: 'Introduction to Psychology', desc: 'Overview of psychological science' },
      { code: 'PSY 220', title: 'Developmental Psychology', desc: 'Human development across lifespan' },
      { code: 'PSY 230', title: 'Social Psychology', desc: 'How people influence each other' },
    ],
    'Engineering': [
      { code: 'ENGR 101', title: 'Introduction to Engineering', desc: 'Engineering fundamentals and design' },
      { code: 'ENGR 211', title: 'Statics', desc: 'Forces and equilibrium' },
      { code: 'ENGR 231', title: 'Circuits I', desc: 'Basic electrical circuit analysis' },
    ],
    'Communications': [
      { code: 'COMM 100', title: 'Introduction to Communication', desc: 'Fundamentals of communication' },
      { code: 'COMM 210', title: 'Public Speaking', desc: 'Oral presentation skills' },
      { code: 'COMM 305', title: 'Media Studies', desc: 'Analysis of media and culture' },
    ],
    'History': [
      { code: 'HIST 101', title: 'Western Civilization I', desc: 'Ancient to medieval history' },
      { code: 'HIST 102', title: 'Western Civilization II', desc: 'Renaissance to modern era' },
      { code: 'HIST 201', title: 'American History', desc: 'US history survey' },
    ],
  };

  console.log('Creating courses...');
  for (const school of schools) {
    const departments = await prisma.department.findMany({
      where: { schoolId: school.id },
    });

    for (const dept of departments) {
      const courses = coursesByDept[dept.name] || [];
      for (const course of courses) {
        await prisma.course.upsert({
          where: {
            schoolId_courseCode: {
              schoolId: school.id,
              courseCode: course.code,
            },
          },
          update: {},
          create: {
            schoolId: school.id,
            departmentId: dept.id,
            courseCode: course.code,
            title: course.title,
            description: course.desc,
          },
        });
      }
    }
  }

  // Create sample users for each school
  console.log('Creating sample users...');
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

  for (const school of schools) {
    const email = `test@${school.domain}`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashedPassword,
        name: `${school.name.split(' ')[0]} Tester`,
        schoolId: school.id,
        emailVerified: true,
        reputationScore: 50,
      },
    });
  }

  // Create sample content for each school
  console.log('Creating sample flashcards and reviews...');
  for (const school of schools) {
    const student = await prisma.user.findFirst({
      where: { schoolId: school.id },
    });

    const cs101 = await prisma.course.findFirst({
      where: { schoolId: school.id, courseCode: 'CS 101' },
    });

    if (student && cs101) {
      // Create flashcard set
      const flashcardSet = await prisma.studyResource.create({
        data: {
          userId: student.id,
          courseId: cs101.id,
          type: 'FLASHCARDS',
          title: 'Midterm Review - Loops and Arrays',
          examTag: 'Midterm 1',
          upvotes: 12,
          usedCount: 38,
        },
      });

      const sampleCards = [
        { front: 'What is a variable?', back: 'A named storage location that holds a value' },
        { front: 'What is a for loop?', back: 'A control structure that repeats code a specific number of times' },
        { front: 'What is an array?', back: 'A collection of elements of the same type stored contiguously' },
        { front: 'What is a function?', back: 'A reusable block of code that performs a specific task' },
        { front: 'What is debugging?', back: 'The process of finding and fixing errors in code' },
      ];

      for (const card of sampleCards) {
        await prisma.flashcard.create({
          data: {
            resourceId: flashcardSet.id,
            front: card.front,
            back: card.back,
          },
        });
      }

      // Create a review
      await prisma.courseReview.create({
        data: {
          userId: student.id,
          courseId: cs101.id,
          workloadRating: 3,
          difficultyRating: 2,
          overallRating: 4,
          reviewText: 'Great intro course! Professor explains concepts clearly and assignments are fair. Good for beginners.',
          attendanceRequired: true,
          examStyle: 'Multiple choice midterm, coding final project',
          helpfulVotes: 8,
        },
      });
    }
  }

  console.log(' Seed completed successfully!');
  console.log('');
  console.log(' Test accounts created:');
  console.log('   test@drexel.edu');
  console.log('   test@cortland.edu');
  console.log('   test@oswego.edu');
  console.log('   Password: TestPassword123!');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });