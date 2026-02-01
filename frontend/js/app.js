// app.js - Frontend Controller

// Determine API_BASE dynamically based on current page location
const getApiBase = () => {
    const path = window.location.pathname;
    if (path.includes('/admin/') || path.includes('/customer/') || path.includes('/vendor/')) {
        return '../backend/';
    }
    return 'backend/';
};

const API_BASE = getApiBase();

// Helper to handle fetch
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(API_BASE + endpoint, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Network error occurred.' };
    }
}

// Auth Functions
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    const result = await apiCall('auth/login.php', 'POST', { email, password });
    
    if (result.success) {
        alert('Login Successful!');
        localStorage.setItem('user', JSON.stringify(result.user));
        if(result.user.role === 'admin') window.location.href = 'admin/dashboard.html';
        else if(result.user.role === 'vendor') window.location.href = 'vendor/dashboard.html';
        else window.location.href = 'index.html';
    } else {
        alert(result.message);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data['confirm-password'] && form.querySelector('input[name="confirm-password"]')) {
         if(data.password !== form.querySelector('input[name="confirm-password"]').value){
            alert("Passwords do not match!");
            return;
         }
    }

    const result = await apiCall('auth/register.php', 'POST', data);
    
    if (result.success) {
        alert('Registration Successful! Please login.');
        window.location.href = 'login.html';
    } else {
        alert(result.message);
    }
}

// Products Functions
async function loadProducts() {
    const container = document.querySelector('.grid.grid-3');
    if (!container) return;

    const result = await apiCall('api/products.php');
    
    if (result.success) {
        container.innerHTML = result.data.map(product => `
            <a href="product-detail.html?id=${product.id}" class="card product-card">
                <div class="product-image">
                    <img src="${product.image || 'placeholder.png'}" alt="${product.name}">
                </div>
                <div class="card-body product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-meta">${product.category} • ${product.stock_status}</p>
                    <p class="product-price">₹${product.price_daily}/day • ₹${product.price_hourly}/hr</p>
                </div>
            </a>
        `).join('');
        
        const countElem = document.querySelector('p[style*="color: var(--color-text-muted)"]');
        if(countElem) countElem.innerText = `Showing ${result.data.length} products`;
    }
}

async function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const result = await apiCall(`api/get_product_detail.php?id=${id}`);
    
    if (result.success) {
        const p = result.data;
        document.title = `${p.name} - RentPro`;
        
        // Update DOM elements
        const titleElems = document.querySelectorAll('h1, h2');
        document.querySelector('h1').innerText = p.name;
        document.querySelector('.product-meta').innerText = `${p.category} • ${p.stock_status}`;
        
        const priceContainer = document.querySelector('.product-meta').nextElementSibling.nextElementSibling;
        if(priceContainer) {
            priceContainer.innerHTML = `
             <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: var(--space-xs);">Rental Pricing</div>
            <div style="display: flex; gap: var(--space-lg); flex-wrap: wrap;">
              <span style="font-weight: 600;">₹${p.price_hourly}/hr</span>
              <span style="font-weight: 600;">₹${p.price_daily}/day</span>
            </div>
            `;
        }

        const img = document.querySelector('.card img');
        if(img) {
            img.src = p.image || 'placeholder.png';
            img.alt = p.name;
        }

        const desc = document.querySelector('.card-body p');
        if(desc) desc.innerText = p.description || 'No description available.';

        // Setup Add to Cart
        const form = document.getElementById('rental-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const period = document.getElementById('rental-period').value;
                const duration = document.getElementById('duration').value;
                addToCart(p, period, duration);
            };
            const btn = document.createElement('button');
            btn.type = 'submit';
            btn.className = 'btn btn-primary btn-lg';
            btn.style.width = '100%';
            btn.style.marginTop = 'var(--space-lg)';
            btn.innerText = 'Add to Cart';
            form.appendChild(btn);
        }
    }
}

// Cart Functions
function addToCart(product, period, duration) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    let price = 0;
    if (period === 'hourly') price = parseFloat(product.price_hourly) * duration;
    else if (period === 'daily') price = parseFloat(product.price_daily) * duration;
    else if (period === 'weekly') price = parseFloat(product.price_daily) * 7 * duration; 
    
    cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        period: period,
        duration: duration,
        price: price,
        quantity: 1
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const navLink = document.querySelector('a[href="cart.html"]');
    if (navLink) navLink.innerText = `Cart (${cart.length})`;
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Cart is empty</td></tr>';
        return;
    }

    tbody.innerHTML = cart.map((item, index) => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: var(--space-md);">
                    <img src="${item.image || 'placeholder.png'}" alt="" style="width: 50px; border-radius: var(--radius-sm);">
                    <div>
                        <strong>${item.name}</strong>
                    </div>
                </div>
            </td>
            <td>${item.duration} ${item.period}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.price}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="removeFromCart(${index})">Remove</button></td>
        </tr>
    `).join('');
    
    // Add checkout button to the summary area or somewhere
    const summaryCard = document.querySelector('.card.card-body[style*="position: sticky"]');
    if(summaryCard && !document.getElementById('checkout-btn')) {
        const total = cart.reduce((acc, item) => acc + item.price, 0);
        // Assuming there is a place or I append
        // Let's replace the content of summary card to be dynamic
        summaryCard.innerHTML = `
            <h3 style="margin-bottom: var(--space-lg);">Quotation Summary</h3>
            <div class="form-group">
                <label class="form-label">Total Amount</label>
                <div style="font-size: 1.5rem; font-weight: 600;">₹${total}</div>
            </div>
            <a href="checkout.html" id="checkout-btn" class="btn btn-primary" style="width: 100%;">Proceed to Checkout</a>
        `;
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartBadge();
}

async function loadPayment() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if(cart.length === 0) {
        alert('Cart is empty');
        window.location.href = 'products.html';
        return;
    }
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    const totalElem = document.querySelector('p[style*="Order Total"]');
    if(totalElem) totalElem.innerText = `Order Total: Rs ${total}`;
    
    const btn = document.querySelector('button[type="submit"]');
    if(btn) btn.innerText = `Pay Rs ${total}`;
}

async function handlePayment(event) {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if(!user) {
        alert('Please login to complete order.');
        window.location.href = 'login.html';
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    
    const data = {
        items: cart,
        total_amount: total
    };
    
    const result = await apiCall('api/orders.php', 'POST', data);
    
    if(result.success) {
        // Clear cart
        localStorage.removeItem('cart');
        // Redirect to confirmation
        window.location.href = `order-confirmation.html?id=${result.order_id}`;
    } else {
        alert(result.message);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    const loginForm = document.querySelector('form');
    // Simple check for login page
    if (document.location.pathname.includes('login.html') && loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    // Simple check for signup page
    if (document.location.pathname.includes('signup.html') && loginForm) {
        loginForm.addEventListener('submit', handleSignup);
    }

    if (document.location.pathname.includes('products.html')) {
        loadProducts();
    }

    if (document.location.pathname.includes('product-detail.html')) {
        loadProductDetail();
    }

    if (document.location.pathname.includes('cart.html')) {
        loadCart();
    }
    
    if (document.location.pathname.includes('checkout-payment.html')) {
        loadPayment();
        const paymentForm = document.querySelector('form');
        if(paymentForm) paymentForm.addEventListener('submit', handlePayment);
    }

    if (document.location.pathname.includes('order-confirmation.html')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if(id) {
            const orderIdElem = document.querySelector('p[style*="Order #"]');
            if(orderIdElem) orderIdElem.innerText = `Order #${id}`;
        }
    }

    // Check User Login Status for Navbar
    const user = JSON.parse(localStorage.getItem('user'));
    if(user) {
        const nav = document.querySelector('.nav');
        if(nav) {
            const loginBtn = nav.querySelector('a[href="login.html"]');
            const signupBtn = nav.querySelector('a[href="signup.html"]');
            if(loginBtn) loginBtn.remove();
            if(signupBtn) signupBtn.remove();
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'btn btn-secondary btn-sm';
            logoutLink.innerText = 'Logout (' + user.name.split(' ')[0] + ')';
            logoutLink.style.marginLeft = '10px';
            logoutLink.onclick = async (e) => {
                e.preventDefault();
                await apiCall('auth/logout.php');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            };
            nav.appendChild(logoutLink);
        }
    }
});
