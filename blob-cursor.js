// Plain JS implementation of BlobCursor using GSAP
(function() {
  class BlobCursor {
    constructor(opts = {}) {
      const defaults = {
        blobType: 'circle',
        fillColor: '#5227FF',
        trailCount: 3,
        sizes: [60, 125, 75],
        innerSizes: [20, 35, 25],
        innerColor: 'rgba(255,255,255,0.8)',
        opacities: [0.6, 0.6, 0.6],
        shadowColor: 'rgba(0,0,0,0.75)',
        shadowBlur: 5,
        shadowOffsetX: 10,
        shadowOffsetY: 10,
        filterId: 'blob',
        filterStdDeviation: 30,
        filterColorMatrixValues: '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
        useFilter: true,
        fastDuration: 0.1,
        slowDuration: 0.5,
        fastEase: 'power3.out',
        slowEase: 'power1.out',
        zIndex: 100
      };

      this.config = Object.assign({}, defaults, opts);
      this.container = null;
      this.blobs = [];
      this.offset = { left: 0, top: 0 };

      if (!window.gsap) {
        console.warn('GSAP is required for BlobCursor animations.');
      }

      this.init();
    }

    init() {
      const {
        filterId,
        useFilter,
        trailCount,
        sizes,
        innerSizes,
        innerColor,
        blobType,
        fillColor,
        opacities,
        shadowColor,
        shadowBlur,
        shadowOffsetX,
        shadowOffsetY,
        zIndex
      } = this.config;

      // Container
      const container = document.createElement('div');
      container.className = 'blob-container';
      container.style.zIndex = String(zIndex);
      document.body.appendChild(container);
      this.container = container;

      // Optional SVG filter
      if (useFilter) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('style', 'position:absolute;width:0;height:0');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('in', 'SourceGraphic');
        blur.setAttribute('result', 'blur');
        blur.setAttribute('stdDeviation', String(this.config.filterStdDeviation));
        const cm = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        cm.setAttribute('in', 'blur');
        cm.setAttribute('values', this.config.filterColorMatrixValues);
        filter.appendChild(blur);
        filter.appendChild(cm);
        svg.appendChild(filter);
        container.appendChild(svg);
      }

      // Main wrapper to apply filter
      const main = document.createElement('div');
      main.className = 'blob-main';
      if (useFilter) main.style.filter = `url(#${filterId})`;
      container.appendChild(main);

      // Create trail blobs
      for (let i = 0; i < trailCount; i++) {
        const blob = document.createElement('div');
        blob.className = 'blob';
        blob.style.width = `${sizes[i]}px`;
        blob.style.height = `${sizes[i]}px`;
        blob.style.borderRadius = blobType === 'circle' ? '50%' : '0%';
        blob.style.backgroundColor = fillColor;
        blob.style.opacity = String(opacities[i] ?? 0.6);
        blob.style.boxShadow = `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`;

        const inner = document.createElement('div');
        inner.className = 'inner-dot';
        inner.style.width = `${innerSizes[i]}px`;
        inner.style.height = `${innerSizes[i]}px`;
        inner.style.top = `${(sizes[i] - innerSizes[i]) / 2}px`;
        inner.style.left = `${(sizes[i] - innerSizes[i]) / 2}px`;
        inner.style.backgroundColor = innerColor;
        inner.style.borderRadius = blobType === 'circle' ? '50%' : '0%';

        blob.appendChild(inner);
        main.appendChild(blob);
        this.blobs.push(blob);
      }

      // Events
      const moveHandler = (e) => {
        const x = 'clientX' in e ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const y = 'clientY' in e ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        this.updateOffset();
        for (let i = 0; i < this.blobs.length; i++) {
          const el = this.blobs[i];
          const isLead = i === 0;
          if (window.gsap) {
            gsap.to(el, {
              x: x - this.offset.left,
              y: y - this.offset.top,
              duration: isLead ? this.config.fastDuration : this.config.slowDuration,
              ease: isLead ? this.config.fastEase : this.config.slowEase
            });
          } else {
            el.style.transform = `translate(${x - this.offset.left}px, ${y - this.offset.top}px)`;
          }
        }
      };

      window.addEventListener('mousemove', moveHandler, { passive: true });
      window.addEventListener('touchmove', moveHandler, { passive: true });
      window.addEventListener('resize', () => this.updateOffset());

      this.updateOffset();
    }

    updateOffset() {
      if (!this.container) { this.offset = { left: 0, top: 0 }; return; }
      const rect = this.container.getBoundingClientRect();
      this.offset = { left: rect.left, top: rect.top };
    }
  }

  // Expose globally
  window.BlobCursor = BlobCursor;
})();