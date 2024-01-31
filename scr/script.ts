interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
}

interface CartItem {
  id: number;
  qty: number;
}

interface Selectors {
  products: Element | null;
  cartBtn: Element | null;
  cartQty: Element | null;
  cartClose: Element | null;
  cart: Element | null;
  cartOverlay: Element | null;
  cartClear: Element | null;
  cartBody: Element | null;
  cartTotal: Element | null;
}

let products: Product[] = [];
let cart: CartItem[] = [];

const selectors: Selectors = {
  products: document.querySelector(".products"),
  cartBtn: document.querySelector(".cart-btn"),
  cartQty: document.querySelector(".cart-qty"),
  cartClose: document.querySelector(".cart-close"),
  cart: document.querySelector(".cart"),
  cartOverlay: document.querySelector(".cart-overlay"),
  cartClear: document.querySelector(".cart-clear"),
  cartBody: document.querySelector(".cart-body"),
  cartTotal: document.querySelector(".cart-total"),
};

const setupListeners = (): void => {
  document.addEventListener("DOMContentLoaded", initStore);

  selectors.products?.addEventListener("click", addToCart);

  selectors.cartBtn?.addEventListener("click", showCart);
  selectors.cartOverlay?.addEventListener("click", hideCart);
  selectors.cartClose?.addEventListener("click", hideCart);
  selectors.cartBody?.addEventListener("click", updateCart);
  selectors.cartClear?.addEventListener("click", clearCart);
};

const initStore = (): void => {
  loadCart();
  loadProducts("https://fakestoreapi.com/products")
    .then(renderProducts)
    .finally(renderCart);
};

const showCart = (): void => {
  selectors.cart?.classList.add("show");
  selectors.cartOverlay?.classList.add("show");
};

const hideCart = (): void => {
  selectors.cart?.classList.remove("show");
  selectors.cartOverlay?.classList.remove("show");
};

const clearCart = (): void => {
  cart = [];
  saveCart();
  renderCart();
  renderProducts();
  setTimeout(hideCart, 500);
};

const addToCart = (e: MouseEvent): void => {
  if (e.target instanceof HTMLElement && e.target.hasAttribute("data-id")) {
    const id = parseInt(e.target.dataset.id);
    const inCart = cart.find((x) => x.id === id);

    if (inCart) {
      alert("Item is already in the cart.");
      return;
    }

    cart.push({ id, qty: 1 });
    saveCart();
    renderProducts();
    renderCart();
    showCart();
  }
};

const removeFromCart = (id: number): void => {
  cart = cart.filter((x) => x.id !== id);

  cart.length === 0 && setTimeout(hideCart, 500);

  renderProducts();
};

const increaseQty = (id: number): void => {
  const item = cart.find((x) => x.id === id);
  if (!item) return;

  item.qty++;
};

const decreaseQty = (id: number): void => {
  const item = cart.find((x) => x.id === id);
  if (!item) return;

  item.qty--;

  if (item.qty === 0) removeFromCart(id);
};

const updateCart = (e: MouseEvent): void => {
  if (e.target instanceof HTMLElement && e.target.hasAttribute("data-btn")) {
    const cartItem = e.target.closest(".cart-item");
    const id = parseInt(cartItem?.dataset.id || "");
    const btn = e.target.dataset.btn;

    btn === "incr" && increaseQty(id);
    btn === "decr" && decreaseQty(id);

    saveCart();
    renderCart();
  }
};

const saveCart = (): void => {
  localStorage.setItem("online-store", JSON.stringify(cart));
};

const loadCart = (): void => {
  cart = JSON.parse(localStorage.getItem("online-store") || "[]");
};

const renderCart = (): void => {
  const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  if (selectors.cartQty) {
    selectors.cartQty.textContent = cartQty.toString();
    selectors.cartQty.classList.toggle("visible", cartQty > 0);
  }

  if (selectors.cartTotal) {
    selectors.cartTotal.textContent = calculateTotal().format();
  }

  if (selectors.cartBody) {
    if (cart.length === 0) {
      selectors.cartBody.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
      return;
    }

    selectors.cartBody.innerHTML = cart
      .map(({ id, qty }) => {
        const product = products.find((x) => x.id === id);

        if (!product) return "";

        const { title, image, price } = product;

        const amount = price * qty;

        return `
          <div class="cart-item" data-id="${id}">
            <img src="${image}" alt="${title}" />
            <div class="cart-item-detail">
              <h3>${title}</h3>
              <h5>${price.format()}</h5>
              <div class="cart-item-amount">
                <i class="bi bi-dash-lg" data-btn="decr"></i>
                <span class="qty">${qty}</span>
                <i class="bi bi-plus-lg" data-btn="incr"></i>
                <span class="cart-item-price">${amount.format()}</span>
              </div>
            </div>
          </div>`;
      })
      .join("");
  }
};

const renderProducts = (): void => {
  if (selectors.products) {
    selectors.products.innerHTML = products
      .map((product) => {
        const { id, title, image, price } = product;
        const inCart = cart.find((x) => x.id === id);
        const disabled = inCart ? "disabled" : "";
        const text = inCart ? "Added in Cart" : "Add to Cart";

        return `
      <div class="product">
        <img src="${image}" alt="${title}" />
        <h3>${title}</h3>
        <h5>${price.format()}</h5>
        <button ${disabled} data-id=${id}>${text}</button>
      </div>`;
      })
      .join("");
  }
};

const loadProducts = async (apiURL: string): Promise<void> => {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status=${response.status}`);
    }
    products = await response.json();
    console.log(products);
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

const calculateTotal = (): number => {
  return cart
    .map(({ id, qty }) => {
      const { price } = products.find((x) => x.id === id) || { price: 0 };
      return qty * price;
    })
    .reduce((sum, number) => sum + number, 0);
};

Number.prototype.format = function (): string {
  return this.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

setupListeners();
