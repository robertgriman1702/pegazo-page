// --- Archivo: js/json-products.js ---

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); // Llama a la función para cargar productos
});

// Función asíncrona para cargar y mostrar productos desde JSON
async function loadProducts() {
    const gridContainer = document.getElementById('json-product-grid');
    const loadingMessage = gridContainer.querySelector('.loading-message'); // Selecciona el mensaje de carga

    // Verificar si el contenedor existe
    if (!gridContainer) {
        console.error("Error: Contenedor con ID 'json-product-grid' no encontrado.");
        return;
    }

    try {
        // 1. Obtener los datos del archivo JSON
        const response = await fetch('./datos_salida.json'); // Asegúrate que la ruta sea correcta

        // Verificar si la respuesta de la red fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        // 2. Convertir la respuesta a formato JSON
        const products = await response.json();

        // Ocultar mensaje de carga una vez que se tienen los datos (o si hay error)
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        // Verificar si obtuvimos un array
        if (!Array.isArray(products)) {
             throw new Error("El archivo JSON no contiene un array de productos válido.");
        }

        // Si no hay productos, mostrar un mensaje
        if (products.length === 0) {
            gridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--text-light-secondary);">No hay productos disponibles en este momento.</p>';
            return;
        }

        // 3. Limpiar el contenedor (por si acaso había algo, como el mensaje de carga)
        // gridContainer.innerHTML = ''; // Alternativa a ocultar el mensaje

        // 4. Recorrer el array de productos y crear las tarjetas HTML
        products.forEach(product => {
            // Crear el elemento principal de la tarjeta
            const productCard = document.createElement('div');
            productCard.classList.add('product-card'); // Reutiliza la clase CSS existente

            // Crear contenedor de imagen
            const cardImage = document.createElement('div');
            cardImage.classList.add('card-image');

            // Crear la imagen
            const productImage = document.createElement('img');
            productImage.src = product.imagen || 'img/placeholder-product-default.jpg'; // Usa placeholder si no hay imagen
            productImage.alt = product.titulo || 'Producto'; // Alt descriptivo
            productImage.loading = 'lazy'; // Carga diferida para imágenes

            cardImage.appendChild(productImage); // Añadir img al div de imagen

            // Crear contenedor de contenido
            const cardContent = document.createElement('div');
            cardContent.classList.add('card-content');

            // Crear el título
            const productTitle = document.createElement('h3');
            productTitle.classList.add('card-title');
            productTitle.textContent = product.titulo || 'Sin Título'; // Título o default

            // Crear el footer de la tarjeta
            const cardFooter = document.createElement('div');
            cardFooter.classList.add('card-footer');

            // Crear el precio
            const productPrice = document.createElement('span');
            productPrice.classList.add('card-price');
            // Formatear el precio (añade símbolo de dólar, ajusta decimales)
            const price = typeof product.precio === 'number' ? product.precio.toFixed(2) : 'N/A';
            productPrice.textContent = `$${price}`;

            // Crear el botón (opcional, pero bueno tenerlo)
            const addToCartBtn = document.createElement('button');
            addToCartBtn.classList.add('add-to-cart-btn');
            addToCartBtn.setAttribute('aria-label', `Añadir ${product.titulo || 'producto'} al carrito`);
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i>'; // Reutiliza el icono

            // Ensamblar el footer
            cardFooter.appendChild(productPrice);
            cardFooter.appendChild(addToCartBtn);

            // Ensamblar el contenido
            cardContent.appendChild(productTitle);
            cardContent.appendChild(cardFooter); // Añadir footer al final del contenido

            // Ensamblar la tarjeta completa
            productCard.appendChild(cardImage);
            productCard.appendChild(cardContent);

            // 5. Añadir la tarjeta creada al contenedor en el HTML
            gridContainer.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error al cargar o procesar los productos:", error);
        // Mostrar un mensaje de error más descriptivo en la página
        if (loadingMessage) loadingMessage.style.display = 'none'; // Ocultar carga si estaba visible
        gridContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: #ff4a4a;">Error al cargar productos: ${error.message}. Intenta recargar la página.</p>`;
    }
}