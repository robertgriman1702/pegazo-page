// --- Archivo: js/cart-page.js ---

// Importa las funciones necesarias del módulo principal del carrito
import { getCart, removeFromCart, updateQuantity, calculateTotal, updateCartCount } from './cart.js';

// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    displayCartItems(); // Muestra los items al cargar la página
    updateCartCount(); // Asegura que el contador del header esté actualizado
});

// Función principal para mostrar los items en la página del carrito
window.displayCartItems = function() { // Hacerla global o exportarla si cart.js la necesita
    const cart = getCart(); // Obtiene los datos actuales del carrito
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutButton = document.querySelector('.checkout-button');
    const emptyCartMessage = document.querySelector('.cart-empty-message');

    // Limpiar la lista actual (excepto el mensaje de vacío si existe)
    cartItemsList.innerHTML = ''; // Limpia cualquier item anterior
    if (emptyCartMessage) emptyCartMessage.style.display = 'none'; // Ocultar mensaje por defecto

    if (cart.length === 0) {
        // Mostrar mensaje de carrito vacío y deshabilitar checkout
        if (emptyCartMessage) {
             cartItemsList.appendChild(emptyCartMessage); // Volver a añadir el mensaje
             emptyCartMessage.style.display = 'block';
        } else {
             cartItemsList.innerHTML = '<p class="cart-empty-message" style="text-align: center; padding: 2rem 0; color: var(--text-light-secondary);">Tu carrito está vacío.</p>';
        }

        if (cartTotalPriceElement) cartTotalPriceElement.textContent = '$0.00';
        if (checkoutButton) checkoutButton.disabled = true;
    } else {
        // Hay items, construir la lista/tabla
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item', 'cart-row'); // Reutiliza cart-row para alinear
            itemElement.dataset.productId = item.id; // Guardar ID por si acaso

            // Validar datos del item
            const title = item.titulo || 'Producto Desconocido';
            const price = typeof item.precio === 'number' ? item.precio : 0;
            const quantity = typeof item.cantidad === 'number' ? item.cantidad : 1;
            const image = item.imagen || 'img/placeholder-product-default.jpg';
            const subtotal = (price * quantity).toFixed(2);

            itemElement.innerHTML = `
                <div class="cart-item-col item-img">
                    <img src="${image}" alt="${title}" loading="lazy">
                </div>
                <div class="cart-item-col item-details">
                    <span class="item-title">${title}</span>
                    <!-- Puedes añadir más detalles si los tienes (ej. ID) -->
                    <!-- <span class="item-id">ID: ${item.id}</span> -->
                </div>
                <div class="cart-item-col item-price">$${price.toFixed(2)}</div>
                <div class="cart-item-col item-quantity">
                    <input type="number" class="quantity-input" value="${quantity}" min="1" max="99" data-product-id="${item.id}" aria-label="Cantidad para ${title}">
                </div>
                <div class="cart-item-col item-total">$${subtotal}</div>
                <div class="cart-item-col item-remove">
                    <button class="remove-item-btn" data-product-id="${item.id}" aria-label="Eliminar ${title} del carrito">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            // Añadir Event Listeners para cantidad y eliminar
            const quantityInput = itemElement.querySelector('.quantity-input');
            const removeButton = itemElement.querySelector('.remove-item-btn');

            if (quantityInput) {
                quantityInput.addEventListener('change', (e) => {
                    const newQuantity = parseInt(e.target.value, 10);
                    const productId = e.target.dataset.productId;
                    updateQuantity(productId, newQuantity); // Llama a la función de cart.js
                    // displayCartItems(); // Se re-renderiza desde updateQuantity si está en cart.html
                });
                 // Evitar valores negativos o cero directamente
                 quantityInput.addEventListener('input', (e) => {
                    if (parseInt(e.target.value, 10) < 1) {
                        e.target.value = '1';
                    }
                 });
            }

            if (removeButton) {
                removeButton.addEventListener('click', (e) => {
                    const productId = e.currentTarget.dataset.productId;
                    if (confirm(`¿Seguro que quieres eliminar "${title}" del carrito?`)) {
                         removeFromCart(productId); // Llama a la función de cart.js
                         // displayCartItems(); // Se re-renderiza desde removeFromCart si está en cart.html
                    }
                });
            }

            cartItemsList.appendChild(itemElement); // Añadir el item a la lista en HTML
        });

        // Calcular y mostrar total
        const total = calculateTotal();
        if (cartTotalPriceElement) cartTotalPriceElement.textContent = `$${total.toFixed(2)}`;
        if (checkoutButton) checkoutButton.disabled = false; // Habilitar botón
    }
}