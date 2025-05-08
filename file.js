$(document).ready(function() {
    
    
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
    
    
    if ($('.hero-carousel').length) {
        $('.hero-carousel').owlCarousel({
            items: 1,
            loop: true,
            margin: 0,
            nav: false,
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000
        });
    }
    
    if ($('.brands-carousel').length) {
        $('.brands-carousel').owlCarousel({
            loop: true,
            margin: 20,
            nav: false,
            dots: false,
            autoplay: true,
            responsive: {
                0: { items: 2 },
                576: { items: 3 },
                768: { items: 4 },
                992: { items: 5 }
            }
        });
    }
    
    if ($('.testimonial-carousel').length) {
        $('.testimonial-carousel').owlCarousel({
            loop: true,
            margin: 20,
            nav: false,
            dots: true,
            autoplay: true,
            responsive: {
                0: { items: 1 },
                992: { items: 2 },
                1200: { items: 3 }
            }
        });
    }

    
    function showError(inputId, message) {
        $('#' + inputId).addClass('is-invalid');
        $('#error' + inputId.substring(5)).text(message);
    }

    
    function clearError(inputId) {
        $('#' + inputId).removeClass('is-invalid');
        $('#error' + inputId.substring(5)).text('');
    }

    // Reset form
    function resetForm() {
        $('#orderForm')[0].reset();
        $('#orderForm input, #orderForm select, #orderForm textarea').removeClass('is-invalid');
        $('.error-message').text('');
        $('#agreeTerms').prop('checked', false);
    }

    // Validate form
    function validateForm() {
        let isValid = true;

        
        const hoTen = $('#inputHoTen').val().trim();
        const hoTenRegex = /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?: [A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/;
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

    
    $('#decreaseQty').on('click', function() {
        var input = $('#inputSoLuong');
        var value = parseInt(input.val());
        if (value > 1) {
            input.val(value - 1);
        }
    });
    
    $('#increaseQty').on('click', function() {
        var input = $('#inputSoLuong');
        var value = parseInt(input.val());
        input.val(value + 1);
    });

    
    $('#btnDatHang').on('click', function() {
        if (validateForm()) {
            const hoTen = $('#inputHoTen').val().trim();
            const sanPham = $('#inputSanPham').val();
            const soLuong = $('#inputSoLuong').val();
            const diaChi = $('#inputDiaChi').val().trim();
            const email = $('#inputEmail').val().trim();
            const sdt = $('#inputSDT').val().trim();
            
            
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
            
            
            if ($('#orderSuccessModal').length) {
                
                const orderNumber = 'KZ' + Math.floor(10000 + Math.random() * 90000);
                $('#orderNumberDisplay').text(orderNumber);
                
                $('#orderSuccessModal').modal('show');
            } else {
                
                alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại KidZone.');
            }
            
            // Reset form
            resetForm();
        }
    });

    
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
            alert('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
            $('#contactForm')[0].reset();
            $('#contactForm .is-invalid').removeClass('is-invalid');
        }
    });

    
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
        alert('Cảm ơn bạn đã đăng ký nhận thông tin từ KidZone!');
        $('.newsletter-form input').val('');
    });
    
    
    $('.add-to-cart').on('click', function() {
        const productCard = $(this).closest('.product-card');
        const productName = productCard.find('.product-title').text() || 'Sản phẩm';
        
        
        const currentCount = parseInt($('.cart-count').text());
        $('.cart-count').text(currentCount + 1);
        
        
        alert(`"${productName}" đã được thêm vào giỏ hàng!`);
    });
    
    
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').addClass('active');
        } else {
            $('.back-to-top').removeClass('active');
        }
    });
    
    $('.back-to-top').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 800);
    });
    
    
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
    
    
    $('#mobileSearchBtn').on('click', function() {
        $('#mobileSearchForm').collapse('toggle');
    });
    
    
    function updateCountdown() {
        $('[data-countdown]').each(function() {
            const $this = $(this);
            const finalDate = new Date($this.data('countdown'));
            const now = new Date();
            
            
            const diff = finalDate - now;
            
            
            if (diff < 0) {
                $this.html('<div class="countdown-item"><span class="days">00</span><span class="label">Ngày</span></div>' +
                    '<div class="countdown-item"><span class="hours">00</span><span class="label">Giờ</span></div>' +
                    '<div class="countdown-item"><span class="minutes">00</span><span class="label">Phút</span></div>' +
                    '<div class="countdown-item"><span class="seconds">00</span><span class="label">Giây</span></div>');
                return;
            }
            
            
            let days = Math.floor(diff / (1000 * 60 * 60 * 24));
            let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            
            days = (days < 10) ? "0" + days : days;
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            
            
            $this.html('<div class="countdown-item"><span class="days">' + days + '</span><span class="label">Ngày</span></div>' +
                '<div class="countdown-item"><span class="hours">' + hours + '</span><span class="label">Giờ</span></div>' +
                '<div class="countdown-item"><span class="minutes">' + minutes + '</span><span class="label">Phút</span></div>' +
                '<div class="countdown-item"><span class="seconds">' + seconds + '</span><span class="label">Giây</span></div>');
        });
    }
    
    
    if ($('[data-countdown]').length > 0) {
        updateCountdown(); 
        setInterval(updateCountdown, 1000); 
    }
    
    $('.quick-view').on('click', function() {
        const productId = $(this).data('product-id');
        const productCard = $(this).closest('.product-card');
        const productImage = productCard.find('.product-thumb img').attr('src');
        const productTitle = productCard.find('.product-title').text();
        const productPrice = productCard.find('.new-price').text();
        const productOldPrice = productCard.find('.old-price').text();
        
        $('#quickViewTitle').text(productTitle);
        $('#quickViewImage').attr('src', productImage);
        $('#quickViewPrice').text(productPrice);
        
        if (productOldPrice) {
            $('#quickViewOldPrice').text(productOldPrice).show();
        } else {
            $('#quickViewOldPrice').hide();
        }
    });
    
    $(document).on('click', '.btn-remove', function() {
        $(this).closest('.cart-item').fadeOut(300, function() {
            $(this).remove();
            
            const newCount = $('.cart-item').length;
            $('.cart-count').text(newCount);
            
            let total = 0;
            $('.cart-item').each(function() {
                const priceText = $(this).find('.cart-item-details p').text();
                const price = parseInt(priceText.replace(/[^\d]/g, '')); 
                const quantity = 1; 
                total += price * quantity;
            });
            
            $('.cart-summary .fw-bold').text(formatPrice(total) + '₫');
        });
    });
    
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price);
    }
});
