/* ================================================
   SMART RESULT GENERATION SYSTEM
   - Aggregates all metrics
   - Generates structured result
   - Identifies strengths, weaknesses, suggestions
   ================================================ */

export class ResultGenerator {
  constructor() {
    this.metrics = {};
  }

  // ✅ Generate comprehensive result
  generateResult(allMetrics) {
    const {
      technicalScore = 0,
      communicationScore = 0,
      attentionScore = 0,
      cheatingScore = 0,
      isSuspicious = false,
      answerCount = 0,
      qualityAnalysis = []
    } = allMetrics;

    // Calculate overall score
    // Technical (40%) + Communication (30%) + Attention (20%) - Cheating Penalty (10%)
    const overallScore = Math.round(
      technicalScore * 0.4 +
      communicationScore * 0.3 +
      attentionScore * 0.2 -
      (cheatingScore * 0.1)
    );

    // Determine pass/fail and grade
    const { status, grade } = this.determineStatus(overallScore, isSuspicious);

    // Extract strengths and weaknesses
    const { strengths, weaknesses } = this.analyzePerformance(
      technicalScore,
      communicationScore,
      attentionScore
    );

    // Generate suggestions
    const suggestions = this.generateSuggestions(
      weaknesses,
      communicationScore,
      attentionScore
    );

    const result = {
      score: Math.max(0, overallScore), // Ensure non-negative
      technicalScore,
      communicationScore,
      attentionScore,
      cheatingScore,
      cheatingFlag: isSuspicious,
      grade,
      status,
      percentage: Math.max(0, overallScore),
      strengths,
      weaknesses,
      suggestions,
      answerCount,
      generatedAt: new Date().toISOString()
    };

    this.metrics = result;
    return result;
  }

  // ✅ Determine pass/fail status
  determineStatus(score, isSuspicious) {
    if (isSuspicious) {
      return {
        status: 'FLAGGED',
        grade: 'N/A',
        reason: 'Interview marked as suspicious due to cheating indicators'
      };
    }

    let status, grade;

    if (score >= 80) {
      status = 'Pass';
      grade = 'A';
    } else if (score >= 70) {
      status = 'Pass';
      grade = 'B';
    } else if (score >= 60) {
      status = 'Pass';
      grade = 'C';
    } else if (score >= 50) {
      status = 'Pass';
      grade = 'D';
    } else {
      status = 'Fail';
      grade = 'F';
    }

    return { status, grade };
  }

  // ✅ Analyze performance to identify strengths and weaknesses
  analyzePerformance(technicalScore, communicationScore, attentionScore) {
    const strengths = [];
    const weaknesses = [];

    // Technical analysis
    if (technicalScore >= 75) {
      strengths.push('Strong technical knowledge and problem-solving');
    } else if (technicalScore < 40) {
      weaknesses.push('Limited technical knowledge - needs improvement');
    }

    // Communication analysis
    if (communicationScore >= 75) {
      strengths.push('Excellent communication and clarity');
    } else if (communicationScore >= 60) {
      strengths.push('Good communication skills');
    } else {
      weaknesses.push('Communication clarity - reduce hesitation and speak more clearly');
    }

    // Attention analysis
    if (attentionScore >= 80) {
      strengths.push('Excellent focus and engagement');
    } else if (attentionScore < 50) {
      weaknesses.push('Poor focus during interview - please minimize distractions');
    }

    // Default strengths if none identified
    if (strengths.length === 0) {
      strengths.push('Participated in the interview');
    }

    // Default weaknesses if none identified
    if (weaknesses.length === 0) {
      weaknesses.push('Continue practicing for better performance');
    }

    return { strengths, weaknesses };
  }

  // ✅ Generate actionable suggestions
  generateSuggestions(weaknesses, communicationScore, attentionScore) {
    const suggestions = [];

    // Communication suggestions
    if (communicationScore < 70) {
      suggestions.push('Practice speaking without filler words (umm, like, basically)');
      suggestions.push('Take a moment to think before answering - quality over speed');
      suggestions.push('Use structured answers: Problem → Approach → Solution');
    }

    // Attention suggestions
    if (attentionScore < 70) {
      suggestions.push('Ensure proper lighting and minimal background distractions');
      suggestions.push('Find a quiet place free from interruptions');
      suggestions.push('Maintain eye contact with the camera');
    }

    // General suggestions
    if (weaknesses.some(w => w.includes('technical'))) {
      suggestions.push('Review core concepts and practice common interview questions');
      suggestions.push('Study real-world project examples related to your skills');
    }

    // Add growth suggestions
    if (suggestions.length === 0) {
      suggestions.push('Continue learning and practicing to maintain excellent performance');
      suggestions.push('Review your answers to identify areas for refinement');
    }

    return suggestions;
  }

  // ✅ Get metrics
  getMetrics() {
    return this.metrics;
  }

  // ✅ Format for storage/transmission
  toJSON() {
    return {
      result: this.metrics
    };
  }
}

export default ResultGenerator;
