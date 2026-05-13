const mongoose = require('mongoose');

/* ===============================
   USER SCHEMA
   =============================== */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['candidate', 'admin', 'recruiter'],
    default: 'candidate'
  }
}, { timestamps: true });

/* ===============================
   RESUME SCHEMA
   =============================== */
const resumeSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },

  // ✅ FIX: default value add (crash avoid)
  parsedText: { type: String, default: "" },

  uploadedAt: { type: Date, default: Date.now }
});

/* ===============================
   INTERVIEW SCHEMA
   =============================== */
const interviewSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date },
  endTime: { type: Date },

  suspicious: { type: Boolean, default: false },
  // ✅ FIX: default value add
  score: { type: Number, default: 0 }

}, { timestamps: true });

/* ===============================
   QUESTION SCHEMA (FIXED)
   =============================== */
const questionSchema = new mongoose.Schema({
  interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  questionText: { type: String, required: true },

  // ✅ FIX: ye dono fields missing the
  skill: { type: String, default: "General" },
  difficulty: { type: String, default: "Medium" },

  aiGenerated: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

/* ===============================
   ANSWER SCHEMA
   =============================== */
const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ✅ safe defaults
  answerText: { type: String, default: "" },
  audioPath: { type: String },
  answeredAt: { type: Date, default: Date.now },
  aiScore: { type: Number, default: 0 },
  aiFeedback: { type: String, default: "" }
});

/* ===============================
   RESULT SCHEMA (ENHANCED)
   =============================== */
const resultSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    unique: true,
    required: true
  },

  // ✅ Overall Score
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: "B" },
  status: {
    type: String,
    enum: ['Pass', 'Fail', 'Pending', 'FLAGGED'],
    default: 'Pending'
  },

  // ✅ ENHANCED: Advanced Scoring (FEATURES 2, 3, 4, 6, 7)
  technicalScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  attentionScore: { type: Number, default: 0 },
  cheatingScore: { type: Number, default: 0 },
  cheatingFlag: { type: Boolean, default: false },

  // ✅ Behavioral Metrics
  behaviorMetrics: {
    pauseCount: { type: Number, default: 0 },
    silenceStreaks: { type: Number, default: 0 },
    hesitationWords: { type: Number, default: 0 }
  },

  // ✅ Anti-cheating Indicators
  antiCheatMetrics: {
    tabSwitchCount: { type: Number, default: 0 },
    windowBlurCount: { type: Number, default: 0 },
    faceDetectionFlags: { type: Number, default: 0 }
  },

  // ✅ Feedback
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  
  // ✅ Timestamps
  createdAt: { type: Date, default: Date.now },
  generatedAt: { type: Date, default: Date.now }
});

/* ===============================
   MODEL EXPORTS
   =============================== */
const User = mongoose.model('User', userSchema);
const Resume = mongoose.model('Resume', resumeSchema);
const Interview = mongoose.model('Interview', interviewSchema);
const Question = mongoose.model('Question', questionSchema);
const Answer = mongoose.model('Answer', answerSchema);
const Result = mongoose.model('Result', resultSchema);

module.exports = {
  User,
  Resume,
  Interview,
  Question,
  Answer,
  Result
};