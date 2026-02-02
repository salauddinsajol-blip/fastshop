(function () {
  const CART_KEY = 'golive-mobile-kit';

  function getCart() {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
    renderCartDrawer();
  }

  function addItem(item) {
    const cart = getCart();
    const existing = cart.find(function (i) { return i.id === item.id; });
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: item.id, name: item.name, price: item.price, image: item.image || '', quantity: 1 });
    }
    setCart(cart);
  }

  function removeItem(id) {
    const cart = getCart().filter(function (i) { return i.id !== id; });
    setCart(cart);
  }

  function updateQuantity(id, delta) {
    const cart = getCart();
    const item = cart.find(function (i) { return i.id === id; });
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeItem(id);
      return;
    }
    setCart(cart);
  }

  function getCartCount() {
    return getCart().reduce(function (sum, i) { return sum + i.quantity; }, 0);
  }

  function getSubtotal() {
    return getCart().reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
  }

  function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = getCartCount();
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function renderCartDrawer() {
    const container = document.getElementById('cart-drawer-items');
    const subtotalEl = document.getElementById('cart-drawer-subtotal');
    const checkoutBtn = document.getElementById('cart-drawer-checkout');
    if (!container) return;

    const cart = getCart();
    const subtotal = getSubtotal();

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal;
    if (checkoutBtn) checkoutBtn.style.display = cart.length === 0 ? 'none' : 'block';

    if (cart.length === 0) {
      container.innerHTML = '<p class="text-slate-500 text-center py-8 text-sm">Your kit is empty.</p>';
      return;
    }

    container.innerHTML = cart.map(function (item) {
      return (
        '<div class="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 mb-3" data-cart-id="' + item.id + '">' +
          '<img src="' + (item.image || '') + '" alt="" class="w-16 h-16 object-cover rounded-lg flex-shrink-0" />' +
          '<div class="flex-1 min-w-0">' +
            '<h3 class="font-semibold text-slate-800 text-sm truncate">' + item.name + '</h3>' +
            '<p class="text-emerald-600 font-bold text-sm">$' + item.price + '</p>' +
            '<div class="flex items-center gap-2 mt-1">' +
              '<button type="button" class="cart-qty-minus w-7 h-7 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-sm" data-id="' + item.id + '" aria-label="Decrease">−</button>' +
              '<span class="cart-qty-value w-6 text-center text-sm font-medium">' + item.quantity + '</span>' +
              '<button type="button" class="cart-qty-plus w-7 h-7 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-sm" data-id="' + item.id + '" aria-label="Increase">+</button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="cart-drawer-remove self-start p-1.5 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium" data-id="' + item.id + '" aria-label="Remove">Remove</button>' +
        '</div>'
      );
    }).join('');

    container.querySelectorAll('.cart-qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        updateQuantity(this.getAttribute('data-id'), -1);
      });
    });
    container.querySelectorAll('.cart-qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        updateQuantity(this.getAttribute('data-id'), 1);
      });
    });
    container.querySelectorAll('.cart-drawer-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeItem(this.getAttribute('data-id'));
      });
    });
  }

  function renderCartPage() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    const cart = getCart();
    if (cart.length === 0) {
      container.innerHTML = '<p class="text-slate-500 text-center py-12">Your kit is empty. <a href="/#gear" class="text-emerald-600 font-medium hover:underline">Browse gear</a></p>';
      return;
    }
    const total = getSubtotal();
    container.innerHTML = cart
      .map(function (item) {
        return (
          '<div class="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white" data-cart-id="' + item.id + '">' +
            '<img src="' + (item.image || '') + '" alt="' + item.name + '" class="w-20 h-20 object-cover rounded-lg" />' +
            '<div class="flex-1 min-w-0">' +
              '<h3 class="font-semibold text-slate-800">' + item.name + '</h3>' +
              '<p class="text-emerald-600 font-bold">$' + item.price + ' × ' + item.quantity + '</p>' +
            '</div>' +
            '<button type="button" class="remove-from-cart self-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors" data-id="' + item.id + '">Remove</button>' +
          '</div>'
        );
      })
      .join('') +
      '<div class="mt-6 p-4 rounded-xl bg-slate-100 text-right"><strong class="text-lg">Total: $' + total + '</strong></div>';

    container.querySelectorAll('.remove-from-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeItem(this.getAttribute('data-id'));
        renderCartPage();
      });
    });
  }

  function initCart() {
    updateCartCount();
    renderCartDrawer();

    document.body.addEventListener('click', function (e) {
      var trigger = e.target.closest ? e.target.closest('.cart-drawer-trigger') : null;
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        openCart();
      }
    });

    var overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.addEventListener('click', closeCart);

    var closeBtn = document.getElementById('cart-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.add-to-cart-btn') : null;
      if (!btn) return;
      e.preventDefault();
      var id = btn.getAttribute('data-product-id');
      var name = btn.getAttribute('data-product-name');
      var price = parseInt(btn.getAttribute('data-product-price'), 10);
      var image = btn.getAttribute('data-product-image') || '';
      if (id && name && !isNaN(price)) addItem({ id: id, name: name, price: price, image: image });
    });

    var cartContainer = document.getElementById('cart-items');
    if (cartContainer) renderCartPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
  } else {
    initCart();
  }

  window.goLiveMobileKit = {
    getCart: getCart,
    setCart: setCart,
    addItem: addItem,
    removeItem: removeItem,
    updateQuantity: updateQuantity,
    getCartCount: getCartCount,
    getSubtotal: getSubtotal,
    updateCartCount: updateCartCount,
    openCart: openCart,
    closeCart: closeCart,
    renderCartDrawer: renderCartDrawer,
    renderCartPage: renderCartPage
  };
  window.fastshopCart = window.goLiveMobileKit;
})();
