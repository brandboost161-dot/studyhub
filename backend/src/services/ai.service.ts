import Groq from 'groq-sdk';
import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { prisma } from '../config/database';

const groq = new Groq({
  apiKey: config.groqApiKey,
});

// ============================================
// GENERATE FLASHCARDS FROM TEXT
// ============================================
export async function generateFlashcards(data: {
  sourceText: string;
  courseContext?: string;
  examTag?: string;
  count?: number;
}) {
  const { sourceText, courseContext, examTag, count = 10 } = data;

  if (!sourceText || sourceText.trim().length < 100) {
    throw new AppError(
      'Source text must be at least 100 characters',
      400,
      'TEXT_TOO_SHORT'
    );
  }

  if (count < 5 || count > 50) {
    throw new AppError(
      'Flashcard count must be between 5 and 50',
      400,
      'INVALID_COUNT'
    );
  }

  const prompt = `You are an expert educator creating study flashcards for students.

SOURCE MATERIAL:
${sourceText}

${courseContext ? `COURSE CONTEXT: ${courseContext}` : ''}
${examTag ? `EXAM FOCUS: ${examTag}` : ''}

INSTRUCTIONS:
1. Create exactly ${count} high-quality flashcards from this material
2. Each flashcard should test ONE specific concept
3. Questions should be clear and concise (5-15 words)
4. Answers should be complete but brief (1-3 sentences)
5. Focus on key concepts, definitions, formulas, and important facts
6. Avoid trivial or obvious questions
7. Do NOT include any copyrighted exam questions
8. Vary question types (definitions, applications, comparisons, examples)

OUTPUT FORMAT:
Return ONLY a valid JSON array with this exact structure:
[
  {
    "front": "Question text here?",
    "back": "Answer text here."
  }
]

Return ONLY the JSON array, no additional text, no markdown formatting, no code blocks.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4096,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from AI');
    }

    let flashcards;
    try {
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      flashcards = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('AI returned invalid format');
    }

    if (!Array.isArray(flashcards)) {
      throw new Error('AI response is not an array');
    }

    const validatedFlashcards = flashcards
      .filter((card: any) => {
        return (
          card.front &&
          card.back &&
          typeof card.front === 'string' &&
          typeof card.back === 'string' &&
          card.front.length > 0 &&
          card.back.length > 0
        );
      })
      .map((card: any) => ({
        front: card.front.trim(),
        back: card.back.trim(),
      }));

    if (validatedFlashcards.length === 0) {
      throw new Error('No valid flashcards generated');
    }

    return {
      flashcards: validatedFlashcards,
      generated: validatedFlashcards.length,
      requested: count,
    };
  } catch (error: any) {
    console.error('AI generation error:', error);
    
    if (error.status === 401) {
      throw new AppError(
        'AI service authentication failed. Check API key.',
        500,
        'AI_AUTH_FAILED'
      );
    }
    
    if (error.status === 429) {
      throw new AppError(
        'AI service rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT'
      );
    }

    throw new AppError(
      'Failed to generate flashcards. Please try again.',
      500,
      'AI_GENERATION_FAILED'
    );
  }
}

// ============================================
// GENERATE FLASHCARDS FROM UPLOADED FILES
// ============================================
export async function generateFlashcardsFromResource(data: {
  resourceId: string;
  count?: number;
}) {
  const { resourceId, count = 10 } = data;

  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
    include: {
      files: true,
      course: {
        select: {
          courseCode: true,
          title: true,
        },
      },
    },
  });

  if (!resource) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  if (resource.type !== 'NOTES') {
    throw new AppError(
      'Can only generate flashcards from notes',
      400,
      'INVALID_TYPE'
    );
  }

  if (resource.files.length === 0) {
    throw new AppError(
      'No files uploaded to this resource',
      400,
      'NO_FILES'
    );
  }

  const combinedText = resource.files
    .map((file) => file.extractedText)
    .filter((text) => text && text.length > 0)
    .join('\n\n---\n\n');

  if (!combinedText || combinedText.length < 100) {
    throw new AppError(
      'Not enough text extracted from files. Please upload files with more content.',
      400,
      'INSUFFICIENT_TEXT'
    );
  }

  const courseContext = `${resource.course.courseCode} - ${resource.course.title}`;
  
  return generateFlashcards({
    sourceText: combinedText,
    courseContext,
    examTag: resource.examTag || undefined,
    count,
  });
}

// ============================================
// GENERATE STUDY GUIDE FROM RESOURCES
// ============================================
export async function generateStudyGuide(data: {
  resourceIds: string[];
  courseContext?: string;
  examTag?: string;
}) {
  const { resourceIds, courseContext, examTag } = data;

  if (!resourceIds || resourceIds.length === 0) {
    throw new AppError(
      'At least one resource is required',
      400,
      'NO_RESOURCES'
    );
  }

  if (resourceIds.length > 10) {
    throw new AppError(
      'Maximum 10 resources allowed',
      400,
      'TOO_MANY_RESOURCES'
    );
  }

  const resources = await prisma.studyResource.findMany({
    where: {
      id: { in: resourceIds },
      type: 'FLASHCARDS',
    },
    include: {
      flashcards: {
        orderBy: { order: 'asc' },
      },
      course: {
        select: {
          courseCode: true,
          title: true,
        },
      },
    },
  });

  if (resources.length === 0) {
    throw new AppError('No valid flashcard sets found', 404, 'NOT_FOUND');
  }

  const combinedContent = resources
    .map((resource) => {
      const cards = resource.flashcards
        .map((card) => `Q: ${card.front}\nA: ${card.back}`)
        .join('\n\n');
      return `=== ${resource.title} ===\n${cards}`;
    })
    .join('\n\n---\n\n');

  const prompt = `You are an expert educator creating a comprehensive study guide for students.

SOURCE FLASHCARDS:
${combinedContent}

${courseContext ? `COURSE CONTEXT: ${courseContext}` : ''}
${examTag ? `EXAM FOCUS: ${examTag}` : ''}

INSTRUCTIONS:
Create a comprehensive study guide that synthesizes all the information above.
Organize the content into logical sections with:
- Clear section headings
- Key concepts and definitions
- Important formulas or facts
- Examples and applications
- Common mistakes to avoid
- Study tips

OUTPUT FORMAT:
Return ONLY a valid JSON object with this structure:
{
  "title": "Study Guide Title",
  "sections": [
    {
      "heading": "Section Name",
      "keyPoints": ["Point 1", "Point 2"],
      "definitions": [{"term": "Term", "definition": "Definition"}],
      "examples": ["Example 1"],
      "commonMistakes": ["Mistake 1"],
      "studyTips": ["Tip 1"]
    }
  ]
}

Return ONLY the JSON object, no additional text, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 8000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) throw new Error('No response from AI');

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const studyGuide = JSON.parse(cleanedText);

    if (!studyGuide.sections || !Array.isArray(studyGuide.sections)) {
      throw new Error('Invalid study guide format');
    }

    return studyGuide;
  } catch (error: any) {
    console.error('Study guide generation error:', error);
    throw new AppError(
      'Failed to generate study guide',
      500,
      'AI_GENERATION_FAILED'
    );
  }
}

// ============================================
// GENERATE PRACTICE QUIZ
// ============================================
export async function generateQuiz(data: {
  resourceIds: string[];
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: Array<'multiple_choice' | 'true_false' | 'short_answer'>;
}) {
  const {
    resourceIds,
    questionCount = 10,
    difficulty = 'medium',
    questionTypes = ['multiple_choice'],
  } = data;

  if (!resourceIds || resourceIds.length === 0) {
    throw new AppError('At least one resource is required', 400, 'NO_RESOURCES');
  }

  if (questionCount < 5 || questionCount > 50) {
    throw new AppError(
      'Question count must be between 5 and 50',
      400,
      'INVALID_COUNT'
    );
  }

  const resources = await prisma.studyResource.findMany({
    where: {
      id: { in: resourceIds },
      type: 'FLASHCARDS',
    },
    include: {
      flashcards: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (resources.length === 0) {
    throw new AppError('No valid flashcard sets found', 404, 'NOT_FOUND');
  }

  const combinedContent = resources
    .map((resource) => {
      const cards = resource.flashcards
        .map((card) => `Q: ${card.front}\nA: ${card.back}`)
        .join('\n\n');
      return `=== ${resource.title} ===\n${cards}`;
    })
    .join('\n\n---\n\n');

  const difficultyGuide = {
    easy: 'Focus on basic recall and recognition. Simple, straightforward questions.',
    medium: 'Mix of recall and application. Require understanding of concepts.',
    hard: 'Deep understanding, application, and synthesis. Challenging questions.',
  };

  const prompt = `You are an expert educator creating a practice quiz for students.

SOURCE MATERIAL:
${combinedContent}

DIFFICULTY: ${difficulty} - ${difficultyGuide[difficulty]}
QUESTION TYPES: ${questionTypes.join(', ')}
NUMBER OF QUESTIONS: ${questionCount}

INSTRUCTIONS:
Create exactly ${questionCount} high-quality quiz questions.
- For multiple choice: provide 4 options with only one correct answer
- For true/false: make statements clear and unambiguous
- For short answer: questions should have clear, specific answers
- Include detailed explanations for each answer
- Vary the topics covered

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct"
    }
  ]
}

Return ONLY the JSON, no additional text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 8000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) throw new Error('No response from AI');

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const quiz = JSON.parse(cleanedText);

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Invalid quiz format');
    }

    return {
      quiz,
      totalQuestions: quiz.questions.length,
      difficulty,
    };
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    throw new AppError(
      'Failed to generate quiz',
      500,
      'AI_GENERATION_FAILED'
    );
  }
}

// ============================================
// SUMMARIZE NOTES
// ============================================
export async function summarizeNotes(data: {
  resourceId: string;
  length?: 'brief' | 'moderate' | 'detailed';
}) {
  const { resourceId, length = 'moderate' } = data;

  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
    include: {
      files: true,
      course: {
        select: {
          courseCode: true,
          title: true,
        },
      },
    },
  });

  if (!resource) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  if (resource.type !== 'NOTES') {
    throw new AppError('Can only summarize notes', 400, 'INVALID_TYPE');
  }

  if (resource.files.length === 0) {
    throw new AppError('No files uploaded', 400, 'NO_FILES');
  }

  const combinedText = resource.files
    .map((file) => file.extractedText)
    .filter((text) => text && text.length > 0)
    .join('\n\n---\n\n');

  if (!combinedText || combinedText.length < 100) {
    throw new AppError('Not enough text to summarize', 400, 'INSUFFICIENT_TEXT');
  }

  const lengthGuide = {
    brief: 'Create a very concise summary (2-3 paragraphs). Only the most important points.',
    moderate: 'Create a balanced summary (4-6 paragraphs). Cover main concepts with some detail.',
    detailed: 'Create a comprehensive summary (8-12 paragraphs). Cover all major topics thoroughly.',
  };

  const prompt = `You are an expert at summarizing academic content for students.

SOURCE MATERIAL:
${combinedText}

COURSE: ${resource.course.courseCode} - ${resource.course.title}
${resource.examTag ? `EXAM FOCUS: ${resource.examTag}` : ''}

INSTRUCTIONS:
${lengthGuide[length]}

Focus on:
- Main concepts and themes
- Important definitions
- Key facts and data
- Relationships between concepts
- Practical applications

Return a well-organized summary in plain text (not JSON).
Use clear paragraphs with headings if appropriate.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 4096,
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) throw new Error('No response from AI');

    return {
      summary: summary.trim(),
      originalLength: combinedText.length,
      summaryLength: summary.length,
      compressionRatio: Math.round((summary.length / combinedText.length) * 100),
    };
  } catch (error: any) {
    console.error('Summarization error:', error);
    throw new AppError(
      'Failed to summarize notes',
      500,
      'AI_GENERATION_FAILED'
    );
  }
}