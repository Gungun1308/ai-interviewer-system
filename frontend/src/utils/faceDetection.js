/* ================================================
   FACE & ATTENTION DETECTION UTILITY
   - Detects face visibility
   - Tracks attention (looking away)
   - Detects multiple faces
   - Generates attention warnings
   ================================================ */

import * as faceapi from 'face-api.js';

export class FaceDetectionSystem {
  constructor() {
    this.modelsLoaded = false;
    this.detectionInterval = null;
    this.attentionScore = 100; // 0-100
    this.consecutiveFaceMissCount = 0;
    this.multipleDetections = 0;
    this.maxConsecutiveMisses = 5; // Allow 5 consecutive misses
  }

  // ✅ Load face-api models
  async loadModels() {
    if (this.modelsLoaded) return;
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      this.modelsLoaded = true;
      console.log('✅ Face detection models loaded');
    } catch (error) {
      console.error('❌ Failed to load face detection models:', error);
      throw error;
    }
  }

  // ✅ Detect faces in video
  async detectFaces(videoElement) {
    if (!this.modelsLoaded) return { faces: 0, visible: false };

    try {
      if (!videoElement || videoElement.readyState !== 4) {
        return { faces: 0, visible: false };
      }

      const detections = await faceapi.detectAllFaces(
        videoElement,
        new faceapi.TinyFaceDetectorOptions()
      );

      const faceCount = detections.length;
      const faceVisible = faceCount === 1; // Ideal: exactly 1 face

      // Track multiple faces detection
      if (faceCount > 1) {
        this.multipleDetections++;
      }

      // Track face detection streaks
      if (faceVisible) {
        this.consecutiveFaceMissCount = 0;
      } else {
        this.consecutiveFaceMissCount++;
      }

      // Update attention score
      this.updateAttentionScore(faceVisible);

      return {
        faces: faceCount,
        visible: faceVisible,
        score: this.attentionScore,
        consecutiveMisses: this.consecutiveFaceMissCount
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return { faces: 0, visible: false };
    }
  }

  // ✅ Update attention score based on face visibility
  updateAttentionScore(faceVisible) {
    if (faceVisible) {
      // Increase score slightly when face is visible
      this.attentionScore = Math.min(100, this.attentionScore + 1);
    } else {
      // Decrease score when face is not visible
      this.attentionScore = Math.max(0, this.attentionScore - 3);
    }
  }

  // ✅ Start continuous face detection
  startDetection(videoElement, onDetection) {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }

    this.detectionInterval = setInterval(async () => {
      const result = await this.detectFaces(videoElement);
      onDetection(result);
    }, 1500); // Check every 1.5 seconds
  }

  // ✅ Stop detection
  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  // ✅ Get attention warnings
  getAttentionWarning(detectionResult) {
    const { faces, visible, consecutiveMisses } = detectionResult;

    if (!visible && consecutiveMisses >= 3) {
      return '⚠️ Face not detected - Please focus on screen';
    }
    if (faces > 1) {
      return '⚠️ Multiple faces detected - Ensure only you are visible';
    }
    return null;
  }

  // ✅ Get overall attention metrics
  getMetrics() {
    return {
      attentionScore: this.attentionScore,
      multipleDetectionCount: this.multipleDetections,
      consecutiveMissCount: this.consecutiveFaceMissCount
    };
  }

  // ✅ Reset for new question
  reset() {
    this.consecutiveFaceMissCount = 0;
    // Don't reset attention score - it accumulates over time
  }
}

export default FaceDetectionSystem;
