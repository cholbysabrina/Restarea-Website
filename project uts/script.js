// Data keranjang
let cart = [];
let orderCounter = localStorage.getItem('orderCounter') || 1;

// Elemen DOM
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const cartButton = document.getElementById('cartButton');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const receiptModal = document.getElementById('receiptModal');

// Navigasi menu kategori
    document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-pills .nav-link');
    const sections = document.querySelectorAll('.section-kategori');
    const mainContent = document.querySelector('main');
    const aboutSection = document.querySelector('.about');
    const gallerySection = document.querySelector('.gallery');
    const contactSection = document.querySelector('.contact');
    
    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        if (sectionId === 'all') {
            mainContent.style.display = 'block';
            aboutSection.style.display = 'block';
            gallerySection.style.display = 'block';
            contactSection.style.display = 'block';
        } else {
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            mainContent.style.display = 'none';
            aboutSection.style.display = 'none';
            gallerySection.style.display = 'none';
            contactSection.style.display = 'none';
        }
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            showSection(filter);
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
    
//  keranjang
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const menuItem = this.closest('.menu-item');
            const itemName = menuItem.querySelector('h3').textContent;
            const itemPriceText = menuItem.querySelector('.item-price').textContent;
            const itemPrice = parseInt(itemPriceText.replace(/\D/g, ''));
            const itemImage = menuItem.querySelector('img').src;
            
            addToCart({
                name: itemName,
                price: itemPrice,
                image: itemImage
            });
            showNotification('Item ditambahkan ke keranjang!');
        });
    });

// Tombol keranjang
    document.querySelector('.close-cart').addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', openCheckoutModal);
    document.getElementById('confirmOrder').addEventListener('click', processOrder);
    document.getElementById('cancelOrder').addEventListener('click', closeCheckoutModal);
    document.querySelector('.close-modal').addEventListener('click', closeCheckoutModal);
    document.getElementById('closeReceipt').addEventListener('click', closeReceiptModal);
    showSection('all');
});

// Fungsi keranjang
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1,
            id: Date.now()
        });
    }
    
    updateCartDisplay();
    toggleCart();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Keranjang kosong</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            const totalPrice = item.price * item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rp ${totalPrice.toLocaleString('id-ID')}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button style="margin-left: 10px; color: red; border: none; background: none; cursor: pointer;" onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
            `;
            cartItems.appendChild(cartItemElement);
        });
    }
    
// Update total dan count
    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Tombol
function toggleCart() {
    cartSidebar.classList.toggle('active');
}

function openCheckoutModal() {
    if (cart.length === 0) return;
    
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    let itemsHTML = '';
    const total = cart.reduce((sum, item) => {
        itemsHTML += `<div>${item.name} x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>`;
        return sum + (item.price * item.quantity);
    }, 0);
    
    checkoutItems.innerHTML = itemsHTML;
    checkoutTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    
    checkoutModal.style.display = 'flex';
    toggleCart();
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
    document.getElementById('checkoutForm').reset();
}

function closeReceiptModal() {
    receiptModal.style.display = 'none';
}

// Proses pesanan
    function processOrder() {
    const tableNumber = document.getElementById('tableNumber').value;
    const customerName = document.getElementById('customerName').value || 'Tamu';
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!tableNumber) {
        alert('Harap masukkan nomor meja!');
        return;
    }
    
// Order number
    const orderNumber = `ORD-${orderCounter.toString().padStart(4, '0')}`;
    orderCounter++;
    localStorage.setItem('orderCounter', orderCounter);
    
// Hitung total
    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
// Tampilkan struk
    showReceipt(orderNumber, tableNumber, customerName, paymentMethod, total);
    
// Reset keranjang
    cart = [];
    updateCartDisplay();
    closeCheckoutModal();
}

function showReceipt(orderNumber, tableNumber, customerName, paymentMethod, total) {
    const receiptDetails = document.getElementById('receiptDetails');
    
    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `<div>${item.name} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>`;
    });
    
    receiptDetails.innerHTML = `
        <div class="order-number">No. Pesanan: ${orderNumber}</div>
        <div>Meja: ${tableNumber}</div>
        <div>Nama: ${customerName}</div>
        <div>Metode Bayar: ${paymentMethod.toUpperCase()}</div>
        <hr>
        <div><strong>Detail Pesanan:</strong></div>
        ${itemsHTML}
        <hr>
        <div><strong>Total: Rp ${total.toLocaleString('id-ID')}</strong></div>
        <br>
        <div>Pesanan akan segera diproses. Terima kasih!</div>
    `;
    
    receiptModal.style.display = 'flex';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}