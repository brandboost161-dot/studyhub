import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding courses...');

  const schools = await prisma.school.findMany();
  
  for (const school of schools) {
    console.log(`Adding courses for ${school.name}...`);
    
    // Get or create departments
    const depts = {
      cs: await getOrCreateDept(school.id, 'Computer Science'),
      math: await getOrCreateDept(school.id, 'Mathematics'),
      bio: await getOrCreateDept(school.id, 'Biology'),
      chem: await getOrCreateDept(school.id, 'Chemistry'),
      econ: await getOrCreateDept(school.id, 'Economics'),
      eng: await getOrCreateDept(school.id, 'English'),
      hist: await getOrCreateDept(school.id, 'History'),
      psych: await getOrCreateDept(school.id, 'Psychology'),
      business: await getOrCreateDept(school.id, 'Business'),
      physics: await getOrCreateDept(school.id, 'Physics'),
    };

    // Common courses across all schools
    const courses = [
      // Computer Science
      { code: 'CS 101', title: 'Introduction to Programming', desc: 'Fundamentals of programming using Python', dept: depts.cs },
      { code: 'CS 102', title: 'Data Structures', desc: 'Arrays, lists, trees, and algorithms', dept: depts.cs },
      { code: 'CS 201', title: 'Algorithms', desc: 'Algorithm design and analysis', dept: depts.cs },
      { code: 'CS 220', title: 'Computer Architecture', desc: 'Computer organization and assembly', dept: depts.cs },
      { code: 'CS 260', title: 'Database Systems', desc: 'SQL, database design, and management', dept: depts.cs },
      { code: 'CS 301', title: 'Operating Systems', desc: 'Process management and memory', dept: depts.cs },
      { code: 'CS 350', title: 'Software Engineering', desc: 'Development methodologies and practices', dept: depts.cs },
      
      // Mathematics
      { code: 'MATH 121', title: 'Calculus I', desc: 'Limits, derivatives, and applications', dept: depts.math },
      { code: 'MATH 122', title: 'Calculus II', desc: 'Integration and series', dept: depts.math },
      { code: 'MATH 223', title: 'Calculus III', desc: 'Multivariable calculus', dept: depts.math },
      { code: 'MATH 200', title: 'Linear Algebra', desc: 'Vectors, matrices, and transformations', dept: depts.math },
      { code: 'MATH 210', title: 'Discrete Mathematics', desc: 'Logic, sets, and proofs', dept: depts.math },
      { code: 'MATH 310', title: 'Probability & Statistics', desc: 'Statistical analysis and inference', dept: depts.math },
      
      // Biology
      { code: 'BIO 101', title: 'General Biology I', desc: 'Cell biology and genetics', dept: depts.bio },
      { code: 'BIO 102', title: 'General Biology II', desc: 'Evolution and ecology', dept: depts.bio },
      { code: 'BIO 201', title: 'Genetics', desc: 'Principles of heredity', dept: depts.bio },
      { code: 'BIO 230', title: 'Microbiology', desc: 'Study of microorganisms', dept: depts.bio },
      { code: 'BIO 305', title: 'Ecology', desc: 'Organisms and environments', dept: depts.bio },
      { code: 'BIO 320', title: 'Human Anatomy', desc: 'Structure of the human body', dept: depts.bio },
      
      // Chemistry
      { code: 'CHEM 101', title: 'General Chemistry I', desc: 'Atomic structure and bonding', dept: depts.chem },
      { code: 'CHEM 102', title: 'General Chemistry II', desc: 'Chemical reactions and equilibrium', dept: depts.chem },
      { code: 'CHEM 241', title: 'Organic Chemistry I', desc: 'Carbon compounds and reactions', dept: depts.chem },
      { code: 'CHEM 242', title: 'Organic Chemistry II', desc: 'Advanced organic reactions', dept: depts.chem },
      
      // Economics
      { code: 'ECON 101', title: 'Microeconomics', desc: 'Supply, demand, and markets', dept: depts.econ },
      { code: 'ECON 102', title: 'Macroeconomics', desc: 'GDP, inflation, and policy', dept: depts.econ },
      { code: 'ECON 301', title: 'Intermediate Microeconomics', desc: 'Consumer and firm theory', dept: depts.econ },
      
      // English
      { code: 'ENG 101', title: 'English Composition I', desc: 'Writing and rhetoric', dept: depts.eng },
      { code: 'ENG 102', title: 'English Composition II', desc: 'Research and argumentation', dept: depts.eng },
      { code: 'ENG 210', title: 'American Literature', desc: 'Survey of American writers', dept: depts.eng },
      { code: 'ENG 220', title: 'British Literature', desc: 'Survey of British writers', dept: depts.eng },
      
      // History
      { code: 'HIST 101', title: 'Western Civilization I', desc: 'Ancient to medieval history', dept: depts.hist },
      { code: 'HIST 102', title: 'Western Civilization II', desc: 'Renaissance to modern', dept: depts.hist },
      { code: 'HIST 201', title: 'American History I', desc: 'Colonial to Civil War', dept: depts.hist },
      { code: 'HIST 202', title: 'American History II', desc: 'Reconstruction to present', dept: depts.hist },
      
      // Psychology
      { code: 'PSY 101', title: 'Introduction to Psychology', desc: 'Overview of psychological science', dept: depts.psych },
      { code: 'PSY 220', title: 'Developmental Psychology', desc: 'Human development across lifespan', dept: depts.psych },
      { code: 'PSY 230', title: 'Social Psychology', desc: 'Social influence and behavior', dept: depts.psych },
      { code: 'PSY 240', title: 'Abnormal Psychology', desc: 'Mental disorders and treatment', dept: depts.psych },
      
      // Business
      { code: 'BUS 101', title: 'Introduction to Business', desc: 'Business fundamentals', dept: depts.business },
      { code: 'ACCT 201', title: 'Financial Accounting', desc: 'Accounting principles', dept: depts.business },
      { code: 'FIN 301', title: 'Corporate Finance', desc: 'Financial management', dept: depts.business },
      { code: 'MKT 201', title: 'Principles of Marketing', desc: 'Marketing strategies', dept: depts.business },
      
      // Physics
      { code: 'PHYS 101', title: 'General Physics I', desc: 'Mechanics and thermodynamics', dept: depts.physics },
      { code: 'PHYS 102', title: 'General Physics II', desc: 'Electricity and magnetism', dept: depts.physics },
    ];

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
          departmentId: course.dept.id,
          courseCode: course.code,
          title: course.title,
          description: course.desc,
        },
      });
    }
    
    console.log(` Added ${courses.length} courses for ${school.name}`);
  }

  console.log(' Course seeding completed!');
}

async function getOrCreateDept(schoolId: string, name: string) {
  return await prisma.department.upsert({
    where: {
      schoolId_name: { schoolId, name },
    },
    update: {},
    create: { schoolId, name },
  });
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });