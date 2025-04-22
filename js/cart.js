const CART_STORAGE_KEY = 'shoppingCartPegazo';

export function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    try {
        const cart = JSON.parse(cartJson);
        return Array.isArray(cart) ? cart : [];
    } catch (e) {
        console.error("Error al parsear carrito desde localStorage:", e);
        return [];
    }
}

export function addToCart(product) {
    if (!product || !product.id) {
        console.error("Intento de añadir producto inválido:", product);
        return;
    }
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].cantidad += 1;
    } else {
        cart.push({ ...product, cantidad: 1 });
    }
    saveCart(cart);
    updateCartCount();
}

export function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
}

export function updateQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const quantity = parseInt(newQuantity, 10);
        if (quantity > 0) {
            cart[itemIndex].cantidad = quantity;
        } else {
            cart.splice(itemIndex, 1);
        }
        saveCart(cart);
        updateCartCount();
    }
}

export function calculateTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = typeof item.precio === 'number' ? item.precio : 0;
        const quantity = typeof item.cantidad === 'number' ? item.cantidad : 0;
        return total + (price * quantity);
    }, 0);
}

export function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((count, item) => count + (item.cantidad || 0), 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Error al guardar carrito en localStorage:", e);
    }
}