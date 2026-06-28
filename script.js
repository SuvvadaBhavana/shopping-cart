const PRODUCTS = [
  { id:1, name:'Wireless headphones', price:79.99, oldPrice:99.99, emoji:'🎧', cat:'Audio',        badge:'sale', rating:4.8, reviews:124 },
  { id:2, name:'Mechanical keyboard', price:129.99,               emoji:'⌨️', cat:'Peripherals',  badge:'new',  rating:4.9, reviews:89  },
  { id:3, name:'USB-C hub 7-in-1',    price:49.99,                emoji:'🔌', cat:'Accessories',  badge:null,   rating:4.6, reviews:203 },
  { id:4, name:'HD webcam 1080p',     price:89.99,                emoji:'📷', cat:'Peripherals',  badge:'new',  rating:4.7, reviews:57  },
  { id:5, name:'LED desk lamp',       price:34.99, oldPrice:44.99, emoji:'💡', cat:'Accessories', badge:'sale', rating:4.5, reviews:312 },
  { id:6, name:'XL mouse pad',        price:19.99,                emoji:'🖱️', cat:'Peripherals',  badge:null,   rating:4.3, reviews:445 },
  { id:7, name:'Monitor stand',       price:59.99,                emoji:'🖥️', cat:'Display',      badge:null,   rating:4.8, reviews:76  },
  { id:8, name:'Cable organizer',     price:14.99,                emoji:'🗂️', cat:'Accessories',  badge:null,   rating:4.2, reviews:189 },
];

let cart = {};
let activeFilter = 'All';
let promoApplied = false;
const PROMO_CODE = 'SAVE10';
const PROMO_DISC = 0.10;

function fmt(n) {
  return '$' + n.toFixed(2);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function setFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts();
}

function filterProducts() {
  renderProducts();
}

function renderProducts() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const list = PRODUCTS.filter(p => {
    const matchCat = activeFilter === 'All' || p.cat === activeFilter;
    const matchQ = p.name.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  document.getElementById('item-count').textContent = list.length + ' item' + (list.length !== 1 ? 's' : '');

  const grid = document.getElementById('product-grid');

  if (list.length === 0) {
    grid.innerHTML = '<p style="color:#9ca3af;font-size:13px;padding:20px 0">No products found.</p>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const qty = cart[p.id] ? cart[p.id].qty : 0;
    const inCart = qty > 0;

    return `
      <div class="pcard ${inCart ? 'in-cart' : ''}">
        <div class="pcard-img">
          ${p.badge === 'new'  ? '<span class="badge-new">New</span>'  : ''}
          ${p.badge === 'sale' ? '<span class="badge-sale">Sale</span>' : ''}
          ${p.emoji}
        </div>
        <div class="pcard-body">
          <div class="pcard-cat">${p.cat}</div>
          <div class="pcard-name">${p.name}</div>
          <div class="pcard-rating">
            <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
            <span class="rating-num">${p.rating} (${p.reviews})</span>
          </div>
          <div class="pcard-footer">
            <div>
              <span class="pcard-price">${fmt(p.price)}</span>
              ${p.oldPrice ? `<span class="pcard-old">${fmt(p.oldPrice)}</span>` : ''}
            </div>
            ${inCart
              ? `<div class="qty-mini">
                   <button class="q-btn" onclick="change(${p.id}, -1)">−</button>
                   <span class="q-num">${qty}</span>
                   <button class="q-btn" onclick="change(${p.id}, +1)">+</button>
                 </div>`
              : `<button class="add-btn" onclick="add(${p.id})">+</button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCart() {
  const items = Object.values(cart);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  document.getElementById('cart-count').textContent = totalQty;

  const navDot = document.getElementById('nav-count');
  navDot.textContent = totalQty;
  navDot.style.display = totalQty > 0 ? 'flex' : 'none';

  const body    = document.getElementById('cart-body');
  const summary = document.getElementById('cart-summary');

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <i class="ti ti-shopping-cart-off"></i>
        <p>Your cart is empty.<br>Add some products to get started.</p>
      </div>`;
    summary.style.display = 'none';
    return;
  }

  body.innerHTML = `
    <div class="cart-items">
      ${items.map(i => `
        <div class="citem">
          <span class="citem-emoji">${i.emoji}</span>
          <div class="citem-info">
            <div class="citem-name">${i.name}</div>
            <div class="citem-price">${fmt(i.price)} each</div>
          </div>
          <div class="citem-right">
            <div class="qty-mini">
              <button class="q-btn" onclick="change(${i.id}, -1)">−</button>
              <span class="q-num">${i.qty}</span>
              <button class="q-btn" onclick="change(${i.id}, +1)">+</button>
            </div>
            <span class="citem-total">${fmt(i.price * i.qty)}</span>
            <button class="rm-btn" onclick="remove(${i.id})">✕</button>
          </div>
        </div>
      `).join('')}
    </div>`;

  const sub      = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = sub >= 50 ? 0 : 4.99;
  const disc     = promoApplied ? sub * PROMO_DISC : 0;
  const total    = sub + shipping - disc;

  const freeBar = document.getElementById('free-ship-bar');
  if (sub < 50) {
    freeBar.innerHTML = `<div class="free-ship">🚚 Add ${fmt(50 - sub)} more for free shipping!</div>`;
  } else {
    freeBar.innerHTML = `<div class="free-ship">✓ You got free shipping!</div>`;
  }

  document.getElementById('sub').textContent  = fmt(sub);
  document.getElementById('ship').textContent = shipping === 0 ? 'Free' : fmt(shipping);

  const discRow = document.getElementById('disc-row');
  if (promoApplied) {
    discRow.style.display = 'flex';
    document.getElementById('disc-val').textContent = '-' + fmt(disc);
  } else {
    discRow.style.display = 'none';
  }

  document.getElementById('grand').textContent = fmt(total);
  summary.style.display = '';
}

function add(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!cart[id]) cart[id] = { ...p, qty: 0 };
  cart[id].qty++;
  showToast(p.name + ' added to cart ✓');
  renderProducts();
  renderCart();
}

function change(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderProducts();
  renderCart();
}

function remove(id) {
  delete cart[id];
  renderProducts();
  renderCart();
}

function clearCart() {
  cart = {};
  promoApplied = false;
  renderProducts();
  renderCart();
}

function applyPromo() {
  const val = document.getElementById('promo-input').value.trim().toUpperCase();
  if (val === PROMO_CODE) {
    promoApplied = true;
    showToast('10% discount applied!');
    renderCart();
  } else {
    showToast('Invalid promo code. Try SAVE10');
  }
}

function checkout() {
  const items = Object.values(cart);
  const names = items.map(i => `${i.qty}x ${i.name}`).join(', ');
  alert('Order placed!\n\nItems: ' + names + '\nTotal: ' + document.getElementById('grand').textContent);
  cart = {};
  promoApplied = false;
  renderProducts();
  renderCart();
}

renderProducts();
renderCart();