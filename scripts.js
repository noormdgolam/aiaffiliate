/* 
   AI App Alchemy - Interactivity
   Author: AI
   JS: Vanilla
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // 3. Fake Countdown Timer for Urgency (Resetting every 24h or fixed 12h)
    // For a real scenario, this would be tied to a server or cookie. 
    // Here we'll just start a 12 hour countdown for demonstration.
    
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('mins');
    const secsEl = document.getElementById('secs');

    if (hoursEl && minsEl && secsEl) {
        let totalSeconds = (12 * 3600) + (45 * 60) + 30; // 12h 45m 30s

        setInterval(() => {
            if (totalSeconds <= 0) {
                totalSeconds = 0; // stop at zero
            } else {
                totalSeconds--;
            }

            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            hoursEl.textContent = h.toString().padStart(2, '0');
            minsEl.textContent = m.toString().padStart(2, '0');
            secsEl.textContent = s.toString().padStart(2, '0');

        }, 1000);
    }
});
