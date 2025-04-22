import { addToCart, updateCartCount } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
});

function handleAddToCart(event) {
    const button = event.currentTarget;
    const product = {
        id: button.dataset.productId,
        titulo: button.dataset.productTitle,
        precio: parseFloat(button.dataset.productPrice),
        imagen: button.dataset.productImage
    };

    if (!product.id || !product.titulo || isNaN(product.precio)) {
        console.error('Datos incompletos del producto en el botón:', button.dataset);
        alert('No se pudo añadir el producto al carrito (datos faltantes).');
        return;
    }

    addToCart(product);
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-cart-plus"></i>';
    }, 1000);
}


async function loadProducts() {
    const gridContainer = document.getElementById('json-product-grid');
    const loadingMessage = gridContainer?.querySelector('.loading-message');

    if (!gridContainer) {
        console.error("Error: Contenedor 'json-product-grid' no encontrado.");
        return;
    }

    try {
        const response = await fetch('./datos_salida.json');

        if (!response.ok) {
             throw new Error(`Error HTTP: ${response.status}`);
        }
        const products = await response.json();

        if (loadingMessage) loadingMessage.style.display = 'none';

        if (!Array.isArray(products)) {
             throw new Error("JSON no es un array válido.");
        }
        if (products.length === 0) {
            gridContainer.innerHTML = '<p class="empty-message">No hay productos disponibles.</p>';
            return;
        }

        products.forEach(product => {
            if (!product.id || !product.titulo || typeof product.precio !== 'number') {
                console.warn('Producto omitido por datos inválidos:', product);
                return;
            }

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const cardImage = document.createElement('div');
            cardImage.classList.add('card-image');
            const productImage = document.createElement('img');
            productImage.src = product.imagen || 'img/placeholder-product-default.jpg';
            productImage.alt = product.titulo;
            productImage.loading = 'lazy';
            cardImage.appendChild(productImage);

            const cardContent = document.createElement('div');
            cardContent.classList.add('card-content');
            const productTitle = document.createElement('h3');
            productTitle.classList.add('card-title');
            productTitle.textContent = product.titulo;

            const cardFooter = document.createElement('div');
            cardFooter.classList.add('card-footer');
            const productPrice = document.createElement('span');
            productPrice.classList.add('card-price');
            productPrice.textContent = `$${product.precio.toFixed(2)}`;

            const addToCartBtn = document.createElement('button');
            addToCartBtn.classList.add('add-to-cart-btn');
            addToCartBtn.setAttribute('aria-label', `Añadir ${product.titulo} al carrito`);
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i>';

            addToCartBtn.dataset.productId = product.id;
            addToCartBtn.dataset.productTitle = product.titulo;
            addToCartBtn.dataset.productPrice = product.precio;
            addToCartBtn.dataset.productImage = product.imagen || '';

            addToCartBtn.addEventListener('click', handleAddToCart);

            cardFooter.appendChild(productPrice);
            cardFooter.appendChild(addToCartBtn);
            cardContent.appendChild(productTitle);
            cardContent.appendChild(cardFooter);
            productCard.appendChild(cardImage);
            productCard.appendChild(cardContent);
            gridContainer.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
        if (loadingMessage) loadingMessage.style.display = 'none';
        gridContainer.innerHTML = `<p class="error-message">Error al cargar productos: ${error.message}</p>`;
    }
}