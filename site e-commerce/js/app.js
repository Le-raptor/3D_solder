let cart = [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const stored = localStorage.getItem('cart');
    cart = stored ? JSON.parse(stored) : [];
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const span = document.getElementById('cart-count');
    if (span) span.textContent = count;
}

function updateCartDisplay() {
    const cartDiv = document.getElementById('cart');
    if (!cartDiv) return;
    if (cart.length === 0) {
        cartDiv.innerHTML = "<h2>Panier</h2><p>Votre panier est vide.</p>";
        return;
    }
    let html = "<h2>Panier</h2><ul>";
    let total = 0;
    cart.forEach((item, idx) => {
        html += `<li>
            ${item.name} (${item.qty}) - ${(item.price * item.qty).toFixed(2)} €
            <button onclick="removeFromCart(${idx})">Supprimer</button>
        </li>`;
        total += item.price * item.qty;
    });
    html += `</ul><p><strong>Total : ${total.toFixed(2)} €</strong></p>
        <button onclick="checkout()">Valider la commande</button>`;
    cartDiv.innerHTML = html;
    updateCartCount();
}

function addToCart(product) {
    const found = cart.find(item => item.id === product.id);
    if (found) {
        found.qty += 1;
    } else {
        cart.push({...product, qty: 1 });
    }
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

window.removeFromCart = function(idx) {
    cart.splice(idx, 1);
    saveCart();
    updateCartDisplay();
    updateCartCount();
};

window.checkout = function() {
    if (cart.length === 0) return;
    alert("Merci pour votre commande !");
    cart = [];
    saveCart();
    updateCartDisplay();
    updateCartCount();
};

loadCart();
updateCartDisplay();
updateCartCount();

fetch('../products/products.json')
    .then(response => response.json())
    .then(products => {
        const productsSection = document.getElementById('products');
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="../${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <div class="price">${product.price.toFixed(2)} €</div>
                <button>Ajouter au panier</button>
            `;
            card.querySelector('button').addEventListener('click', () => addToCart(product));
            productsSection.appendChild(card);
        });
    })
    .catch(error => {
        document.getElementById('products').innerHTML = "<p>Impossible de charger les produits.</p>";
        console.error(error);
    });

document.getElementById('order-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const orderDetails = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        // Ajoutez d'autres détails si nécessaire
    };
    // Envoyer les données à Formspree
    fetch(this.action, {
        method: 'POST',
        body: JSON.stringify(orderDetails),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Commande passée avec succès !');
            cart = [];
            saveCart();
            updateCartDisplay();
            updateCartCount();
        } else {
            alert('Erreur lors de la commande. Veuillez réessayer.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la commande. Veuillez réessayer.');
    });
});