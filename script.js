/* ============================================
   ParamTatva.org - Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initScrollEffects();
    initSutraInteractions();
    initFormHandling();
    initAnimations();
});

/* Navigation */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('.nav-main');
    
    // Mobile menu toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Navbar background on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.style.background = 'rgba(10, 10, 15, 0.98)';
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.background = 'rgba(10, 10, 15, 0.9)';
            nav.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* Scroll Effects */
function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add staggered animation to children
                const children = entry.target.querySelectorAll('.mission-card, .pillar-card, .sutra-item');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate-in');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-section');
        observer.observe(section);
    });
    
    // Parallax effect for hero yantra
    const heroYantra = document.querySelector('.hero-yantra');
    if (heroYantra) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroYantra.style.transform = `translateY(calc(-50% + ${scrolled * 0.2}px))`;
        });
    }
}

/* Sutra Interactions */
function initSutraInteractions() {
    const sutraItems = document.querySelectorAll('.sutra-item');
    
    sutraItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Create glow effect
            item.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.4)';
            
            // Play subtle sound effect (if audio context is available)
            playResonanceSound(item.dataset.num);
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.boxShadow = '';
        });
        
        item.addEventListener('click', () => {
            // Show sutra details in a modal or expand
            showSutraDetails(item);
        });
    });
}

/* Resonance Sound (Optional - Web Audio API) */
function playResonanceSound(sutraNum) {
    // Only play if user has interacted with the page
    if (!window.audioContext) {
        try {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            return; // Audio not supported
        }
    }
    
    const ctx = window.audioContext;
    if (ctx.state === 'suspended') return;
    
    // Create a gentle resonance based on sutra number
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Map sutra numbers to harmonic frequencies (based on Sanskrit phonetics)
    const baseFreq = 220; // A3
    const frequency = baseFreq * (1 + (parseInt(sutraNum) || 1) * 0.1);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
}

/* Show Sutra Details */
function showSutraDetails(item) {
    const sutraText = item.querySelector('.sutra-text').textContent;
    const romanization = item.querySelector('.sutra-romanization').textContent;
    const sutraNum = item.dataset.num;
    
    // Create a temporary highlight effect
    item.style.transform = 'scale(1.05)';
    item.style.borderColor = 'rgba(212, 175, 55, 0.8)';
    
    setTimeout(() => {
        item.style.transform = '';
        item.style.borderColor = '';
    }, 300);
    
    // Log for now (could expand to modal)
    console.log(`Sutra ${sutraNum}: ${sutraText} (${romanization})`);
}

/* Form Handling */
function initFormHandling() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;
            
            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Simulate form submission (replace with actual API call)
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                showNotification('🙏 Namaste! Your message has been received. We will connect with you soon.', 'success');
                form.reset();
            } catch (error) {
                showNotification('Unable to send message. Please try again.', 'error');
            }
            
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
        
        // Form field animations
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('focus', () => {
                field.parentElement.classList.add('focused');
            });
            
            field.addEventListener('blur', () => {
                field.parentElement.classList.remove('focused');
            });
        });
    }
}

/* Notification System */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Close">×</button>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 2rem',
        background: type === 'success' 
            ? 'linear-gradient(145deg, rgba(45, 27, 78, 0.95), rgba(26, 26, 46, 0.95))'
            : 'linear-gradient(145deg, rgba(78, 27, 27, 0.95), rgba(46, 26, 26, 0.95))',
        border: `1px solid ${type === 'success' ? 'rgba(212, 175, 55, 0.5)' : 'rgba(255, 100, 100, 0.5)'}`,
        borderRadius: '12px',
        color: '#fff',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.1rem',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        animation: 'slideIn 0.4s ease-out'
    });
    
    document.body.appendChild(notification);
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/* Animations */
function initAnimations() {
    // Add CSS for dynamic animations
    const style = document.createElement('style');
    style.textContent = `
        .fade-section {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .fade-section.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .mission-card, .pillar-card, .sutra-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        
        .mission-card.animate-in, .pillar-card.animate-in, .sutra-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: rgba(212, 175, 55, 0.8);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: color 0.3s ease;
        }
        
        .notification-close:hover {
            color: #fff;
        }
        
        .form-group.focused label {
            color: #f4d03f;
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
    `;
    document.head.appendChild(style);
    
    // Animate pillar icons on hover
    document.querySelectorAll('.pillar-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.icon-glow');
            if (icon) {
                icon.style.transform = 'translate(-50%, -50%) scale(1.3)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.icon-glow');
            if (icon) {
                icon.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });
    });
    
    // Typing effect for hero subtitle (optional enhancement)
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && window.innerWidth > 768) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.style.visibility = 'visible';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        // Start typing after a delay
        setTimeout(typeWriter, 1000);
    }
}

/* Utility: Debounce function */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* Console Easter Egg */
console.log(`
%c॥ ॐ नमः शिवाय ॥
%c
Welcome to ParamTatva.org
The Primordial Energy System of the Universe

Dedicated to the sacred teachings of
Sadgurudev Nikhileswarananda

%cमन्त्र • तन्त्र • यन्त्र • विज्ञान
`, 
'color: #d4af37; font-size: 24px; font-family: serif;',
'color: #c0c0c0; font-size: 14px;',
'color: #ff9933; font-size: 16px; font-family: serif;'
);
