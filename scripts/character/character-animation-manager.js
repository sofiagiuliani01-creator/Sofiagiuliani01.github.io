(function () {
  class CharacterAnimationManager {
    constructor({ config, preloadManager, renderer }) {
      this.config = config;
      this.preloadManager = preloadManager;
      this.renderer = renderer;
      this.sequenceKey = null;
      this.frameIndex = 1;
      this.elapsed = 0;
      this.lastTs = 0;
      this.isPlaying = false;
      this.rafId = 0;
      this.onSequenceEnd = null;

      this.loop = this.loop.bind(this);
    }

    play(sequenceKey, { reset = true, onComplete = null } = {}) {
      if (!this.config.sequences[sequenceKey]) return;

      if (reset || this.sequenceKey !== sequenceKey) {
        this.frameIndex = 1;
        this.elapsed = 0;
      }

      this.sequenceKey = sequenceKey;
      this.onSequenceEnd = onComplete;
      this.isPlaying = true;
      this.lastTs = 0;
      this.renderCurrentFrame();

      if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.loop);
      }
    }

    stop() {
      this.isPlaying = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
    }

    renderCurrentFrame() {
      if (!this.sequenceKey) return;
      const image = this.preloadManager.getFrame(this.sequenceKey, this.frameIndex);
      if (image) this.renderer.setFrame(image);
    }

    loop(ts) {
      if (!this.isPlaying || !this.sequenceKey) {
        this.rafId = 0;
        return;
      }

      const sequence = this.config.sequences[this.sequenceKey];
      const fps = sequence.fps || this.config.defaultFps;
      const frameDuration = 1000 / fps;

      if (!this.lastTs) this.lastTs = ts;
      this.elapsed += ts - this.lastTs;
      this.lastTs = ts;

      while (this.elapsed >= frameDuration) {
        this.elapsed -= frameDuration;
        this.frameIndex += 1;

        if (this.frameIndex > sequence.frames) {
          if (sequence.loop) {
            this.frameIndex = 1;
          } else {
            this.frameIndex = sequence.frames;
            this.isPlaying = false;
            const completeCb = this.onSequenceEnd;
            this.onSequenceEnd = null;
            if (typeof completeCb === 'function') completeCb();
            break;
          }
        }

        this.renderCurrentFrame();
      }

      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  window.CharacterAnimationManager = CharacterAnimationManager;
})();
