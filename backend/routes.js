const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const { User, Resume, Interview, Question, Answer, Result } = require('./models');
const { hfClient, extractResumeText } = require('./utils');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

// Simple JWT auth middleware
function verifyToken(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return res.status(401).json({ msg: 'Authorization header missing' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ msg: 'Invalid authorization format' });
    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth verification failed', err.message);
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
}

// =======================
// ✅ HELPER FUNCTION (FIXED FINAL)
// =======================
function extractSkillsFromText(text) {
  const skillKeywords = [
    "react",
    "node",
    "express",
    "mongodb",
    "mongoose",
    "javascript",
    "typescript",
    "css",
    "html",
    "graphql",
    "docker",
    "aws",
    "sql",
    "python"
  ];
  const lower = text.toLowerCase();
  return [...new Set(skillKeywords.filter(skill => lower.includes(skill)))].map(skill => skill.charAt(0).toUpperCase() + skill.slice(1));
}

function parseQuestionsFromText(text) {
  try {
    // ✅ JSON block extract (``` ``` ke andar)
    const jsonMatch =
      text.match(/```json([\s\S]*?)```/i) ||
      text.match(/```([\s\S]*?)```/);

    if (jsonMatch && jsonMatch[1]) {
      const cleaned = jsonMatch[1].trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    }

    // ✅ direct JSON try
    const parsed = JSON.parse(text);
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions;
    }

  } catch (err) {
    console.log("JSON parse failed, using markdown fallback...");
  }

  // ✅ Try to extract numbered questions with markdown format
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQuestion = null;
  let lastQuestionStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect new question header: "### Question N" or "## Question N"
    const questionHeaderMatch = line.match(/^#+\s*Question\s+\d+/i);
    if (questionHeaderMatch) {
      if (currentQuestion && currentQuestion.question && currentQuestion.question.length > 10) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: "",
        skill: "General",
        difficulty: "Medium"
      };
      lastQuestionStartIndex = i;
      continue;
    }

    // Only process if we have a current question being built
    if (!currentQuestion) continue;

    // Extract actual question text: "**Question:** text" or "Question: text"
    const questionMatch = line.match(/^\*?\*?Question\*?\*?\s*:\s*(.+)/i);
    if (questionMatch) {
      currentQuestion.question = questionMatch[1].trim().replace(/\*\*$/g, '').trim();
      continue;
    }

    // Extract Skill: "**Skill:** text" or "Skill: text"
    const skillMatch = line.match(/^\*?\*?Skill\*?\*?\s*:\s*(.+)/i);
    if (skillMatch) {
      let skillText = skillMatch[1].trim().replace(/\*\*$/g, '').trim();
      // Handle formats like "React, JavaScript" - take first skill
      currentQuestion.skill = skillText.split(',')[0].trim() || "General";
      continue;
    }

    // Extract Difficulty: "**Difficulty:** 8/10" or similar
    const diffMatch = line.match(/^\*?\*?Difficulty\*?\*?\s*:\s*(.+)/i);
    if (diffMatch) {
      let diffText = diffMatch[1].trim().replace(/\*\*$/g, '').trim();
      currentQuestion.difficulty = diffText || "Medium";
      continue;
    }

    // Fallback: if we see a line with content and question is empty, treat as question
    if (!currentQuestion.question && line.length > 20 && !line.match(/^\d+\./)) {
      currentQuestion.question = line.replace(/^[-*]\s*/, '').trim();
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.question && currentQuestion.question.length > 10) {
    questions.push(currentQuestion);
  }

  if (questions.length > 0) {
    console.log(`✅ Extracted ${questions.length} questions from markdown`);
    return questions;
  }

  // ✅ Last resort: fallback to simple line parsing
  // Filter out lines that contain instruction/prompt keywords
  const promptKeywords = ['resume', 'return json', 'format:', 'based on', 'generate', 'identify', 'technical skills', 'relevant questions', 'assign', 'skill and difficulty'];
  
  console.log("Markdown parsing returned 0 questions, using simple fallback...");
  return text
    .split("\n")
    .map(line =>
      line
        .replace(/^#+\s*/i, '')
        .replace(/^\d+\.?\s*/, "")
        .replace(/\*\*.*?\*\*/g, "")
        .trim()
    )
    .filter(line => {
      // Filter out empty lines and instruction lines
      if (line.length < 20) return false;
      const lower = line.toLowerCase();
      if (promptKeywords.some(kw => lower.includes(kw))) return false;
      // Skip lines that look like JSON
      if (line.startsWith('{') || line.startsWith('[')) return false;
      return true;
    })
    .map(line => ({
      question: line,
      skill: "General",
      difficulty: "Medium"
    }));
}

function parseGeneratedQuestions(text) {
  try {
    const parsed = JSON.parse(text.trim());
    if (parsed.questions && Array.isArray(parsed.questions)) {
      const questions = parsed.questions.map((q) => ({
        question: q.question || q.questionText || q,
        skill: q.skill || q.category || "General",
        difficulty: q.difficulty || "Medium"
      }));
      
      // Validate that questions are actual questions, not prompt text
      const validQuestions = questions.filter(q => {
        const qText = String(q.question).toLowerCase();
        // Filter out prompt instruction lines
        const isPromptLine = ['return json', 'format:', 'based on', 'generate', 'identify', 'technical skills', 'relevant questions'].some(kw => qText.includes(kw));
        return !isPromptLine && String(q.question).length > 15;
      });
      
      if (validQuestions.length > 0) {
        const skills = Array.isArray(parsed.skills) ? parsed.skills : extractSkillsFromText(text);
        return { questions: validQuestions, skills };
      }
    }
  } catch (err) {
    console.log("JSON parse failed, applying markdown fallback. Error:", err.message);
  }

  // fallback using the improved markdown parser and local skill extraction
  const parsedQuestions = parseQuestionsFromText(text);
  return {
    questions: parsedQuestions,
    skills: extractSkillsFromText(text)
  };
}

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// JWT Generator
const generateToken = (user) => {
    return jwt.sign(
        { user: { id: user._id, role: user.role } },
        JWT_SECRET,
        { expiresIn: '5d' }
    );
};

// =======================
// AUTH ROUTES
// =======================

// SIGNUP
router.post('/auth/signup', async (req, res, next) => {
    try {
        const { name, email, password, role = 'candidate' } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({ name, email, password: hashedPassword, role });

        const token = generateToken(user);
          res.status(201).json({ token, role: user.role, id: user._id, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        next(err);
    }
});

// LOGIN
router.post('/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ msg: 'Invalid Credentials' });

        const token = generateToken(user);
        res.json({ token, role: user.role, id: user._id, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        next(err);
    }
});

// Get current user
router.get('/auth/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// =======================
// RESUME UPLOAD
// =======================
router.post('/resume/upload/:userId', verifyToken, upload.single('resume'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    // file type validation
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ msg: 'Invalid file type. Only PDF/DOC/DOCX allowed' });
    }

    const user = await User.findById(userId);
        if (!user || user.role !== 'candidate') 
            return res.status(404).json({ msg: "Candidate not found" });

    // ensure the requester is the owner or admin
    if (String(req.user.id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden - cannot upload for this user' });
    }

        const resumeText = await extractResumeText(req.file.buffer, req.file.originalname);

        let resume = await Resume.findOne({ candidate: userId });
        if (!resume) {
            resume = new Resume({
                candidate: userId,
                filePath: req.file.originalname,
                parsedText: resumeText
            });
        } else {
            resume.filePath = req.file.originalname;
            resume.parsedText = resumeText;
        }

        await resume.save();
        res.json({ msg: "Resume uploaded & extracted successfully", extractedLength: resumeText.length });

    } catch (err) {
        next(err);
    }
});

// =======================
// QUESTION GENERATION
// =======================
router.post('/resume/generate-questions/:userId', verifyToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const resume = await Resume.findOne({ candidate: userId });

    // ensure caller is owner
    if (String(req.user.id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden - cannot generate questions for this user' });
    }

    if (!resume) {
      return res.status(404).json({ msg: "Resume not found" });
    }

    if (!resume.parsedText) {
      return res.status(400).json({ msg: "Resume text missing. Upload again." });
    }

    const prompt = `
    Based on this resume, identify the main technical skills and generate 5 interview questions.
    Use the resume text to create relevant questions and assign a skill and difficulty for each.

    Resume:
    ${resume.parsedText}

    Return JSON only in this format:
    {
      "skills": ["React", "Node", "MongoDB"],
      "questions": [
        { "question": "Your question here?", "skill": "React", "difficulty": "Medium" }
      ]
    }
    `;

    console.log("📝 Sending AI prompt for question generation...");
    const aiRawResponse = await hfClient(prompt);
    console.log("📥 AI RESPONSE received (length:", aiRawResponse.length, ")");
    console.log("First 200 chars:", aiRawResponse.substring(0, 200));

    const parsed = parseGeneratedQuestions(aiRawResponse);
    const parsedQuestions = parsed.questions || [];
    const skills = parsed.skills || extractSkillsFromText(resume.parsedText);

    console.log("✅ Parsed questions:", parsedQuestions.length);
    parsedQuestions.forEach((q, idx) => {
      console.log(`   Q${idx + 1}: "${q.question?.substring(0, 60)}..." | Skill: ${q.skill}`);
    });

    if (!parsedQuestions.length) {
      console.error("❌ Question parsing returned 0 questions!");
      return res.status(500).json({
        msg: "AI response parsing failed - no questions extracted",
        raw: aiRawResponse.substring(0, 500)
      });
    }

    const interview = await Interview.create({
      candidate: userId,
      startTime: new Date()
    });

    const savedQuestions = [];
    const skillsSet = new Set(skills);

    for (const q of parsedQuestions) {
      const saved = await Question.create({
        interview: interview._id,
        questionText: q.question || q,
        skill: q.skill || "General",
        difficulty: q.difficulty || "Medium"
      });

      savedQuestions.push(saved);
      skillsSet.add(q.skill || "General");
    }

    console.log("💾 Saved", savedQuestions.length, "questions to database");

    res.status(200).json({
      msg: "Questions generated successfully",
      interviewId: interview._id,
      skills: Array.from(skillsSet),
      questions: savedQuestions
    });

  } catch (err) {
    console.error("🔥 ERROR in generate-questions:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// INTERVIEW EVALUATION
// =======================
router.post('/interview/evaluate', verifyToken, async (req, res, next) => {
  try {
    // ✅ ENHANCED: Support for new advanced metrics
    const { userId, interviewId, answers, suspicious, metrics = {}, result: clientResult = {} } = req.body;

    console.log("📝 Evaluate request received:");
    console.log("  userId:", userId);
    console.log("  interviewId:", interviewId);
    console.log("  answers count:", answers?.length);
    console.log("  suspicious:", suspicious);
    console.log("  metrics:", metrics);
    console.log("  clientResult:", clientResult);

    if (!userId || !interviewId || !answers) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ msg: "Missing required fields: userId=" + !!userId + ", interviewId=" + !!interviewId + ", answers=" + !!answers });
    }

    if (!Array.isArray(answers)) {
      console.log("❌ Answers is not an array:", typeof answers);
      return res.status(400).json({ msg: "Answers must be an array" });
    }

    console.log("🔍 Looking for interview with ID:", interviewId);
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.log("❌ Interview not found with ID:", interviewId);
      return res.status(404).json({ msg: "Interview not found" });
    }

    console.log("✅ Found interview, candidate:", interview.candidate);
    if (interview.candidate.toString() !== userId) {
      console.log("❌ User mismatch - interview.candidate:", interview.candidate, "userId:", userId);
      return res.status(403).json({ msg: "Unauthorized - interview doesn't belong to this user" });
    }

    // ensure caller identity matches the user id in body
    if (String(req.user.id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden - cannot evaluate for this user' });
    }

    console.log("🔍 Looking for questions for interview:", interviewId);
    const questions = await Question.find({ interview: interviewId });
    console.log("✅ Found", questions.length, "questions");
    
    if (questions.length !== answers.length) {
      console.log("❌ Answers count mismatch - questions:", questions.length, "answers:", answers.length);
      return res.status(400).json({ msg: `Answers count mismatch - expected ${questions.length} answers, got ${answers.length}` });
    }

    let totalScore = 0;
    const feedback = [];

    console.log("📊 Starting evaluation of", questions.length, "answers...");
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = (answers[i] || "").trim();

      console.log(`\n⏳ Evaluating answer ${i + 1}/${questions.length}`);
      console.log(`   Question: "${q.questionText.substring(0, 50)}..."`);
      console.log(`   Answer length: ${ans.length} chars`);

      // Check if answer is empty
      if (!ans || ans.length < 10) {
        console.log(`   ❌ Answer is empty or too short - giving 0/10`);
        await Answer.create({
          question: q._id,
          candidate: userId,
          answerText: ans,
          aiScore: 0,
          aiFeedback: "No answer provided"
        });
        feedback.push({
          question: q.questionText,
          score: 0,
          feedback: "No answer provided"
        });
        continue;
      }

      const evalPrompt = `
      Evaluate this interview answer:

      Question: ${q.questionText}
      Skill: ${q.skill}
      Difficulty: ${q.difficulty}

      Answer: ${ans}

      Provide a score from 0 to 10 and short feedback.
      Return valid JSON: { "score": number, "feedback": "string" }
      `;

      let aiResponse;
      let score = 0;
      let fb = "Failed to evaluate";

      try {
        aiResponse = await hfClient(evalPrompt);
        console.log(`   ✅ AI response received (${aiResponse.length} chars)`);
        console.log(`   Response preview: ${aiResponse.substring(0, 100)}`);

        try {
          const parsed = JSON.parse(aiResponse);
          score = Math.min(10, Math.max(0, typeof parsed.score === 'number' ? parsed.score : 0));
          fb = parsed.feedback || "Unable to evaluate";
          console.log(`   ✅ Parsed score: ${score}/10`);
        } catch (parseErr) {
          console.log(`   ⚠️ JSON parse failed - trying extraction: ${parseErr.message}`);
          // Try to extract score from text like "7/10" or "score: 7"
          const scoreMatch = aiResponse.match(/(\d+)\s*\/\s*10/) || aiResponse.match(/score[:\s]+(\d+)/i);
          if (scoreMatch) {
            score = Math.min(10, Math.max(0, parseInt(scoreMatch[1])));
            fb = aiResponse.substring(0, 200);
            console.log(`   ✅ Extracted score: ${score}/10 from text`);
          } else {
            console.log(`   ❌ Could not extract score from response`);
          }
        }
      } catch (e) {
        console.error(`   ❌ AI evaluation failed: ${e.message}`);
        fb = "AI evaluation error";
      }

      await Answer.create({
        question: q._id,
        candidate: userId,
        answerText: ans,
        aiScore: score,
        aiFeedback: fb
      });

      totalScore += score;
      feedback.push({
        question: q.questionText,
        score,
        feedback: fb
      });
    }

    const percentage = Math.round((totalScore / (questions.length * 10)) * 100);
    const grade = percentage >= 80 ? "A" : percentage >= 60 ? "B" : percentage >= 40 ? "C" : "D";
    const status = percentage >= 50 ? "Pass" : "Fail";

    console.log(`\n📊 EVALUATION SUMMARY:`);
    console.log(`   Total Score: ${totalScore}/${questions.length * 10}`);
    console.log(`   Percentage: ${percentage}%`);
    console.log(`   Grade: ${grade}`);
    console.log(`   Status: ${status}`);

    const analysisPrompt = `
    Review these interview answers and provide a structured evaluation.
    Return JSON only:
    {
      "strengths": ["..."],
      "weaknesses": ["..."],
      "suggestions": ["..."]
    }

    Questions and answers with scores:
    ${feedback.map((fb, idx) => `Question ${idx + 1} (Score: ${fb.score}/10): ${fb.question}\nAnswer: ${answers[idx] || "(No answer)"}\nFeedback: ${fb.feedback}`).join("\n\n")}
    
    Overall Score: ${percentage}%
    `;

    // Use calculated results rather than defaults
    let strengths = [];
    let weaknesses = [];
    let suggestions = [];

    // Base analysis on actual scores
    const answeredQuestions = feedback.filter(f => f.score > 0).length;
    const avgScore = answeredQuestions > 0 ? totalScore / answeredQuestions : 0;

    if (avgScore >= 7) {
      strengths.push("Strong technical knowledge demonstrated");
      strengths.push("Good understanding of concepts");
    } else if (avgScore >= 5) {
      strengths.push("Basic understanding shown");
      strengths.push("Some relevant knowledge present");
    }
    
    if (answeredQuestions < questions.length) {
      const unansweredCount = questions.length - answeredQuestions;
      weaknesses.push(`${unansweredCount} question(s) left unanswered`);
    }
    
    if (avgScore < 5) {
      weaknesses.push("Need to improve depth of answers");
      weaknesses.push("Insufficient examples provided");
    }

    suggestions.push("Practice explaining concepts with clear examples");
    suggestions.push("Focus on answering all questions");
    if (percentage < 60) {
      suggestions.push("Review fundamental concepts before retaking");
    }

    let structuredResult = {
      score: percentage,
      strengths,
      weaknesses,
      suggestions
    };

    // Try to get AI-generated suggestions if possible
    try {
      console.log("📤 Sending analysis prompt to AI...");
      const aiAnalysis = await hfClient(analysisPrompt);
      console.log("📥 AI analysis received:", aiAnalysis.substring(0, 200));
      
      try {
        const parsed = JSON.parse(aiAnalysis);
        if (Array.isArray(parsed.strengths) && parsed.strengths.length > 0) {
          structuredResult.strengths = parsed.strengths;
          console.log(`   ✅ Using AI strengths (${parsed.strengths.length} items)`);
        }
        if (Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0) {
          structuredResult.weaknesses = parsed.weaknesses;
          console.log(`   ✅ Using AI weaknesses (${parsed.weaknesses.length} items)`);
        }
        if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
          structuredResult.suggestions = parsed.suggestions;
          console.log(`   ✅ Using AI suggestions (${parsed.suggestions.length} items)`);
        }
      } catch (parseErr) {
        console.log(`   ⚠️ AI analysis JSON parse failed: ${parseErr.message} - using calculated results`);
      }
    } catch (e) {
      console.log(`   ⚠️ AI analysis request failed: ${e.message} - using calculated results`);
    }

    interview.endTime = new Date();
    interview.score = totalScore;
    interview.suspicious = !!suspicious;
    await interview.save();

    // ✅ ENHANCED: Store advanced metrics from frontend
    const finalScore = clientResult.score || percentage;
    const result = await Result.create({
      interview: interviewId,
      score: finalScore,
      percentage: finalScore,
      grade: clientResult.grade || grade,
      status: clientResult.status || status,
      
      // ✅ Advanced Scoring (from client)
      technicalScore: clientResult.technicalScore || metrics.technicalScore || 0,
      communicationScore: clientResult.communicationScore || metrics.communicationScore || 0,
      attentionScore: clientResult.attentionScore || metrics.attentionScore || 0,
      cheatingScore: clientResult.cheatingScore || metrics.cheatingScore || 0,
      cheatingFlag: clientResult.cheatingFlag || metrics.isSuspicious || !!suspicious,
      
      // ✅ Behavioral Metrics
      behaviorMetrics: {
        pauseCount: metrics.pauseCount || 0,
        silenceStreaks: metrics.silenceStreaks || 0,
        hesitationWords: metrics.hesitationWords || 0
      },
      
      // ✅ Anti-cheating Indicators
      antiCheatMetrics: {
        tabSwitchCount: metrics.tabSwitches || 0,
        windowBlurCount: metrics.windowBlurCount || 0,
        faceDetectionFlags: metrics.faceDetectionFlags || 0
      },
      
      strengths: clientResult.strengths || structuredResult.strengths,
      weaknesses: clientResult.weaknesses || structuredResult.weaknesses,
      suggestions: clientResult.suggestions || structuredResult.suggestions,
      generatedAt: new Date()
    });

    res.json({
      msg: "Evaluation completed",
      feedback,
      result: {
        score: finalScore,
        percentage: finalScore,
        grade: clientResult.grade || grade,
        status: clientResult.status || status,
        technicalScore: clientResult.technicalScore || metrics.technicalScore || 0,
        communicationScore: clientResult.communicationScore || metrics.communicationScore || 0,
        attentionScore: clientResult.attentionScore || metrics.attentionScore || 0,
        cheatingScore: clientResult.cheatingScore || metrics.cheatingScore || 0,
        cheatingFlag: clientResult.cheatingFlag || metrics.isSuspicious || !!suspicious,
        ...structuredResult
      }
    });

  } catch (err) {
    console.error("🔥 EVALUATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;