// Initialize AOS Animation Library
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Typewriter Effect
    window.initTypewriter = function (customTexts) {
        const texts = customTexts || ["Student", "Cybersecurity Specialist", "Penetration Tester", "Red Team Operator", "Ethical Hacker"];
        let count = 0;
        let index = 0;
        let currentText = "";
        let letter = "";
        let isDeleting = false;
        let typeSpeed = 100;

        const typeWriterElement = document.getElementById('typewriter');
        if (!typeWriterElement) return;

        function type() {
            if (count === texts.length) {
                count = 0;
            }
            currentText = texts[count];

            if (isDeleting) {
                letter = currentText.slice(0, --index);
                typeSpeed = 50; // Faster when deleting
            } else {
                letter = currentText.slice(0, ++index);
                typeSpeed = 100; // Normal typing speed
            }

            typeWriterElement.textContent = letter;

            if (!isDeleting && letter.length === currentText.length) {
                typeSpeed = 2000; // Pause at end of word
                isDeleting = true;
            } else if (isDeleting && letter.length === 0) {
                isDeleting = false;
                count++;
                typeSpeed = 500; // Pause before new word
            }

            setTimeout(type, typeSpeed);
        }

        type();
    };

    // Fallback init if content-loader resolves late or fails
    setTimeout(() => {
        if (!document.getElementById('typewriter').textContent) {
            // window.initTypewriter(); // Optional: don't double init if content loader is fast
        }
    }, 1000);

    // Navbar Scroll Effect
    const navbar = document.querySelector('#mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('shadow-lg');
            navbar.style.backgroundColor = 'rgba(15, 15, 15, 0.95) !important';
        } else {
            navbar.classList.remove('shadow-lg');
        }
    });

    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });

    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Bootstrap Form Validation
    // Contact Form Handling (Mailto with JS)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!contactForm.checkValidity()) {
                contactForm.classList.add('was-validated');
                return;
            }

            // Get values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Construct Mailto URL
            const mailtoLink = `mailto:karlseyram18@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message)}`;

            // Open Email Client
            window.location.href = mailtoLink;

            // Optional: Reset form or show success feedback (alert is simple for now)
            // alert('Opening your email client to send the message...');
            contactForm.reset();
            contactForm.classList.remove('was-validated');
        });
    }

    // Smooth Scrolling for navigation links
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetUnclean = targetId.substring(1);
            // Handle possibility of empty href or just #
            if (!targetUnclean) return;

            const targetSection = document.getElementById(targetUnclean);
            if (targetSection) {
                // Collapse navbar if open (mobile)
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (window.getComputedStyle(navbarToggler).display !== 'none' && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }

                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Offset for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });
});
