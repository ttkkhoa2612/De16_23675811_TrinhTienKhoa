/**
 * KidZone - Main JavaScript File
 * Features:
 * - jQuery countdown timer
 * - User authentication with localStorage
 * - Product management
 * - Form validations
 * - Interactive UI components
 */

$(document).ready(function() {
    "use strict";
    
    // ------------------------------------------------
    // DATABASE SIMULATION USING LOCALSTORAGE
    // ------------------------------------------------
    const DB = {
        // User management
        users: {
            // Get all users
            getAll: function() {
                return JSON.parse(localStorage.getItem('kidzone_users')) || [];
            },
            
            // Save user list
            saveAll: function(users) {
                localStorage.setItem('kidzone_users', JSON.stringify(users));
            },
            
            // Add new user
            add: function(user) {
                const users = this.getAll();
                // Check if email already exists
                if (users.some(u => u.email === user.email)) {
                    return { success: false, message: 'Email đã được sử dụng' };
                }
                users.push(user);
                this.saveAll(users);
                return { success: true };
            },
            
            // Check login credentials
            authenticate: function(email, password) {
                const users = this.getAll();
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    // Save current user to session
                    sessionStorage.setItem('kidzone_current_user', JSON.stringify({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        isLoggedIn: true
                    }));
                    return { success: true, user: user };
                }
                return { success: false, message: 'Email hoặc mật khẩu không đúng' };
            },
            
            // Get current logged in user
            getCurrentUser: function() {
                return JSON.parse(sessionStorage.getItem('kidzone_current_user')) || { isLoggedIn: false };
            },
            
            // Logout current user
            logout: function() {
                sessionStorage.removeItem('kidzone_current_user');
            }
        },
        
        // Cart management
        cart: {
            // Get cart items
            getItems: function() {
                return JSON.parse(localStorage.getItem('kidzone_cart')) || [];
            },
            
            // Save cart items
            saveItems: function(items) {
                localStorage.setItem('kidzone_cart', JSON.stringify(items));
            },
            
            // Add item to cart
            addItem: function(item) {
                const cartItems = this.getItems();
                // Check if item already exists in cart
                const existingItem = cartItems.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.quantity += item.quantity || 1;
                } else {
                    cartItems.push(item);
                }
                this.saveItems(cartItems);
                return cartItems.length;
            },
            
            // Remove item from cart
            removeItem: function(itemId) {
                let cartItems = this.getItems();
                cartItems = cartItems.filter(item => item.id !== itemId);
                this.saveItems(cartItems);
                return cartItems.length;
            },
            
            // Update item quantity
            updateQuantity: function(itemId, quantity) {
                const cartItems = this.getItems();
                const item = cartItems.find(i => i.id === itemId);
                if (item) {
                    item.quantity = quantity;
                    this.saveItems(cartItems);
                }
            },
            
            // Get total items count
            getTotalCount: function() {
                const cartItems = this.getItems();
                return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
            },
            
            // Get total price
            getTotalPrice: function() {
                const cartItems = this.getItems();
                return cartItems.reduce((total, item) => {
                    const price = parseFloat(item.price.replace(/[^\d]/g, ''));
                    return total + price * (item.quantity || 1);
                }, 0);
            },
            
            // Clear cart
            clear: function() {
                localStorage.removeItem('kidzone_cart');
            }
        },
        
        // Order management
        orders: {
            // Get all orders
            getAll: function() {
                return JSON.parse(localStorage.getItem('kidzone_orders')) || [];
            },
            
            // Save all orders
            saveAll: function(orders) {
                localStorage.setItem('kidzone_orders', JSON.stringify(orders));
            },
            
            // Add new order
            add: function(order) {
                const orders = this.getAll();
                // Generate order number KZ + 5 random digits
                order.orderNumber = 'KZ' + Math.floor(10000 + Math.random() * 90000);
                order.date = new Date().toISOString();
                order.status = 'Đang xử lý';
                orders.push(order);
                this.saveAll(orders);
                return order.orderNumber;
            },
            
            // Get order by order number
            getByOrderNumber: function(orderNumber) {
                const orders = this.getAll();
                return orders.find(o => o.orderNumber === orderNumber);
            }
        }
    };
    
    // Check if user is logged in on page load
    function checkLoginStatus() {
        const currentUser = DB.users.getCurrentUser();
        
        if (currentUser.isLoggedIn) {
            // Update UI for logged in user
            $('.account-dropdown .dropdown-menu').html(`
                <h5 class="dropdown-header">Xin chào, ${currentUser.name}</h5>
                <a class="dropdown-item" href="profile.html">Thông tin tài khoản</a>
                <a class="dropdown-item" href="orders.html">Đơn hàng của tôi</a>
                <a class="dropdown-item" href="wishlist.html">Sản phẩm yêu thích</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" id="logoutLink">Đăng xuất</a>
            `);
        }
    }
    
    // Call check login status on page load
    checkLoginStatus();
    
    // Handle logout
    $(document).on('click', '#logoutLink', function(e) {
        e.preventDefault();
        DB.users.logout();
        showNotification('Đăng xuất thành công!', 'success');
        
        // Reset dropdown to default
        $('.account-dropdown .dropdown-menu').html(`
            <h5 class="dropdown-header">Tài khoản</h5>
            <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Đăng nhập</a>
            <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">Đăng ký</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#">Đơn hàng của tôi</a>
            <a class="dropdown-item" href="#">Sản phẩm yêu thích</a>
        `);
    });
    
    // Update cart count on page load
    function updateCartCount() {
        const cartCount = DB.cart.getTotalCount();
        $('.cart-count').text(cartCount);
    }
    
    // Call update cart count on page load
    updateCartCount();
    
    // ------------------------------------------------
    // JQUERY COUNTDOWN FUNCTIONALITY
    // ------------------------------------------------
    function initCountdown() {
        // Countdown function
        function updateCountdown() {
            $('[data-countdown]').each(function() {
                const $this = $(this);
                const finalDate = new Date($this.data('countdown'));
                const now = new Date();
                
                const diff = finalDate - now;
                if (diff < 0) {
                    // If countdown is expired
                    $this.html('<div class="countdown-item"><span class="days">00</span><span class="label">Ngày</span></div>' +
                              '<div class="countdown-item"><span class="hours">00</span><span class="label">Giờ</span></div>' +
                              '<div class="countdown-item"><span class="minutes">00</span><span class="label">Phút</span></div>' +
                              '<div class="countdown-item"><span class="seconds">00</span><span class="label">Giây</span></div>');
                    return;
                }
                
                // Calculate time units
                let days = Math.floor(diff / (1000 * 60 * 60 * 24));
                let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                // Format numbers with leading zeros
                days = (days < 10) ? "0" + days : days;
                hours = (hours < 10) ? "0" + hours : hours;
                minutes = (minutes < 10) ? "0" + minutes : minutes;
                seconds = (seconds < 10) ? "0" + seconds : seconds;
                
                // Update HTML with the calculated values
                $this.html('<div class="countdown-item"><span class="days">' + days + '</span><span class="label">Ngày</span></div>' +
                          '<div class="countdown-item"><span class="hours">' + hours + '</span><span class="label">Giờ</span></div>' +
                          '<div class="countdown-item"><span class="minutes">' + minutes + '</span><span class="label">Phút</span></div>' +
                          '<div class="countdown-item"><span class="seconds">' + seconds + '</span><span class="label">Giây</span></div>');
            });
        }
        
        // Initialize countdown if countdown elements exist
        if ($('[data-countdown]').length > 0) {
            // Run immediately once
            updateCountdown();
            // Then set interval to update every second
            setInterval(updateCountdown, 1000);
        }
    }
    
    // Initialize countdown
    initCountdown();
    
    // Helper function to add new countdown
    function addNewCountdown(targetDate, containerId) {
        // Create countdown element
        const countdownEl = $('<div class="countdown" data-countdown="' + targetDate + '"></div>');
        // Add to container
        $('#' + containerId).append(countdownEl);
        // Initialize countdown
        initCountdown();
    }
    
    // Example: Add a future promotion countdown
    // Usage: addNewCountdown('2025/12/31 23:59:59', 'promotionContainer');
    
    // ------------------------------------------------
    // INITIALIZE LIBRARIES AND PLUGINS
    // ------------------------------------------------
    
    // Initialize AOS Animation
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }
    
    // Initialize Owl Carousel for Hero Slider
    if ($('.hero-carousel').length) {
        $('.hero-carousel').owlCarousel({
            items: 1,
            loop: true,
            margin: 0,
            nav: false,
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            animateOut: 'fadeOut',
            smartSpeed: 1000
        });
    }
    
    // Initialize Brands Carousel
    if ($('.brands-carousel').length) {
        $('.brands-carousel').owlCarousel({
            loop: true,
            margin: 30,
            nav: false,
            dots: false,
            autoplay: true,
            autoplayTimeout: 3000,
            responsive: {
                0: { items: 2 },
                576: { items: 3 },
                768: { items: 4 },
                992: { items: 5 }
            }
        });
    }
    
    // Initialize Testimonial Carousel
    if ($('.testimonial-carousel').length) {
        $('.testimonial-carousel').owlCarousel({
            loop: true,
            margin: 20,
            nav: false,
            dots: true,
            autoplay: true,
            autoplayTimeout: 4000,
            responsive: {
                0: { items: 1 },
                768: { items: 2 },
                992: { items: 3 }
            }
        });
    }
    
    // ------------------------------------------------
    // UI INTERACTIVE FEATURES
    // ------------------------------------------------
    
    // Search suggestions functionality
    $('#searchInput').on('focus', function() {
        $('.trending-search-results').fadeIn(200);
    });
    
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-box').length) {
            $('.trending-search-results').fadeOut(200);
        }
    });
    
    // Mobile search form
    $('#mobileSearchBtn').on('click', function() {
        $('#mobileSearchForm').collapse('toggle');
    });
    
    // Sticky header
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 100) {
            $('.main-header').addClass('sticky-header');
        } else {
            $('.main-header').removeClass('sticky-header');
        }
    });
    
    // Back to top button
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').addClass('active');
        } else {
            $('.back-to-top').removeClass('active');
        }
    });
    
    $('.back-to-top').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 800);
    });
    
    // Smooth scrolling for internal links
    $('a.nav-link, .hero-buttons a').on('click', function(e) {
        if (this.hash !== "") {
            e.preventDefault();
            const hash = this.hash;
            
            $('html, body').animate({
                scrollTop: $(hash).offset().top - 90
            }, 800);
            
            if ($('.navbar-collapse').hasClass('show')) {
                $('.navbar-toggler').click();
            }
        }
    });
    
    // ------------------------------------------------
    // PRODUCT MANAGEMENT
    // ------------------------------------------------
    
    // Product quantity controls
    $(document).on('click', '#decreaseQty', function() {
        var input = $('#inputSoLuong');
        var value = parseInt(input.val());
        if (value > 1) {
            input.val(value - 1);
        }
    });
    
    $(document).on('click', '#increaseQty', function() {
        var input = $('#inputSoLuong');
        var value = parseInt(input.val());
        input.val(value + 1);
    });
    
    $(document).on('click', '#decreaseQtyModal', function() {
        var input = $('#quantityModal');
        var value = parseInt(input.val());
        if (value > 1) {
            input.val(value - 1);
        }
    });
    
    $(document).on('click', '#increaseQtyModal', function() {
        var input = $('#quantityModal');
        var value = parseInt(input.val());
        input.val(value + 1);
    });
    
    // Add to cart functionality
    $('.add-to-cart').on('click', function(e) {
        e.preventDefault();
        
        let productCard;
        if ($(this).closest('.product-card').length) {
            productCard = $(this).closest('.product-card');
        } else if ($(this).closest('#quickViewModal').length) {
            productCard = $('#quickViewModal');
        }
        
        const productId = productCard.data('id') || 'product-' + Math.floor(Math.random() * 10000);
        const productName = productCard.find('.product-title').text() || productCard.find('#quickViewTitle').text() || 'Sản phẩm';
        const productPrice = productCard.find('.new-price').text() || productCard.find('#quickViewPrice').text() || '0₫';
        const productImage = productCard.find('.product-thumb img').attr('src') || productCard.find('#quickViewImage').attr('src') || '';
        const quantity = parseInt(productCard.find('input[type="number"]').val() || 1);
        
        // Add item to cart database
        const cartCount = DB.cart.addItem({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
        
        // Update cart count in UI
        $('.cart-count').text(cartCount);
        
        // Update cart dropdown with new item
        updateCartDropdown();
        
        // Show notification
        showNotification(`"${productName}" đã được thêm vào giỏ hàng!`, 'success');
        
        // Optionally close modal if open
        if ($('#quickViewModal').hasClass('show')) {
            $('#quickViewModal').modal('hide');
        }
    });
    
    // Remove from cart
    $(document).on('click', '.btn-remove', function() {
        const item = $(this).closest('.cart-item');
        const itemId = item.data('id');
        
        // Remove from database
        const cartCount = DB.cart.removeItem(itemId);
        
        // Update UI
        item.fadeOut(300, function() {
            $(this).remove();
            
            // Update cart count
            $('.cart-count').text(cartCount);
            
            // Update total
            updateCartTotal();
        });
    });
    
    // Update cart dropdown
    function updateCartDropdown() {
        const cartItems = DB.cart.getItems();
        const cartTotal = formatPrice(DB.cart.getTotalPrice()) + '₫';
        
        // Clear current items
        $('.cart-items').empty();
        
        // Add items to dropdown
        if (cartItems.length > 0) {
            cartItems.forEach(item => {
                $('.cart-items').append(`
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h6>${item.name}</h6>
                            <p>${item.price} x ${item.quantity}</p>
                        </div>
                        <button class="btn-remove"><i class="fas fa-times"></i></button>
                    </div>
                `);
            });
            
            // Update cart count and total
            $('.cart-count').text(DB.cart.getTotalCount());
            $('.cart-summary .fw-bold').text(cartTotal);
        } else {
            // Empty cart
            $('.cart-items').html('<p class="text-center my-3">Giỏ hàng trống</p>');
            $('.cart-count').text('0');
            $('.cart-summary .fw-bold').text('0₫');
        }
    }
    
    // Update cart total
    function updateCartTotal() {
        $('.cart-summary .fw-bold').text(formatPrice(DB.cart.getTotalPrice()) + '₫');
    }
    
    // Format price with thousand separator
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price);
    }
    
    // Quick view product
    $('.quick-view').on('click', function(e) {
        e.preventDefault();
        const productCard = $(this).closest('.product-card');
        const productId = productCard.data('id');
        const productImage = productCard.find('.product-thumb img').attr('src');
        const productTitle = productCard.find('.product-title').text();
        const productPrice = productCard.find('.new-price').text();
        const productOldPrice = productCard.find('.old-price').text();
        
        $('#quickViewModal').data('id', productId);
        $('#quickViewTitle').text(productTitle);
        $('#quickViewImage').attr('src', productImage);
        $('#quickViewPrice').text(productPrice);
        
        if (productOldPrice) {
            $('#quickViewOldPrice').text(productOldPrice).show();
        } else {
            $('#quickViewOldPrice').hide();
        }
        
        $('#quickViewModal').modal('show');
    });
    
    // Product Filter in category pages
    $('#ageFilter, #priceFilter, #brandFilter').on('change', function() {
        filterProducts();
    });
    
    function filterProducts() {
        const age = $('#ageFilter').val();
        const price = $('#priceFilter').val();
        const brand = $('#brandFilter').val();
        
        $('.product-card').each(function() {
            const productAge = $(this).data('age');
            const productPrice = $(this).data('price');
            const productBrand = $(this).data('brand');
            
            let showProduct = true;
            
            if (age && productAge !== age) {
                showProduct = false;
            }
            
            if (price && !isPriceInRange(productPrice, price)) {
                showProduct = false;
            }
            
            if (brand && productBrand !== brand) {
                showProduct = false;
            }
            
            if (showProduct) {
                $(this).parent().fadeIn();
            } else {
                $(this).parent().fadeOut();
            }
        });
    }
    
    function isPriceInRange(productPrice, priceRange) {
        if (!priceRange) return true;
        
        const [min, max] = priceRange.split('-');
        const price = parseInt(productPrice);
        
        if (!max) {
            return price >= parseInt(min);
        } else {
            return price >= parseInt(min) && price <= parseInt(max);
        }
    }
    
    // ------------------------------------------------
    // FORM VALIDATIONS
    // ------------------------------------------------
    
    // Form validation helper functions
    function showError(inputId, message) {
        $('#' + inputId).addClass('is-invalid');
        $('#error' + inputId.substring(5)).text(message);
    }
    
    function clearError(inputId) {
        $('#' + inputId).removeClass('is-invalid');
        $('#error' + inputId.substring(5)).text('');
    }
    
    // Reset form function
    function resetForm(formId) {
        $('#' + formId)[0].reset();
        $('#' + formId + ' input, #' + formId + ' select, #' + formId + ' textarea').removeClass('is-invalid');
        $('#' + formId + ' .invalid-feedback, #' + formId + ' .text-danger').text('');
    }
    
    // Login form validation and processing
    $('#btnLogin').on('click', function() {
        let isValid = true;
        
        const email = $('#loginEmail').val().trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        clearError('loginEmail');
        if (email === "") {
            showError('loginEmail', 'Email là bắt buộc.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('loginEmail', 'Email không đúng định dạng. VD: example@gmail.com');
            isValid = false;
        }
        
        const password = $('#loginPassword').val();
        clearError('loginPassword');
        if (password === "") {
            showError('loginPassword', 'Mật khẩu là bắt buộc.');
            isValid = false;
        } else if (password.length < 6) {
            showError('loginPassword', 'Mật khẩu phải có ít nhất 6 ký tự.');
            isValid = false;
        }
        
        if (isValid) {
            // Attempt to authenticate user
            const result = DB.users.authenticate(email, password);
            if (result.success) {
                showNotification('Đăng nhập thành công!', 'success');
                $('#loginModal').modal('hide');
                resetForm('loginForm');
                
                // Reload page to update UI based on login status
                setTimeout(function() {
                    location.reload();
                }, 1000);
            } else {
                showError('loginEmail', result.message);
            }
        }
    });
    
    // Register form validation and processing
    $('#btnRegister').on('click', function() {
        let isValid = true;
        
        const name = $('#registerName').val().trim();
        const nameRegex = /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:\s[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/;
        clearError('registerName');
        if (name === "") {
            showError('registerName', 'Họ tên là bắt buộc.');
            isValid = false;
        } else if (!nameRegex.test(name)) {
            showError('registerName', 'Họ tên phải viết hoa chữ cái đầu mỗi từ, không chứa số. VD: Nguyen Van An');
            isValid = false;
        }
        
        const email = $('#registerEmail').val().trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        clearError('registerEmail');
        if (email === "") {
            showError('registerEmail', 'Email là bắt buộc.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('registerEmail', 'Email không đúng định dạng. VD: example@gmail.com');
            isValid = false;
        }
        
        const phone = $('#registerPhone').val().trim();
        const phoneRegex = /^0\d{2}-\d{3}-\d{4}$/;
        clearError('registerPhone');
        if (phone === "") {
            showError('registerPhone', 'Số điện thoại là bắt buộc.');
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            showError('registerPhone', 'Số điện thoại phải đúng định dạng 0xx-xxx-xxxx (VD: 090-123-4567).');
            isValid = false;
        }
        
        const password = $('#registerPassword').val();
        clearError('registerPassword');
        if (password === "") {
            showError('registerPassword', 'Mật khẩu là bắt buộc.');
            isValid = false;
        } else if (password.length < 6) {
            showError('registerPassword', 'Mật khẩu phải có ít nhất 6 ký tự.');
            isValid = false;
        }
        
        const confirmPassword = $('#registerConfirmPassword').val();
        clearError('registerConfirmPassword');
        if (confirmPassword === "") {
            showError('registerConfirmPassword', 'Xác nhận mật khẩu là bắt buộc.');
            isValid = false;
        } else if (confirmPassword !== password) {
            showError('registerConfirmPassword', 'Xác nhận mật khẩu không khớp.');
            isValid = false;
        }
        
        if (!$('#agreeTerms').is(':checked')) {
            $('#errorAgree').text('Bạn cần đồng ý với điều khoản và điều kiện.');
            isValid = false;
        } else {
            $('#errorAgree').text('');
        }
        
        if (isValid) {
            // Add user to database
            const result = DB.users.add({
                name: name,
                email: email,
                phone: phone,
                password: password,
                registeredAt: new Date().toISOString()
            });
            
            if (result.success) {
                showNotification('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.', 'success');
                $('#registerModal').modal('hide');
                resetForm('registerForm');
                
                // Open login modal after a brief delay
                setTimeout(function() {
                    $('#loginModal').modal('show');
                }, 1500);
            } else {
                showError('registerEmail', result.message);
            }
        }
    });
    
    // Order check form validation
    $('#btnCheckOrder').on('click', function() {
        let isValid = true;
        
        const orderNumber = $('#orderNumber').val().trim();
        clearError('orderNumber');
        if (orderNumber === "") {
            showError('orderNumber', 'Mã đơn hàng là bắt buộc.');
            isValid = false;
        } else if (!/^KZ\d{5}$/.test(orderNumber)) {
            showError('orderNumber', 'Mã đơn hàng không đúng định dạng. VD: KZ12345');
            isValid = false;
        }
        
        const email = $('#orderEmail').val().trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        clearError('orderEmail');
        if (email === "") {
            showError('orderEmail', 'Email là bắt buộc.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('orderEmail', 'Email không đúng định dạng. VD: example@gmail.com');
            isValid = false;
        }
        
        if (isValid) {
            // Check order in database
            const order = DB.orders.getByOrderNumber(orderNumber);
            if (order && order.email === email) {
                showNotification(`Đơn hàng ${orderNumber} đang trong trạng thái: ${order.status}`, 'info');
                $('#orderCheckModal').modal('hide');
                resetForm('orderCheckForm');
            } else {
                showError('orderNumber', 'Không tìm thấy đơn hàng với thông tin đã cung cấp.');
            }
        }
    });
    
    // Order form validation and processing
    $('#btnDatHang').on('click', function() {
        if (validateOrderForm()) {
            const hoTen = $('#inputHoTen').val().trim();
            const sanPham = $('#inputSanPham').val();
            const soLuong = $('#inputSoLuong').val();
            const diaChi = $('#inputDiaChi').val().trim();
            const email = $('#inputEmail').val().trim();
            const sdt = $('#inputSDT').val().trim();
            const thanhPho = $('#inputThanhPho').val();
            
            // Add order to database
            const orderNumber = DB.orders.add({
                customerName: hoTen,
                product: sanPham,
                quantity: soLuong,
                address: diaChi,
                city: thanhPho,
                email: email,
                phone: sdt,
                items: DB.cart.getItems(),
                totalPrice: DB.cart.getTotalPrice()
            });
            
            // Add order to table
            const currentRows = $('#orderTableBody tr').length;
            const nextSTT = currentRows + 1;
            
            const newRow = `
                <tr>
                    <td>${nextSTT}</td>
                    <td>${hoTen}</td>
                    <td>${sanPham}</td>
                    <td>${soLuong}</td>
                    <td>${diaChi}</td>
                    <td>${email}</td>
                    <td>${sdt}</td>
                </tr>
            `;
            
            $('#orderTableBody').append(newRow);
            
            // Show success modal or notification
            if ($('#orderSuccessModal').length) {
                $('#orderNumberDisplay').text(orderNumber);
                $('#orderSuccessModal').modal('show');
            } else {
                showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderNumber}`, 'success');
            }
            
            // Clear cart
            DB.cart.clear();
            updateCartCount();
            updateCartDropdown();
            
            // Reset form
            resetForm('orderForm');
        }
    });
    
    // Validate order form
    function validateOrderForm() {
        let isValid = true;
        
        const hoTen = $('#inputHoTen').val().trim();
        const hoTenRegex = /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:\s[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/;
        
        clearError('inputHoTen');
        if (hoTen === "") {
            showError('inputHoTen', 'Họ tên là bắt buộc.');
            isValid = false;
        } else if (!hoTenRegex.test(hoTen)) {
            showError('inputHoTen', 'Họ tên phải viết hoa chữ cái đầu mỗi từ, không chứa số. VD: Nguyen Van An');
            isValid = false;
        }
        
        const email = $('#inputEmail').val().trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        clearError('inputEmail');
        if (email === "") {
            showError('inputEmail', 'Email là bắt buộc.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('inputEmail', 'Email không đúng định dạng. VD: example@gmail.com');
            isValid = false;
        }
        
        const sdt = $('#inputSDT').val().trim();
        const sdtRegex = /^0\d{2}-\d{3}-\d{4}$/;
        clearError('inputSDT');
        if (sdt === "") {
            showError('inputSDT', 'Số điện thoại là bắt buộc.');
            isValid = false;
        } else if (!sdtRegex.test(sdt)) {
            showError('inputSDT', 'Số điện thoại phải đúng định dạng 0xx-xxx-xxxx (VD: 090-123-4567).');
            isValid = false;
        }
        
        const diaChi = $('#inputDiaChi').val().trim();
        clearError('inputDiaChi');
        if (diaChi === "") {
            showError('inputDiaChi', 'Địa chỉ giao hàng là bắt buộc.');
            isValid = false;
        } else if (diaChi.length < 10) {
            showError('inputDiaChi', 'Vui lòng nhập địa chỉ đầy đủ (tối thiểu 10 ký tự).');
            isValid = false;
        }
        
        if ($('#inputThanhPho').length) {
            const thanhPho = $('#inputThanhPho').val();
            clearError('inputThanhPho');
            if (!thanhPho) {
                showError('inputThanhPho', 'Vui lòng chọn tỉnh/thành phố.');
                isValid = false;
            }
        }
        
        const sanPham = $('#inputSanPham').val();
        clearError('inputSanPham');
        if (!sanPham) {
            showError('inputSanPham', 'Vui lòng chọn sản phẩm.');
            isValid = false;
        }
        
        const soLuong = $('#inputSoLuong').val();
        clearError('inputSoLuong');
        if (soLuong === "" || soLuong < 1) {
            showError('inputSoLuong', 'Số lượng phải lớn hơn 0.');
            isValid = false;
        }
        
        if ($('#agreeTerms').length) {
            if (!$('#agreeTerms').is(':checked')) {
                $('#errorAgree').text('Bạn cần đồng ý với điều khoản và điều kiện.');
                isValid = false;
            } else {
                $('#errorAgree').text('');
            }
        }
        
        return isValid;
    }
    
    // Contact form validation
    $('#contactForm button').on('click', function() {
        const name = $('#contactName').val().trim();
        const email = $('#contactEmail').val().trim();
        const subject = $('#contactSubject').val().trim();
        const message = $('#contactMessage').val().trim();
        
        let isValid = true;
        
        if (!name) {
            isValid = false;
            $('#contactName').addClass('is-invalid');
        } else {
            $('#contactName').removeClass('is-invalid');
        }
        
        if (!email || !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            isValid = false;
            $('#contactEmail').addClass('is-invalid');
        } else {
            $('#contactEmail').removeClass('is-invalid');
        }
        
        if (!subject) {
            isValid = false;
            $('#contactSubject').addClass('is-invalid');
        } else {
            $('#contactSubject').removeClass('is-invalid');
        }
        
        if (!message) {
            isValid = false;
            $('#contactMessage').addClass('is-invalid');
        } else {
            $('#contactMessage').removeClass('is-invalid');
        }
        
        if (isValid) {
            showNotification('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.', 'success');
            $('#contactForm')[0].reset();
            $('#contactForm .is-invalid').removeClass('is-invalid');
        }
    });
    
    // Newsletter subscription
    $('.newsletter-form button').on('click', function() {
        const email = $('.newsletter-form input').val().trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!email) {
            $('.newsletter-form input').addClass('is-invalid');
            return;
        }
        
        if (!emailRegex.test(email)) {
            $('.newsletter-form input').addClass('is-invalid');
            return;
        }
        
        $('.newsletter-form input').removeClass('is-invalid');
        showNotification('Cảm ơn bạn đã đăng ký nhận thông tin từ KidZone!', 'success');
        $('.newsletter-form input').val('');
    });
    
    // ------------------------------------------------
    // GOOGLE MAPS INTEGRATION
    // ------------------------------------------------
    
    // Find Store Modal
    $('#findStoreLink').on('click', function(e) {
        e.preventDefault();
        $('#findStoreModal').modal('show');
        
        // Initialize map after modal is shown
        $('#findStoreModal').on('shown.bs.modal', function() {
            initMap();
        });
    });
    
    // Google Maps initialization
    window.initMap = function() {
        // Default center (HCM City)
        var center = {lat: 10.7769, lng: 106.7009};
        
        // Create map
        var map = new google.maps.Map(document.getElementById('storeMap'), {
            zoom: 14,
            center: center,
            styles: [
                {
                    "featureType": "administrative",
                    "elementType": "labels.text.fill",
                    "stylers": [{"color": "#444444"}]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{"color": "#f2f2f2"}]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{"saturation": -100}, {"lightness": 45}]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [{"visibility": "simplified"}]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [{"color": "#c4e5f9"}, {"visibility": "on"}]
                }
            ]
        });
        
        // Add markers for stores
        var stores = [
            {
                position: {lat: 10.7769, lng: 106.7009},
                title: 'KidZone Nguyễn Văn A',
                address: '123 Nguyễn Văn A, Quận 1, TP.HCM',
                phone: '028-1234-5678'
            },
            {
                position: {lat: 10.7868, lng: 106.6830},
                title: 'KidZone Nguyễn Văn B',
                address: '456 Nguyễn Văn B, Quận 3, TP.HCM',
                phone: '028-8765-4321'
            },
            {
                position: {lat: 10.8031, lng: 106.7519},
                title: 'KidZone Nguyễn Văn C',
                address: '789 Nguyễn Văn C, Quận 2, TP.HCM',
                phone: '028-2345-6789'
            }
        ];
        
        // Place markers on map
        var markers = [];
        var infoWindow = new google.maps.InfoWindow();
        
        for (var i = 0; i < stores.length; i++) {
            var marker = new google.maps.Marker({
                position: stores[i].position,
                map: map,
                title: stores[i].title,
                icon: {
                    url: 'images/marker.png',
                    scaledSize: new google.maps.Size(40, 40)
                }
            });
            
            markers.push(marker);
            
            // Add info window
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    var content = '<div class="store-info">' +
                                 '<h5>' + stores[i].title + '</h5>' +
                                 '<p><i class="fas fa-map-marker-alt me-2"></i>' + stores[i].address + '</p>' +
                                 '<p><i class="fas fa-phone-alt me-2"></i>' + stores[i].phone + '</p>' +
                                 '</div>';
                    
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                }
            })(marker, i));
        }
        
        // View store on map
        $('.view-on-map').on('click', function() {
            var lat = parseFloat($(this).data('lat'));
            var lng = parseFloat($(this).data('lng'));
            var position = {lat: lat, lng: lng};
            
            // Center map on store
            map.setCenter(position);
            map.setZoom(16);
            
            // Find corresponding marker and trigger click
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].getPosition().lat() === lat && markers[i].getPosition().lng() === lng) {
                    google.maps.event.trigger(markers[i], 'click');
                    break;
                }
            }
        });
        
        // Populate districts based on city selection
        $('#storeCity').on('change', function() {
            var city = $(this).val();
            var districts = [];
            
            // Clear current options
            $('#storeDistrict').html('<option value="">Chọn quận/huyện</option>');
            
            if (city === 'hcm') {
                districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8'];
            } else if (city === 'hanoi') {
                districts = ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa', 'Quận Tây Hồ'];
            } else if (city === 'danang') {
                districts = ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Liên Chiểu', 'Quận Ngũ Hành Sơn'];
            } else if (city === 'cantho') {
                districts = ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn'];
            }
            
            // Add options
            for (var i = 0; i < districts.length; i++) {
                $('#storeDistrict').append('<option value="' + districts[i] + '">' + districts[i] + '</option>');
            }
        });
    };
    
    // ------------------------------------------------
    // FAQ SEARCH FUNCTIONALITY
    // ------------------------------------------------
    $('#faqSearch').on('input', function() {
        const searchTerm = $(this).val().trim().toLowerCase();
        
        if (searchTerm === '') {
            $('.accordion-item').show();
            return;
        }
        
        $('.accordion-item').each(function() {
            const questionText = $(this).find('.accordion-button').text().toLowerCase();
            const answerText = $(this).find('.accordion-body').text().toLowerCase();
            
            if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
    
    // ------------------------------------------------
    // NOTIFICATION SYSTEM
    // ------------------------------------------------
    function showNotification(message, type = 'info') {
        const notificationHtml = `
            <div class="notification ${type}">
                <div class="notification-icon">
                    ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                      type === 'error' ? '<i class="fas fa-times-circle"></i>' : 
                      '<i class="fas fa-info-circle"></i>'}
                </div>
                <div class="notification-content">${message}</div>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Create notification container if it doesn't exist
        if ($('.notification-container').length === 0) {
            $('body').append('<div class="notification-container"></div>');
        }
        
        const notification = $(notificationHtml);
        $('.notification-container').append(notification);
        
        // Show notification
        setTimeout(function() {
            notification.addClass('show');
        }, 10);
        
        // Auto hide after 5 seconds
        setTimeout(function() {
            notification.removeClass('show');
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Close on click
        notification.find('.notification-close').on('click', function() {
            notification.removeClass('show');
            setTimeout(function() {
                notification.remove();
            }, 300);
        });
    }
    
    // Initialize AOS on window load to ensure proper calculations
    $(window).on('load', function() {
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    });
});
