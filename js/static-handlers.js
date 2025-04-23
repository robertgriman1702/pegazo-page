

import { addToCart } from './cart.js'; // Solo necesitamos addToCart aquí

// Función para manejar el clic en "Añadir al carrito" (la misma que en products.js)
function handleAddToCart(event) {
    const button = event.currentTarget;
    const product = {
        id: button.dataset.productId,
        titulo: button.dataset.productTitle,
        precio: parseFloat(button.dataset.productPrice),
        imagen: button.dataset.productImage
    };

    if (!product.id || !product.titulo || isNaN(product.precio)) {
        console.error('Datos incompletos del producto estático:', button.dataset);
        alert('No se pudo añadir el producto al carrito (datos faltantes).');
        return;
    }

    addToCart(product);
    // Feedback visual (opcional)
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-cart-plus"></i>';
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar TODOS los botones "add-to-cart-btn" que estén DENTRO
    // de la sección de combos estáticos (#products)
    const staticAddToCartButtons = document.querySelectorAll('#products .add-to-cart-btn');

    staticAddToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
});