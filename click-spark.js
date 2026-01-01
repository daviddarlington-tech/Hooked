// Plain JS ClickSpark implementation (global overlay canvas)
(function() {
  class ClickSpark {
    constructor(opts = {}) {
      const defaults = {
        sparkColor: '#fff',
        sparkSize: 10,
        sparkRadius: 15,
        sparkCount: 8,
        duration: 400,
        easing: 'ease-out',
        extraScale: 1.0
      };
      this.cfg = Object.assign({}, defaults, opts);
      this.canvas = null;
      this.ctx = null;
      this.sparks = [];
      this.animationId = null;
      this.resizeObserver = null;
      this.init();
    }

    init() {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.userSelect = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      const resizeCanvas = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      };
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      // Click handler
      window.addEventListener('click', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const now = performance.now();
        const N = this.cfg.sparkCount;
        for (let i = 0; i < N; i++) {
          this.sparks.push({
            x, y,
            angle: (2 * Math.PI * i) / N,
            startTime: now
          });
        }
      }, { passive: true });

      // Animation loop
      const draw = (timestamp) => {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const duration = this.cfg.duration;

        // Easing
        const easeFunc = (t) => {
          switch (this.cfg.easing) {
            case 'linear': return t;
            case 'ease-in': return t * t;
            case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default: return t * (2 - t); // ease-out
          }
        };

        this.sparks = this.sparks.filter((s) => {
          const elapsed = timestamp - s.startTime;
          if (elapsed >= duration) return false;
          const progress = elapsed / duration;
          const eased = easeFunc(progress);
          const distance = eased * this.cfg.sparkRadius * this.cfg.extraScale;
          const lineLength = this.cfg.sparkSize * (1 - eased);

          const x1 = s.x + distance * Math.cos(s.angle);
          const y1 = s.y + distance * Math.sin(s.angle);
          const x2 = s.x + (distance + lineLength) * Math.cos(s.angle);
          const y2 = s.y + (distance + lineLength) * Math.sin(s.angle);

          ctx.strokeStyle = this.cfg.sparkColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          return true;
        });

        this.animationId = requestAnimationFrame(draw);
      };
      this.animationId = requestAnimationFrame(draw);
    }
  }

  window.ClickSpark = ClickSpark;
})();