/* ================================================
   VOICE QUALITY ANALYSIS SYSTEM
   - Detects hesitation words (umm, ahh, uh, like, basically, you know, etc.)
   - Analyzes word clarity (word count, proper speech patterns)
   - Generates communication score
   ================================================ */

export class VoiceQualityAnalyzer {
  constructor() {
    this.communicationScore = 50; // 0-100
    this.hesitationWords = [
      'umm', 'ummm', 'um', 'ahh', 'ahhh', 'ah', 'uh', 'uhh',
      'like', 'basically', 'you know', 'kind of', 'sort of',
      'actually', 'literally', 'honestly', 'pretty much',
      'i mean', 'anyway', 'so yeah', 'okay so'
    ];
    this.analysisResults = [];
  }

  // ✅ Analyze transcript for hesitation words
  analyzeHesitations(transcript) {
    if (!transcript || transcript.trim().length === 0) {
      return { hesitations: 0, words: 0, hesitationRate: 0 };
    }

    const lowerTranscript = transcript.toLowerCase();
    let hesitationCount = 0;

    // Count hesitation word occurrences
    for (const word of this.hesitationWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerTranscript.match(regex);
      if (matches) {
        hesitationCount += matches.length;
      }
    }

    // Count total words
    const words = transcript.trim().split(/\s+/).length;
    const hesitationRate = words > 0 ? (hesitationCount / words) * 100 : 0;

    return {
      hesitations: hesitationCount,
      words,
      hesitationRate: parseFloat(hesitationRate.toFixed(2)),
      assessment: this.assessHesitations(hesitationRate)
    };
  }

  // ✅ Assess hesitation severity
  assessHesitations(hesitationRate) {
    if (hesitationRate < 2) return 'EXCELLENT'; // < 2% is excellent
    if (hesitationRate < 5) return 'GOOD'; // 2-5% is good
    if (hesitationRate < 10) return 'MODERATE'; // 5-10% is moderate
    return 'POOR'; // > 10% is poor
  }

  // ✅ Analyze speech clarity
  analyzeClaritty(transcript) {
    if (!transcript || transcript.trim().length === 0) {
      return {
        clarity: 0,
        wordCount: 0,
        sentenceCount: 0,
        avgWordLength: 0
      };
    }

    const words = transcript.trim().split(/\s+/);
    const wordCount = words.length;
    
    // Count sentences (periods, question marks, exclamation marks)
    const sentenceCount = (transcript.match(/[.!?]/g) || []).length || 1;
    
    // Average word length
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    const avgWordLength = wordCount > 0 ? totalLength / wordCount : 0;

    // Clarity score based on multiple factors
    let clarityScore = 50;

    // More words = better coverage (optimal: 50-150 words for short answer)
    if (wordCount >= 30 && wordCount <= 150) {
      clarityScore += 25;
    } else if (wordCount > 150) {
      clarityScore += 15; // Still good but verbose
    } else if (wordCount >= 20) {
      clarityScore += 10; // Minimum acceptable
    } else {
      clarityScore -= 20; // Too short
    }

    // Proper sentence structure
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;
    if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 20) {
      clarityScore += 15; // Good sentence structure
    }

    // Punctuation (if any) indicates structure
    if (sentenceCount > 1) {
      clarityScore += 10;
    }

    clarityScore = Math.min(100, clarityScore);

    return {
      clarity: clarityScore,
      wordCount,
      sentenceCount,
      avgWordLength: parseFloat(avgWordLength.toFixed(2)),
      avgWordsPerSentence: parseFloat(avgWordsPerSentence.toFixed(2))
    };
  }

  // ✅ Generate overall communication score
  generateCommunicationScore(transcript) {
    const hesitations = this.analyzeHesitations(transcript);
    const clarity = this.analyzeClaritty(transcript);

    // Calculate score
    let score = 50; // Base

    // Hesitation impact (0-30 points)
    const hesitationPenalty = Math.min(30, hesitations.hesitationRate * 3);
    score -= hesitationPenalty;

    // Clarity contribution (0-30 points)
    score += (clarity.clarity / 100) * 30;

    // Word count bonus
    if (hesitations.words >= 30) {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));
    this.communicationScore = score;

    const result = {
      communicationScore: score,
      hesitations,
      clarity,
      assessment: this.generateAssessment(score)
    };

    this.analysisResults.push(result);
    return result;
  }

  // ✅ Generate assessment text
  generateAssessment(score) {
    if (score >= 85) return 'EXCELLENT - Clear, confident delivery with minimal hesitation';
    if (score >= 70) return 'GOOD - Generally clear with some hesitations';
    if (score >= 50) return 'AVERAGE - Fair clarity with noticeable hesitations';
    if (score >= 30) return 'NEEDS IMPROVEMENT - Significant hesitations affecting clarity';
    return 'POOR - Too many hesitations and lack of clarity';
  }

  // ✅ Get all analysis results
  getResults() {
    return {
      communicationScore: this.communicationScore,
      analysisResults: this.analysisResults,
      overallAssessment: this.generateAssessment(this.communicationScore)
    };
  }

  // ✅ Reset
  reset() {
    this.communicationScore = 50;
    this.analysisResults = [];
  }
}

export default VoiceQualityAnalyzer;
