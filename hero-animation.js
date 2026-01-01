document.addEventListener('DOMContentLoaded', () => {
  const heroImage = document.getElementById('heroImage');

  if (!heroImage) return;

  let isGlowLocked = false;

  heroImage.addEventListener('mouseenter', () => {
    heroImage.classList.add('glow');
  });

  heroImage.addEventListener('mouseleave', () => {
    if (!isGlowLocked) {
      heroImage.classList.remove('glow');
    }
  });

  heroImage.addEventListener('click', () => {
    isGlowLocked = !isGlowLocked;
    heroImage.classList.toggle('glow', isGlowLocked);
  });
});