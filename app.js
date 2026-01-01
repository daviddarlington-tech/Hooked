// Hooked Store — HTML/CSS/JS implementation

// Utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const currency = (n) => {
  return `₦${n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

// Product Data (placeholder images)
const PRODUCTS = [
  { id: 'ear-01', name: 'Petal Hoop Earrings', price: 4500, category: 'earrings', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Earrings+01', bestSeller: true },
  { id: 'ear-02', name: 'Twist Drop Earrings', price: 3800, category: 'earrings', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Earrings+02', bestSeller: true },
  { id: 'hair-01', name: 'Rose Scrunchie', price: 3500, category: 'hair', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Scrunchie+01', bestSeller: true },
  { id: 'hair-02', name: 'Braided Headband', price: 3600, category: 'hair', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Headband+02' },
  { id: 'bag-01', name: 'Mini Tote', price: 7500, category: 'bags', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Bag+01', bestSeller: true },
  { id: 'bag-02', name: 'Crossbody Pouch', price: 6000, category: 'bags', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Bag+02' },
  { id: 'key-01', name: 'Heart Charm', price: 3500, category: 'keychains', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Keychain+01' },
  { id: 'key-02', name: 'Flower Charm', price: 3500, category: 'keychains', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Keychain+02' },
  { id: 'ear-03', name: 'Lily Studs', price: 3500, category: 'earrings', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Earrings+03' },
  { id: 'hair-03', name: 'Loop Scrunchie', price: 3500, category: 'hair', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Scrunchie+03' },
  { id: 'bag-03', name: 'Shell Clutch', price: 8000, category: 'bags', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Bag+03' },
  { id: 'key-03', name: 'Star Charm', price: 3500, category: 'keychains', img: 'https://placehold.co/600x400/EEEEEE/000?text=Hooked+Keychain+03' }
];

// State
let state = {
  products: PRODUCTS,
  query: '',
  category: 'all',
  sort: 'default',
  cart: loadCart()
};

function loadCart() {
  try { return JSON.parse(localStorage.getItem('hooked_cart') || '[]'); } catch { return []; }
}
function saveCart() { localStorage.setItem('hooked_cart', JSON.stringify(state.cart)); }

// Rendering
function renderProducts() {
  const grid = $('#productGrid');
  if (!grid) return;
  const products = filteredProducts();
  grid.innerHTML = products.map(p => `
    <article class="product-card">
      <img alt="${p.name}" src="${p.img}" />
      <h3>${p.name}</h3>
      <p class="price">${currency(p.price)}</p>
      <button class="add-btn" data-id="${p.id}">Add to Cart</button>
    </article>
  `).join('');

  // Bind add buttons
  $$('#productGrid .add-btn').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.id)));
}

function filteredProducts() {
  let list = [...state.products];
  const q = state.query.trim().toLowerCase();
  if (state.category !== 'all') list = list.filter(p => p.category === state.category);
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q));
  if (state.sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  if (state.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  return list;
}

// Cart
function updateCartCount() {
  const count = state.cart.reduce((sum, it) => sum + it.qty, 0);
  const el = $('#cartCount');
  if (el) el.textContent = String(count);
}

function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(it => it.id === id);
  if (existing) existing.qty += 1; else state.cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
  saveCart();
  updateCartCount();
  renderCart();
  openCart();
}

function renderCart() {
  const wrap = $('#cartItems');
  if (!wrap) return;
  if (state.cart.length === 0) {
    wrap.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    wrap.innerHTML = state.cart.map(it => `
      <div class="cart-item">
        <img alt="${it.name}" src="${it.img}" />
        <div>
          <div><strong>${it.name}</strong></div>
          <div class="quantity">
            <button class="qty-btn" data-action="dec" data-id="${it.id}">-</button>
            <span>${it.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${it.id}">+</button>
            <button class="remove-btn" data-action="remove" data-id="${it.id}">Remove</button>
          </div>
        </div>
        <div>${currency(it.price * it.qty)}</div>
      </div>
    `).join('');
  }

  // Totals
  const subtotal = state.cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  const shipping = state.cart.length ? 2500 : 0; // 2500 NGN shipping
  $('#subtotal').textContent = currency(subtotal);
  $('#shipping').textContent = currency(shipping);
  $('#grandTotal').textContent = currency(subtotal + shipping);

  // Bind cart controls
  $$('#cartItems .qty-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.id; const action = btn.dataset.action;
    if (action === 'inc') changeQty(id, +1);
    if (action === 'dec') changeQty(id, -1);
  }));
  $$('#cartItems .remove-btn').forEach(btn => btn.addEventListener('click', () => removeItem(btn.dataset.id)));
}

function changeQty(id, delta) {
  const it = state.cart.find(i => i.id === id);
  if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart();
  updateCartCount();
  renderCart();
}

function removeItem(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  updateCartCount();
  renderCart();
}

function openCart() { $('#cartDrawer').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); }

// Checkout
function openCheckout() { $('#checkoutModal').classList.add('open'); $('#checkoutModal').setAttribute('aria-hidden', 'false'); }
function closeCheckout() { $('#checkoutModal').classList.remove('open'); $('#checkoutModal').setAttribute('aria-hidden', 'true'); }

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const name = $('#fullName').value.trim();
  const email = $('#checkoutEmail').value.trim();
  const address = $('#address').value.trim();
  const phone = $('#phone').value.trim();
  const status = $('#checkoutStatus');

  if (!name || !email || !address || !phone) { status.textContent = 'Please complete all fields.'; return; }
  
  status.textContent = 'Redirecting to WhatsApp...';

  // Calculate Totals
  const subtotal = state.cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  const shipping = state.cart.length ? 2500 : 0;
  const total = subtotal + shipping;

  // Build WhatsApp Message
  let msg = `*New Order from Hooked*\n`;
  msg += `----------------\n`;
  msg += `*Customer Details:*\n`;
  msg += `Name: ${name}\nEmail: ${email}\nAddress: ${address}\nPhone: ${phone}\nPayment: Bank Transfer\n\n`;
  
  msg += `*Order Summary:*\n`;
  state.cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} (x${item.qty}) - ${currency(item.price * item.qty)}\n`;
  });

  msg += `\n*Subtotal:* ${currency(subtotal)}\n`;
  msg += `*Shipping:* ${currency(shipping)}\n`;
  msg += `*Total:* ${currency(total)}`;

  // WhatsApp Redirect
  const phoneNumber = "2348036865617";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;

  // Clear cart
  state.cart = [];
  saveCart();
  updateCartCount();
  renderCart();
  
  window.open(url, '_blank');
  closeCheckout();
}

// Contact
function handleContactSubmit(e) {
  e.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const message = $('#message').value.trim();
  const status = $('#contactStatus');
  
  if (!name || !email || !message) { 
    status.textContent = 'Please complete all fields.'; 
    return; 
  }

  status.textContent = 'Sending...';

  fetch("https://formsubmit.co/ajax/pamilerintoluju@gmail.com", {
    method: "POST",
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ name, email, message })
  })
  .then(response => response.json())
  .then(data => {
    status.textContent = 'Thanks! We will reach out soon.';
    e.target.reset();
  })
  .catch(error => {
    console.error('Error:', error);
    status.textContent = 'Something went wrong. Please try again.';
  });
}

// Events & Init
window.addEventListener('DOMContentLoaded', () => {
  const loader = $('#loader');
  if (loader) {
    const hasVisited = sessionStorage.getItem('hooked_has_visited');
    if (!hasVisited) {
      // First visit in this session, show loader
      document.body.classList.add('loading');
      const MIN_LOAD_TIME = 2500; // 2.5 seconds
      const loadStartTime = Date.now();
      const loadingBar = $('#loadingBar');
      if (loadingBar) {
        loadingBar.style.transition = `width ${MIN_LOAD_TIME}ms ease-out`;
        setTimeout(() => { loadingBar.style.width = '100%'; }, 50);
      }
      window.addEventListener('load', () => {
        const loadEndTime = Date.now();
        const remainingTime = Math.max(0, MIN_LOAD_TIME - (loadEndTime - loadStartTime));
        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.classList.remove('loading');
          sessionStorage.setItem('hooked_has_visited', 'true');
        }, remainingTime);
      });
    } else {
      // Already visited, hide loader immediately
      // This is now handled by the inline script in index.html to prevent flash
    }
  }

  // Initialize scroll animations first
  initAnimations();

  // Instantiate Blob Cursor with given settings
  new BlobCursor({
    blobType: 'circle',
    fillColor: '#e0e0e0',
    trailCount: 3,
    sizes: [30, 60, 40],
    innerSizes: [10, 22, 14],
    innerColor: 'rgba(255,255,255,0.8)',
    opacities: [0.6, 0.6, 0.6],
    shadowColor: 'rgba(0,0,0,0.75)',
    shadowBlur: 5,
    shadowOffsetX: 10,
    shadowOffsetY: 10,
    filterStdDeviation: 30,
    useFilter: true,
    fastDuration: 0.1,
    slowDuration: 0.5,
    zIndex: 100
  });
  // Initialize ClickSpark effect
  new ClickSpark({
    sparkColor: '#000000', // Black for better visibility
    sparkSize: 20,         // Slightly smaller
    sparkRadius: 35,       // Slightly smaller
    sparkCount: 10,        // Slightly fewer
    duration: 1000,
    extraScale: 1.2
  });

  // Year
  const y = new Date().getFullYear(); $('#year').textContent = String(y);

  // Render initial products & cart
  renderProducts();
  renderBestSellers();
  updateCartCount();
  renderCart();

  // Search
  const search = $('#searchInput');
  if (search) search.addEventListener('input', () => { state.query = search.value; renderProducts(); });

  // Categories
  // category buttons removed on home

  // Sort
  const sort = $('#sortSelect');
  if (sort) sort.addEventListener('change', () => { state.sort = sort.value; renderProducts(); });

  // Cart controls
  const cartBtn = $('#cartButton'); if (cartBtn) cartBtn.addEventListener('click', openCart);
  const closeCartBtn = $('#closeCart'); if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

  // Checkout controls
  const checkoutBtn = $('#checkoutBtn'); if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
  const closeCheckoutBackdrop = $('#closeCheckout'); if (closeCheckoutBackdrop) closeCheckoutBackdrop.addEventListener('click', closeCheckout);
  const closeCheckoutBtn = $('#closeCheckoutBtn'); if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckout);
  const checkoutForm = $('#checkoutForm'); if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  // Contact
  const contactForm = $('#contactForm'); if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

  // Theme toggle
  // Dark mode removed

  // Mobile Nav Toggle
  const navToggle = $('.nav-toggle');
  const siteHeader = $('.site-header');
  if (navToggle && siteHeader) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteHeader.classList.toggle('nav-open');
      const icon = navToggle.querySelector('i');
      if (icon) icon.className = isOpen ? 'ri-close-line' : 'ri-menu-line';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    $$('.nav-link').forEach(l => l.addEventListener('click', () => {
      siteHeader.classList.remove('nav-open');
      const icon = navToggle.querySelector('i');
      if (icon) icon.className = 'ri-menu-line';
      document.body.style.overflow = '';
    }));
  }

  // Centralize Hero Text
  const heroSection = $('.hero');
  if (heroSection) {
    heroSection.style.textAlign = 'center';
    heroSection.style.display = 'flex';
    heroSection.style.flexDirection = 'column';
    heroSection.style.justifyContent = 'center';
    heroSection.style.alignItems = 'center';
    
    // Reset grid layout for inner container to ensure text is centered
    const heroInner = $('.hero-inner');
    if (heroInner) heroInner.style.display = 'block';
  }
});

// Scroll animations with IntersectionObserver
let observer;
function initAnimations() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });
  observeAnimations(document.querySelectorAll('[data-animate]'));
}

function observeAnimations(nodes) {
  if (!observer) return;
  nodes.forEach((n) => observer.observe(n));
}

// Best Sellers on home
function renderBestSellers() {
  const grid = $('#bestSellersGrid');
  if (!grid) return;
  const products = state.products.filter(p => p.bestSeller).slice(0, 4);
  grid.innerHTML = products.map(p => `
    <article class="product-card" data-animate="fade-up">
      <img alt="${p.name}" src="${p.img}" />
      <h3>${p.name}</h3>
      <p class="price">${currency(p.price)}</p>
      <button class="add-btn" data-id="${p.id}">Add to Cart</button>
    </article>
  `).join('');
  $$('#bestSellersGrid .add-btn').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.id)));
  observeAnimations(grid.querySelectorAll('[data-animate]'));
}