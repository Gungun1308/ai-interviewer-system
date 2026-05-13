/* ================================================
   ADVANCED ANTI-CHEATING SYSTEM
   - Detects tab switches
   - Detects window blur events
   - Tracks rapid switching patterns
   - Maintains cheating score
   ================================================ */

export class CheatingDetectionSystem {
  constructor() {
    this.cheatingScore = 0; // 0-100
    this.cheatingFlags = [];
    this.tabSwitchCount = 0;
    this.windowBlurCount = 0;
    this.lastEventTime = Date.now();
    this.rapidSwitchThreshold = 3000; // ms
    this.isSuspicious = false;
    this.CHEATING_THRESHOLD = 60; // Score threshold for suspicious flag
  }

  // ✅ Detect visibility change (tab switch)
  handleVisibilityChange() {
    if (document.hidden) {
      this.tabSwitchCount++;
      this.addCheatingScore(15); // Add 15 points per switch
      this.cheatingFlags.push({
        type: 'TAB_SWITCH',
        timestamp: new Date(),
        count: this.tabSwitchCount
      });

      // Detect rapid switching
      const now = Date.now();
      if (now - this.lastEventTime < this.rapidSwitchThreshold) {
        this.addCheatingScore(25); // Extra penalty for rapid switching
        this.cheatingFlags.push({
          type: 'RAPID_SWITCH',
          timestamp: new Date()
        });
      }
      this.lastEventTime = now;
    }
  }

  // ✅ Detect window blur
  handleWindowBlur() {
    this.windowBlurCount++;
    this.addCheatingScore(10); // Add 10 points per blur
    this.cheatingFlags.push({
      type: 'WINDOW_BLUR',
      timestamp: new Date(),
      count: this.windowBlurCount
    });
  }

  // ✅ Add to cheating score
  addCheatingScore(points) {
    this.cheatingScore = Math.min(100, this.cheatingScore + points);
    
    // Flag as suspicious if threshold exceeded
    if (this.cheatingScore >= this.CHEATING_THRESHOLD) {
      this.isSuspicious = true;
    }
  }

  // ✅ Register event listeners
  registerListeners() {
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    window.addEventListener('blur', () => this.handleWindowBlur());
    window.addEventListener('focus', () => {
      // Optional: Could reduce score slightly on refocus
      // this.cheatingScore = Math.max(0, this.cheatingScore - 2);
    });
  }

  // ✅ Remove event listeners
  unregisterListeners() {
    document.removeEventListener('visibilitychange', () => this.handleVisibilityChange());
    window.removeEventListener('blur', () => this.handleWindowBlur());
    window.removeEventListener('focus', () => {});
  }

  // ✅ Get warning message
  getWarning() {
    if (this.isSuspicious) {
      return '🚨 Interview marked as SUSPICIOUS due to multiple tab switches or focus losses';
    }
    if (this.tabSwitchCount >= 2) {
      return '⚠️ Do not switch tabs during the interview';
    }
    if (this.windowBlurCount >= 2) {
      return '⚠️ Keep the interview window focused';
    }
    return null;
  }

  // ✅ Get metrics
  getMetrics() {
    return {
      cheatingScore: this.cheatingScore,
      tabSwitchCount: this.tabSwitchCount,
      windowBlurCount: this.windowBlurCount,
      isSuspicious: this.isSuspicious,
      flags: this.cheatingFlags
    };
  }

  // ✅ Reset for new session
  reset() {
    this.cheatingScore = 0;
    this.tabSwitchCount = 0;
    this.windowBlurCount = 0;
    this.cheatingFlags = [];
    this.isSuspicious = false;
    this.lastEventTime = Date.now();
  }
}

export default CheatingDetectionSystem;
