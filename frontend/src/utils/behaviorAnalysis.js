/* ================================================
   BEHAVIOR ANALYSIS SYSTEM
   - Analyzes answer time
   - Detects silence duration
   - Counts repeated pauses
   - Generates confidence score
   ================================================ */

export class BehaviorAnalysisSystem {
  constructor(questionTimeLimit = 60) {
    this.questionTimeLimit = questionTimeLimit; // seconds
    this.confidenceScore = 50; // 0-100
    this.answerMetrics = [];
    this.currentAnswerStart = null;
    this.silenceStreaks = 0;
    this.pauseCount = 0;
  }

  // ✅ Start answer timing
  startAnswer() {
    this.currentAnswerStart = Date.now();
  }

  // ✅ Analyze answer based on duration
  analyzeAnswerTime(answerDuration) {
    const seconds = answerDuration / 1000;
    const utilizationRatio = seconds / this.questionTimeLimit;

    let timeScore = 50; // Default
    let assessment = 'NORMAL';

    // Too fast (less than 10% of available time)
    if (utilizationRatio < 0.1) {
      timeScore = 20;
      assessment = 'TOO_FAST';
    }
    // Good range (30-80% utilization)
    else if (utilizationRatio >= 0.3 && utilizationRatio <= 0.8) {
      timeScore = 90;
      assessment = 'GOOD';
    }
    // Too slow (over 90% of time)
    else if (utilizationRatio > 0.9) {
      timeScore = 40;
      assessment = 'TOO_SLOW';
    }
    // Quick but reasonable (10-30%)
    else if (utilizationRatio < 0.3) {
      timeScore = 60;
      assessment = 'QUICK';
    }

    return { timeScore, assessment, seconds, utilizationRatio };
  }

  // ✅ Detect silence (no speech for X seconds)
  recordSilence(silenceDuration) {
    const seconds = silenceDuration / 1000;

    if (seconds > 3) {
      this.silenceStreaks++;
      // Reduce confidence for prolonged silence
      this.confidenceScore = Math.max(0, this.confidenceScore - 5);
    }

    return {
      silenceDuration: seconds,
      silenceStreaks: this.silenceStreaks
    };
  }

  // ✅ Track pause patterns
  recordPause() {
    this.pauseCount++;
    
    // Multiple pauses indicate hesitation
    if (this.pauseCount > 3) {
      this.confidenceScore = Math.max(0, this.confidenceScore - 3);
    }

    return { pauseCount: this.pauseCount };
  }

  // ✅ Update confidence score based on overall behavior
  updateConfidenceScore(factors) {
    const { answerTime, hesitationWords, clarity } = factors;

    // Start with base confidence
    let score = 50;

    // Answer time factor (30-80% utilization is ideal)
    if (answerTime && answerTime.timeScore) {
      score += answerTime.timeScore / 2; // Weight 50%
    }

    // Hesitation factor
    if (hesitationWords !== undefined) {
      const hesitationPenalty = Math.min(30, hesitationWords * 5);
      score -= hesitationPenalty;
    }

    // Clarity factor
    if (clarity !== undefined) {
      score += clarity * 0.3; // Weight clarity positively
    }

    this.confidenceScore = Math.max(0, Math.min(100, score));
    return this.confidenceScore;
  }

  // ✅ Get behavior summary
  getBehaviorSummary() {
    return {
      confidenceScore: this.confidenceScore,
      pauseCount: this.pauseCount,
      silenceStreaks: this.silenceStreaks,
      answerMetrics: this.answerMetrics
    };
  }

  // ✅ Record answer metric
  recordAnswerMetric(question, timeAnalysis, hesitations) {
    this.answerMetrics.push({
      question,
      timeAnalysis,
      hesitations,
      recordedAt: new Date()
    });
  }

  // ✅ Reset for new answer
  reset() {
    this.currentAnswerStart = null;
    this.pauseCount = 0;
    // Don't reset confidence - it accumulates
  }
}

export default BehaviorAnalysisSystem;
