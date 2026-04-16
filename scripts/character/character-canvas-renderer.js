(function () {
  class CharacterCanvasRenderer {
    constructor() {
      this.layer = document.createElement('div');
      this.layer.className = 'character-canvas-layer is-hidden';

      this.wrap = document.createElement('div');
      this.wrap.className = 'character-canvas-wrap';

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'character-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');

      this.wrap.appendChild(this.canvas);
      this.layer.appendChild(this.wrap);
      document.body.appendChild(this.layer);

      this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
      this.currentImage = null;
      this.needsRedraw = true;
      this.pixelRatio = 1;
      this.logicalWidth = 180;
      this.logicalHeight = 320;

      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize, { passive: true });
      this.onResize();
    }

    onResize() {
      this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = this.wrap.clientWidth || 180;
      const height = Math.round(width * 1.8);
      this.logicalWidth = width;
      this.logicalHeight = height;

      this.canvas.width = Math.max(1, Math.round(width * this.pixelRatio));
      this.canvas.height = Math.max(1, Math.round(height * this.pixelRatio));
      if (this.ctx) {
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      }

      this.needsRedraw = true;
      this.draw();
    }

    setSize(widthPx) {
      this.wrap.style.width = `${widthPx}px`;
      this.onResize();
    }

    setVisible(isVisible) {
      this.layer.classList.toggle('is-hidden', !isVisible);
    }

    setPosition({ x, y, rotation = 0, scale = 1 }) {
      this.wrap.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    }

    setFrame(image) {
      if (!image || image === this.currentImage) return;
      this.currentImage = image;
      this.needsRedraw = true;
      this.draw();
    }

    draw() {
      if (!this.ctx || !this.needsRedraw) return;
      this.needsRedraw = false;

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
      if (!this.currentImage) return;

      const imgW = this.currentImage.naturalWidth || this.currentImage.width || this.logicalWidth;
      const imgH = this.currentImage.naturalHeight || this.currentImage.height || this.logicalHeight;
      const scale = Math.min(this.logicalWidth / imgW, this.logicalHeight / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const drawX = (this.logicalWidth - drawW) / 2;
      const drawY = this.logicalHeight - drawH;

      ctx.drawImage(this.currentImage, drawX, drawY, drawW, drawH);
    }

    destroy() {
      window.removeEventListener('resize', this.onResize);
      this.layer.remove();
    }
  }

  window.CharacterCanvasRenderer = CharacterCanvasRenderer;
})();
