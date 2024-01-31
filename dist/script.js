"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let products = [];
let cart = [];
const selectors = {
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
const setupListeners = () => {
    var _a, _b, _c, _d, _e, _f;
    document.addEventListener("DOMContentLoaded", initStore);
    (_a = selectors.products) === null || _a === void 0 ? void 0 : _a.addEventListener("click", addToCart);
    (_b = selectors.cartBtn) === null || _b === void 0 ? void 0 : _b.addEventListener("click", showCart);
    (_c = selectors.cartOverlay) === null || _c === void 0 ? void 0 : _c.addEventListener("click", hideCart);
    (_d = selectors.cartClose) === null || _d === void 0 ? void 0 : _d.addEventListener("click", hideCart);
    (_e = selectors.cartBody) === null || _e === void 0 ? void 0 : _e.addEventListener("click", updateCart);
    (_f = selectors.cartClear) === null || _f === void 0 ? void 0 : _f.addEventListener("click", clearCart);
};
const initStore = () => {
    loadCart();
    loadProducts("https://fakestoreapi.com/products")
        .then(renderProducts)
        .finally(renderCart);
};
const showCart = () => {
    var _a, _b;
    (_a = selectors.cart) === null || _a === void 0 ? void 0 : _a.classList.add("show");
    (_b = selectors.cartOverlay) === null || _b === void 0 ? void 0 : _b.classList.add("show");
};
const hideCart = () => {
    var _a, _b;
    (_a = selectors.cart) === null || _a === void 0 ? void 0 : _a.classList.remove("show");
    (_b = selectors.cartOverlay) === null || _b === void 0 ? void 0 : _b.classList.remove("show");
};
const clearCart = () => {
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
    setTimeout(hideCart, 500);
};
const addToCart = (e) => {
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
const removeFromCart = (id) => {
    cart = cart.filter((x) => x.id !== id);
    cart.length === 0 && setTimeout(hideCart, 500);
    renderProducts();
};
const increaseQty = (id) => {
    const item = cart.find((x) => x.id === id);
    if (!item)
        return;
    item.qty++;
};
const decreaseQty = (id) => {
    const item = cart.find((x) => x.id === id);
    if (!item)
        return;
    item.qty--;
    if (item.qty === 0)
        removeFromCart(id);
};
const updateCart = (e) => {
    if (e.target instanceof HTMLElement && e.target.hasAttribute("data-btn")) {
        const cartItem = e.target.closest(".cart-item");
        const id = parseInt((cartItem === null || cartItem === void 0 ? void 0 : cartItem.dataset.id) || "");
        const btn = e.target.dataset.btn;
        btn === "incr" && increaseQty(id);
        btn === "decr" && decreaseQty(id);
        saveCart();
        renderCart();
    }
};
const saveCart = () => {
    localStorage.setItem("online-store", JSON.stringify(cart));
};
const loadCart = () => {
    cart = JSON.parse(localStorage.getItem("online-store") || "[]");
};
const renderCart = () => {
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
            if (!product)
                return "";
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
const renderProducts = () => {
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
const loadProducts = (apiURL) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(apiURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status=${response.status}`);
        }
        products = yield response.json();
        console.log(products);
    }
    catch (error) {
        console.error("Fetch error:", error);
    }
});
const calculateTotal = () => {
    return cart
        .map(({ id, qty }) => {
        const { price } = products.find((x) => x.id === id) || { price: 0 };
        return qty * price;
    })
        .reduce((sum, number) => sum + number, 0);
};
Number.prototype.format = function () {
    return this.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
};
setupListeners();
