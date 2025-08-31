let cart = [];

function loadCart() {
    const stored = localStorage.getItem('cart');
    cart = stored ? JSON.parse(stored) : [];
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const span = document.getElementById('cart-count');
    if (span) span.textContent = count;
}

function updateCartPage() {
    const cartDiv = document.getElementById('cart-page');
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
        <form id="order-form" style="margin-top:24px;">
            <h3>Valider la commande</h3>
            <input type="text" name="name" placeholder="Votre nom" required style="margin-bottom:10px;width:100%;padding:8px;border-radius:8px;border:1px solid #e3e8ee;"><br>
            <input type="email" name="email" placeholder="Votre email" required style="margin-bottom:10px;width:100%;padding:8px;border-radius:8px;border:1px solid #e3e8ee;"><br>
            <textarea name="address" placeholder="Votre adresse" required style="margin-bottom:10px;width:100%;padding:8px;border-radius:8px;border:1px solid #e3e8ee;"></textarea><br>
            <button type="submit" style="background:#1a8917;">Valider la commande</button>
        </form>
        <div id="order-message" style="margin-top:12px;"></div>`;
    cartDiv.innerHTML = html;

    // Gestion de la soumission du formulaire
    const form = document.getElementById('order-form');
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            // Ici tu peux envoyer les infos à un serveur ou par email (voir ci-dessous)
            cartDiv.innerHTML = "<h2>Merci pour votre commande !</h2><p>Nous avons bien reçu votre commande et vous contacterons rapidement.</p>";
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        };
    }
}

window.removeFromCart = function(idx) {
    cart.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPage();
    updateCartCount();
};

window.checkout = function() {
    if (cart.length === 0) return;
    alert("Merci pour votre commande !");
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPage();
    updateCartCount();
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('order-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Récupère les infos du formulaire
            const name = form.name.value;
            const email = form.email.value;
            const address = form.address.value;
            // Génère le texte du panier
            let panierTxt = cart.map(item =>
                `${item.name} x${item.qty} - ${(item.price * item.qty).toFixed(2)} €`
            ).join('\n');
            panierTxt += `\nTotal : ${cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)} €`;

            // Envoie avec EmailJS
            emailjs.send("service_u88n9re", "template_uz2mtjn", {
                    name: name,
                    email: email,
                    address: address,
                    panier: panierTxt
                })
                .then(function() {
                    document.getElementById('order-message').innerHTML = "<p style='color:green;'>Commande envoyée ! Merci 😊</p>";
                    cart = [];
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    updateCartPage();
                }, function(error) {
                    document.getElementById('order-message').innerHTML = "<p style='color:red;'>Erreur lors de l'envoi. Merci de réessayer.</p>";
                });
        });
    }
});

loadCart();
updateCartPage();
updateCartCount();