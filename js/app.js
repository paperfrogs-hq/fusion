function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 2 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';

    const duration = Math.random() * 20 + 10;
    particle.style.animation = `float ${duration}s linear infinite`;
    particle.style.animationDelay = Math.random() * 5 + 's';

    particlesContainer.appendChild(particle);
  }
}

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = entry.target.dataset.animation || 'scrollReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.dataset.animation = `scrollReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.1 * (index + 1)}s forwards`;
    observer.observe(item);
  });

  const emailSection = document.querySelector('.coming-soon');
  if (emailSection && !emailSection.hasAttribute('data-observed')) {
    emailSection.setAttribute('data-observed', 'true');
    observer.observe(emailSection);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  createParticles();
  initScrollAnimations();

  const form = document.querySelector('form[name="fusion-notify"]');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[name="email"]');
      const submitButton = this.querySelector('button[type="submit"]');
      const email = emailInput.value.trim();

      // Basic email validation
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }

      // Disable button and show loading state
      submitButton.disabled = true;
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Saving...';

      try {
        // Check if Supabase is configured
        if (!window.supabaseClient || !window.supabaseClient) {
          // Fallback if Supabase not configured
          console.warn('Supabase not configured, using local storage');
          localStorage.setItem('fusion_email_' + Date.now(), email);
          showSuccessMessage(emailInput, submitButton, originalText, email);
          return;
        }

        // Save to Supabase
        const { data, error } = await window.supabaseClient
          .from('early_access_signups')
          .insert([
            {
              email: email,
              created_at: new Date().toISOString(),
              source: 'fusion-landing'
            }
          ]);

        if (error) {
          if (error.code === '23505') {
            // Duplicate email
            showMessage(emailInput, submitButton, originalText, 'You\'re already on our list!', 'warning');
          } else {
            console.error('Supabase error:', error);
            showMessage(emailInput, submitButton, originalText, 'Something went wrong. Try again!', 'error');
          }
        } else {
          showSuccessMessage(emailInput, submitButton, originalText, email);
        }
      } catch (err) {
        console.error('Form submission error:', err);
        showMessage(emailInput, submitButton, originalText, 'Error saving email. Please try again.', 'error');
      }
    });
  }
});

function showSuccessMessage(emailInput, submitButton, originalText, email) {
  emailInput.value = '';
  submitButton.textContent = '✓ Saved!';
  submitButton.style.backgroundColor = '#22E6C3';
  submitButton.style.color = '#070B14';

  setTimeout(() => {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    submitButton.style.backgroundColor = '';
    submitButton.style.color = '';
  }, 3000);

  alert('Thank you for your interest! We will notify you soon at ' + email);
}

function showMessage(emailInput, submitButton, originalText, message, type) {
  submitButton.disabled = false;
  submitButton.textContent = originalText;
  alert(message);
}
