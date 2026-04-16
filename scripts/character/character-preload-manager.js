(function () {
  class CharacterPreloadManager {
    constructor(config) {
      this.config = config;
      this.cache = new Map();
      this.placeholderCache = new Map();
      this.failed = new Set();
    }

    static pad(index) {
      return String(index).padStart(4, '0');
    }

    buildFrameUrl(sequenceKey, frameIndex) {
      const seq = this.config.sequences[sequenceKey];
      if (!seq) return '';
      return `${seq.folder}/${seq.prefix}${CharacterPreloadManager.pad(frameIndex)}.${this.config.frameExt}`;
    }

    loadImage(url) {
      if (this.cache.has(url)) return Promise.resolve(this.cache.get(url));

      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';

        img.onload = () => {
          this.cache.set(url, img);
          resolve(img);
        };

        img.onerror = () => {
          this.failed.add(url);
          const fallback = this.buildPlaceholder(url);
          this.cache.set(url, fallback);
          resolve(fallback);
        };

        img.src = url;
      });
    }

    buildPlaceholder(cacheKey) {
      if (this.placeholderCache.has(cacheKey)) return this.placeholderCache.get(cacheKey);

      const canvas = document.createElement('canvas');
      canvas.width = 180;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(90, 65, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(90, 98);
        ctx.lineTo(90, 190);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(45, 115);
        ctx.lineTo(90, 130);
        ctx.lineTo(135, 115);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(90, 190);
        ctx.lineTo(62, 260);
        ctx.moveTo(90, 190);
        ctx.lineTo(118, 260);
        ctx.stroke();
      }

      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      this.placeholderCache.set(cacheKey, img);
      return img;
    }

    async preloadSequence(sequenceKey) {
      const seq = this.config.sequences[sequenceKey];
      if (!seq) return [];

      const promises = [];
      for (let i = 1; i <= seq.frames; i += 1) {
        const url = this.buildFrameUrl(sequenceKey, i);
        promises.push(this.loadImage(url));
      }

      return Promise.all(promises);
    }

    async warmup(sequenceKeys) {
      const uniqueKeys = Array.from(new Set(sequenceKeys)).filter(Boolean);
      await Promise.all(uniqueKeys.map((key) => this.preloadSequence(key)));
    }

    getFrame(sequenceKey, frameIndex) {
      const url = this.buildFrameUrl(sequenceKey, frameIndex);
      return this.cache.get(url) || null;
    }
  }

  window.CharacterPreloadManager = CharacterPreloadManager;
})();
