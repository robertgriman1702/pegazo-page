// --- Archivo: js/cart.js ---

const CART_STORAGE_KEY = 'shoppingCartPegazo'; // Clave única para localStorage

// --- Funciones Principales (Exportadas) ---

/**
 * Obtiene el carrito actual desde localStorage.
 * @returns {Array} Array de objetos del carrito (item: {id, titulo, precio, imagen, cantidad})
 */
export function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    try {
        // Si existe y es un array válido, lo devuelve; si no, devuelve array vacío.
        const cart = JSON.parse(cartJson);
        return Array.isArray(cart) ? cart : [];
    } catch (e) {
        // Si hay error al parsear (JSON corrupto), devuelve array vacío
        console.error("Error al parsear carrito desde localStorage:", e);
        return [];
    }
}

/**
 * Añade un producto al carrito o incrementa su cantidad.
 * @param {object} product - Objeto del producto a añadir {id, titulo, precio, imagen}
 */
export function addToCart(product) {
    if (!product || !product.id) {
        console.error("Intento de añadir producto inválido:", product);
        return;
    }

    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Producto ya existe, incrementar cantidad
        cart[existingItemIndex].cantidad += 1;
        console.log(`Cantidad incrementada para: ${product.titulo}`);
    } else {
        // Producto nuevo, añadir con cantidad 1
        cart.push({ ...product, cantidad: 1 });
        console.log(`Producto añadido: ${product.titulo}`);
    }

    saveCart(cart); // Guardar el carrito actualizado
    updateCartCount(); // Actualizar el icono del contador
}

/**
 * Elimina un producto completamente del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
export function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId); // Filtra el item a eliminar
    saveCart(cart);
    updateCartCount();
    console.log(`Producto eliminado: ${productId}`);
     // Si estamos en la página del carrito, la volvemos a renderizar
     if (typeof displayCartItems === 'function') { // Verifica si la función existe en el contexto actual
        displayCartItems();
     }
}

/**
 * Actualiza la cantidad de un producto específico en el carrito.
 * Si la cantidad es 0 o menor, elimina el producto.
 * @param {string} productId - ID del producto.
 * @param {number} newQuantity - La nueva cantidad deseada.
 */
export function updateQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        const quantity = parseInt(newQuantity, 10); // Asegurar que es número entero
        if (quantity > 0) {
            cart[itemIndex].cantidad = quantity;
            console.log(`Cantidad actualizada para ${productId}: ${quantity}`);
        } else {
            // Si la cantidad es 0 o inválida, eliminar el item
            cart.splice(itemIndex, 1);
            console.log(`Producto eliminado por cantidad cero: ${productId}`);
        }
        saveCart(cart);
        updateCartCount();
        // Si estamos en la página del carrito, la volvemos a renderizar
        if (typeof displayCartItems === 'function') {
             displayCartItems();
        }
    }
}


/**
 * Calcula el precio total del carrito.
 * @returns {number} El precio total.
 */
export function calculateTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        // Asegurarse que precio y cantidad son números válidos
        const price = typeof item.precio === 'number' ? item.precio : 0;
        const quantity = typeof item.cantidad === 'number' ? item.cantidad : 0;
        return total + (price * quantity);
    }, 0); // Iniciar total en 0
}

/**
 * Actualiza el número que se muestra en el icono del carrito en el header.
 */
export function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((count, item) => count + (item.cantidad || 0), 0);
    const cartCountElement = document.querySelector('.cart-count'); // Selector del span en el header

    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none'; // Mostrar/ocultar
    }
}

// --- Funciones Internas (No exportadas) ---

/**
 * Guarda el estado actual del carrito en localStorage.
 * @param {Array} cart - El array del carrito a guardar.
 */
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Error al guardar carrito en localStorage:", e);
        // Considerar mostrar un mensaje al usuario si el almacenamiento falla
    }
}

// Inicializar el contador del carrito al cargar este script por primera vez
// Se llamará de nuevo desde otros scripts cuando sea necesario (DOMContentLoaded)
updateCartCount();