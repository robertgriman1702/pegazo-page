import { getCart, removeFromCart, updateQuantity, calculateTotal, updateCartCount } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    updateCartCount();
});

window.displayCartItems = function() {
    const cart = getCart();
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutButton = document.querySelector('.checkout-button');
    const emptyCartMessage = document.querySelector('.cart-empty-message');

    cartItemsList.innerHTML = '';
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';

    if (cart.length === 0) {
        if (emptyCartMessage) {
             cartItemsList.appendChild(emptyCartMessage);
             emptyCartMessage.style.display = 'block';
        } else {
             cartItemsList.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
        }
        if (cartTotalPriceElement) cartTotalPriceElement.textContent = '$0.00';
        if (checkoutButton) checkoutButton.disabled = true;
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item', 'cart-row');
            itemElement.dataset.productId = item.id;

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

            const quantityInput = itemElement.querySelector('.quantity-input');
            const removeButton = itemElement.querySelector('.remove-item-btn');

            if (quantityInput) {
                quantityInput.addEventListener('change', (e) => {
                    const newQuantity = parseInt(e.target.value, 10);
                    const productId = e.target.dataset.productId;
                    updateQuantity(productId, newQuantity);
                    displayCartItems();
                });
                 quantityInput.addEventListener('input', (e) => {
                    if (parseInt(e.target.value, 10) < 1) {
                        e.target.value = '1';
                    }
                 });
            }

            if (removeButton) {
                removeButton.addEventListener('click', (e) => {
                    const productId = e.currentTarget.dataset.productId;
                    const productTitle = item.titulo || 'este producto';
                    if (confirm(`¿Seguro que quieres eliminar "${productTitle}" del carrito?`)) {
                         removeFromCart(productId);
                         displayCartItems();
                    }
                });
            }

            cartItemsList.appendChild(itemElement);
        });

        const total = calculateTotal();
        if (cartTotalPriceElement) cartTotalPriceElement.textContent = `$${total.toFixed(2)}`;
        if (checkoutButton) checkoutButton.disabled = false;
    }
}