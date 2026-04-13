
let analyticsData = null;
let metricsData = null;
let categoriesData = null;
let charts = {};


const COLORS = {
    primary: '#7c3aed',
    secondary: '#a78bfa',
    gradient: (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 400);
        g.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
        g.addColorStop(1, 'rgba(124, 58, 237, 0.1)');
        return g;
    },
    palette: [
        '#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
        '#06b6d4', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1',
        '#84cc16', '#e11d48', '#0ea5e9', '#d946ef', '#22c55e',
        '#eab308', '#2563eb', '#dc2626', '#0891b2', '#7e22ce',
        '#059669', '#b91c1c', '#1d4ed8', '#9333ea', '#15803d',
        '#c2410c', '#4f46e5', '#be185d', '#0e7490', '#6d28d9',
        '#16a34a', '#ea580c', '#4338ca'
    ],
    paletteAlpha: (alpha) => [
        `rgba(124,58,237,${alpha})`, `rgba(59,130,246,${alpha})`, `rgba(16,185,129,${alpha})`,
        `rgba(245,158,11,${alpha})`, `rgba(236,72,153,${alpha})`, `rgba(6,182,212,${alpha})`,
        `rgba(139,92,246,${alpha})`, `rgba(20,184,166,${alpha})`, `rgba(249,115,22,${alpha})`,
        `rgba(99,102,241,${alpha})`
    ]
};


Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#8b95a5';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.elements.bar.borderRadius = 6;
Chart.defaults.elements.arc.borderWidth = 2;
Chart.defaults.elements.arc.borderColor = '#1a1f35';


document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initSidebar();
    initParticles();
    initMouseTracking();
    initShootingStars();
    initRippleEffects();
    initMagneticCards();
    initScrollReveal();
    initCursorTrail();
    initAmbientGlows();
    initCardGlowFollow();
    fetchAllData();
});


/* ========== ENHANCED PARTICLE ANIMATION SYSTEM ========== */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    const PARTICLE_COUNT = 65;
    const CONNECTION_DISTANCE = 130;
    const PARTICLE_COLORS = [
        'rgba(124, 58, 237, 0.5)',
        'rgba(59, 130, 246, 0.4)',
        'rgba(6, 182, 212, 0.4)',
        'rgba(167, 139, 250, 0.3)',
        'rgba(236, 72, 153, 0.3)',
        'rgba(16, 185, 129, 0.3)'
    ];

    let mousePos = { x: -1000, y: -1000 };
    const MOUSE_RADIUS = 150;

    canvas.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    });

    canvas.addEventListener('mouseleave', () => {
        mousePos.x = -1000;
        mousePos.y = -1000;
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2.5 + 0.5;
            this.baseRadius = this.radius;
            this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
            this.alpha = Math.random() * 0.5 + 0.2;
            this.pulseSpeed = Math.random() * 0.02 + 0.005;
            this.pulseOffset = Math.random() * Math.PI * 2;
        }

        update(time) {
            /* Mouse interaction - particles are repelled */
            const dx = this.x - mousePos.x;
            const dy = this.y - mousePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                this.vx += (dx / dist) * force * 0.3;
                this.vy += (dy / dist) * force * 0.3;
                this.radius = this.baseRadius + force * 2;
            } else {
                this.radius += (this.baseRadius - this.radius) * 0.05;
            }

            /* Damping */
            this.vx *= 0.99;
            this.vy *= 0.99;

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            this.currentAlpha = this.alpha + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.15;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(/[\d.]+\)$/, this.currentAlpha + ')');
            ctx.fill();

            /* Soft glow halo */
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(/[\d.]+\)$/, (this.currentAlpha * 0.1) + ')');
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONNECTION_DISTANCE) {
                    const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);

                    /* Gradient connections */
                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );
                    gradient.addColorStop(0, `rgba(124, 58, 237, ${opacity})`);
                    gradient.addColorStop(1, `rgba(6, 182, 212, ${opacity})`);

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update(time);
            p.draw();
        });
        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    animate(0);
}


/* ========== MOUSE PARALLAX FOR ORBS ========== */
function initMouseTracking() {
    const orbs = document.querySelectorAll('.orb');
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateOrbs() {
        targetX += (mouseX - targetX) * 0.03;
        targetY += (mouseY - targetY) * 0.03;

        orbs.forEach((orb, i) => {
            const depth = (i + 1) * 8;
            const translateX = targetX * depth;
            const translateY = targetY * depth;
            orb.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });

        requestAnimationFrame(updateOrbs);
    }

    updateOrbs();
}


/* ========== SHOOTING STARS SYSTEM ========== */
function initShootingStars() {
    const container = document.getElementById('shooting-stars');
    if (!container) return;

    function createShootingStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';

        const startX = Math.random() * window.innerWidth * 0.7;
        const startY = Math.random() * window.innerHeight * 0.5;
        const length = 80 + Math.random() * 120;
        const duration = 1.5 + Math.random() * 2;

        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        star.style.width = length + 'px';
        star.style.animationDuration = duration + 's';

        const colors = [
            'rgba(167, 139, 250, 0.7)',
            'rgba(59, 130, 246, 0.6)',
            'rgba(6, 182, 212, 0.5)',
            'rgba(236, 72, 153, 0.5)',
            'rgba(245, 158, 11, 0.4)'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        star.style.background = `linear-gradient(90deg, ${color}, transparent)`;

        container.appendChild(star);

        setTimeout(() => {
            if (star.parentNode) star.parentNode.removeChild(star);
        }, duration * 1000 + 200);
    }

    setInterval(createShootingStar, 2500 + Math.random() * 3000);
    setTimeout(createShootingStar, 800);
    setTimeout(createShootingStar, 2000);
}


/* ========== CURSOR TRAIL EFFECT ========== */
function initCursorTrail() {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);

    let trailX = 0, trailY = 0;
    let cursorX = 0, cursorY = 0;
    let isMoving = false;
    let timeout;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        trail.classList.add('active');
        isMoving = true;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            trail.classList.remove('active');
            isMoving = false;
        }, 1000);
    });

    function animateTrail() {
        trailX += (cursorX - trailX) * 0.15;
        trailY += (cursorY - trailY) * 0.15;
        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';
        requestAnimationFrame(animateTrail);
    }

    animateTrail();
}


/* ========== AMBIENT GLOW SPOTS ========== */
function initAmbientGlows() {
    const glowColors = [
        'rgba(124, 58, 237, 0.08)',
        'rgba(6, 182, 212, 0.06)',
        'rgba(236, 72, 153, 0.05)',
        'rgba(16, 185, 129, 0.05)'
    ];

    for (let i = 0; i < 4; i++) {
        const glow = document.createElement('div');
        glow.className = 'ambient-glow';
        glow.style.width = (200 + Math.random() * 300) + 'px';
        glow.style.height = glow.style.width;
        glow.style.background = `radial-gradient(circle, ${glowColors[i]} 0%, transparent 70%)`;
        glow.style.left = (Math.random() * 80 + 10) + '%';
        glow.style.top = (Math.random() * 80 + 10) + '%';
        glow.style.animationDelay = (i * 3) + 's';
        glow.style.animationDuration = (12 + Math.random() * 8) + 's';
        document.body.appendChild(glow);
    }
}


/* ========== CARD GLOW-FOLLOW ON MOUSE ========== */
function initCardGlowFollow() {
    const cards = document.querySelectorAll('.kpi-card, .chart-card, .insight-card, .model-card, .predictor-form-card, .predictor-result-card, .table-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--glow-x', x + 'px');
            card.style.setProperty('--glow-y', y + 'px');
            card.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(124, 58, 237, 0.06), transparent 60%), var(--bg-card)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = '';
        });
    });
}


/* ========== RIPPLE CLICK EFFECTS ========== */
function initRippleEffects() {
    const targets = document.querySelectorAll('.predict-btn, .chart-btn, .nav-item, .kpi-card, .tech-badge');

    targets.forEach(el => {
        el.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);
            setTimeout(() => {
                if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            }, 600);
        });
    });
}


/* ========== MAGNETIC CARD TILT ========== */
function initMagneticCards() {
    const cards = document.querySelectorAll('.kpi-card, .chart-card, .insight-card, .model-card, .predictor-form-card, .predictor-result-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}


/* ========== SCROLL REVEAL ANIMATION ========== */
function initScrollReveal() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    function observeElements() {
        const elements = document.querySelectorAll('.chart-card, .table-card, .insight-card, .model-card');
        elements.forEach(el => {
            if (!el.classList.contains('scroll-reveal')) {
                el.classList.add('scroll-reveal');
                observer.observe(el);
            }
        });
    }

    observeElements();

    const mutationObserver = new MutationObserver(() => {
        setTimeout(observeElements, 100);
    });
    mutationObserver.observe(mainContent, { childList: true, subtree: true });
}



async function fetchAllData() {
    try {
        const [analyticsRes, metricsRes, categoriesRes] = await Promise.all([
            fetch('/api/analytics'),
            fetch('/api/metrics'),
            fetch('/api/categories')
        ]);

        analyticsData = await analyticsRes.json();
        metricsData = await metricsRes.json();
        categoriesData = await categoriesRes.json();

        renderDashboard();
        renderCategories();
        renderPredictor();
        renderInsights();
        renderModelInfo();


        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 1200);
    } catch (err) {
        console.error('Failed to fetch data:', err);
        document.getElementById('loading-screen').classList.add('hidden');
    }
}


function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(`section-${section}`).classList.add('active');

            const titles = {
                dashboard: ['Dashboard', 'Google Play Store Analytics Overview'],
                categories: ['Categories', 'Category-wise Analysis & Comparisons'],
                predictor: ['AI Predictor', 'Predict App Rating Using Machine Learning'],
                insights: ['Insights', 'Key Findings & Actionable Intelligence'],
                model: ['Model Info', 'Machine Learning Model Details & Performance']
            };

            const titleEl = document.getElementById('page-title');
            const subtitleEl = document.getElementById('page-subtitle');
            typeText(titleEl, titles[section][0]);
            subtitleEl.textContent = titles[section][1];

            document.getElementById('sidebar').classList.remove('open');

            setTimeout(() => {
                initScrollReveal();
                initCardGlowFollow();
            }, 200);
        });
    });
}

/* ========== TYPING ANIMATION ========== */
function typeText(element, text, speed) {
    speed = speed || 40;
    element.textContent = '';
    let i = 0;

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.appendChild(cursor);

    function type() {
        if (i < text.length) {
            element.textContent = text.substring(0, i + 1);
            element.appendChild(cursor);
            i++;
            setTimeout(type, speed);
        } else {
            setTimeout(() => {
                if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
            }, 1200);
        }
    }

    type();
}

function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    toggle.addEventListener('click', () => {
        const body = document.body;
        const isLight = body.getAttribute('data-theme') === 'light';
        body.setAttribute('data-theme', isLight ? 'dark' : 'light');
        toggle.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';


        Chart.defaults.elements.arc.borderColor = isLight ? '#1a1f35' : '#ffffff';
        Object.values(charts).forEach(c => {
            if (c && c.update) c.update();
        });
    });
}

function initSidebar() {
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}


function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
}

function animateCounter(element, target, duration) {
    duration = duration || 1500;
    const start = 0;
    const startTime = performance.now();
    const isFloat = String(target).includes('.');

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;

        if (typeof target === 'string') {
            element.textContent = target;
        } else if (target >= 1e6) {
            element.textContent = formatNumber(Math.floor(current));
        } else if (isFloat) {
            element.textContent = current.toFixed(2);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.add('counter-done');
            setTimeout(() => element.classList.remove('counter-done'), 400);
        }
    }

    requestAnimationFrame(update);
}

function createMiniChart(canvasId, data, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => i),
            datasets: [{
                data: data,
                borderColor: color,
                borderWidth: 2,
                fill: true,
                backgroundColor: color + '20',
                pointRadius: 0,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}


function renderDashboard() {
    if (!analyticsData) return;


    animateCounter(document.getElementById('total-apps'), analyticsData.total_apps);
    animateCounter(document.getElementById('avg-rating'), analyticsData.avg_rating);
    animateCounter(document.getElementById('total-reviews'), analyticsData.total_reviews);
    animateCounter(document.getElementById('total-installs'), analyticsData.total_installs);

    document.getElementById('paid-pct').textContent = analyticsData.paid_percentage;


    createMiniChart('mini-chart-apps', [3, 5, 4, 8, 6, 9, 7, 10, 8, 11], '#7c3aed');
    createMiniChart('mini-chart-rating', [3.8, 4.0, 3.9, 4.1, 4.0, 4.2, 4.1, 4.0, 4.1, 4.05], '#f59e0b');
    createMiniChart('mini-chart-reviews', [20, 35, 28, 45, 50, 42, 55, 48, 60, 65], '#3b82f6');
    createMiniChart('mini-chart-installs', [100, 150, 130, 200, 180, 250, 220, 280, 260, 300], '#10b981');

    renderCategoryChart();
    renderTypeDistChart();
    renderRatingDistChart();
    renderContentRatingChart();
    renderTopAppsTable('reviews');


    document.getElementById('top-reviews-btn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('top-rated-btn').classList.remove('active');
        renderTopAppsTable('reviews');
    });
    document.getElementById('top-rated-btn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('top-reviews-btn').classList.remove('active');
        renderTopAppsTable('rated');
    });
}

function renderCategoryChart() {
    const stats = analyticsData.category_stats.slice(0, 15);
    const ctx = document.getElementById('chart-category').getContext('2d');

    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stats.map(s => s.Category),
            datasets: [{
                label: 'Number of Apps',
                data: stats.map(s => s.App_Count),
                backgroundColor: COLORS.palette.slice(0, 15),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f35',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { weight: '600' },
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y} apps`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    beginAtZero: true
                }
            }
        }
    });
}

function renderTypeDistChart() {
    const data = analyticsData.type_distribution;
    const ctx = document.getElementById('chart-type-dist').getContext('2d');

    charts.typeDist = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ['#7c3aed', '#f59e0b'],
                hoverOffset: 12,
                borderWidth: 3,
                borderColor: getComputedStyle(document.body).getPropertyValue('--bg-card').trim() || '#1a1f35'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20, font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: '#1a1f35',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

function renderRatingDistChart() {
    const data = analyticsData.rating_distribution;
    const ctx = document.getElementById('chart-rating-dist').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.6)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.05)');

    charts.ratingDist = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Number of Apps',
                data: Object.values(data),
                backgroundColor: gradient,
                borderColor: '#7c3aed',
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f35',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    beginAtZero: true
                }
            }
        }
    });
}

function renderContentRatingChart() {
    const data = analyticsData.content_rating_distribution;
    const ctx = document.getElementById('chart-content-rating').getContext('2d');

    charts.contentRating = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: COLORS.paletteAlpha(0.6),
                borderColor: COLORS.palette,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { font: { size: 11 }, padding: 12 }
                }
            },
            scales: {
                r: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { display: false }
                }
            }
        }
    });
}

function renderTopAppsTable(type) {
    const apps = type === 'reviews' ? analyticsData.top_apps_by_reviews : analyticsData.top_rated_apps;
    const tbody = document.getElementById('top-apps-body');
    tbody.innerHTML = '';

    apps.forEach((app, i) => {
        const tr = document.createElement('tr');
        const stars = '\u2605'.repeat(Math.round(app.Rating)) + '\u2606'.repeat(5 - Math.round(app.Rating));
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td style="font-weight:600;">${app.App}</td>
            <td><span style="color:var(--accent-secondary);font-weight:500;">${app.Category}</span></td>
            <td><span style="color:var(--orange);">${stars}</span> ${app.Rating}</td>
            <td>${formatNumber(app.Reviews)}</td>
            <td>${app.Installs}</td>
        `;
        tbody.appendChild(tr);
    });
}


function renderCategories() {
    if (!analyticsData) return;
    renderCatRatingChart();
    renderSizeRatingChart();
    renderInstallRatingChart();
}

function renderCatRatingChart() {
    const data = analyticsData.top_categories_by_rating;
    const ctx = document.getElementById('chart-cat-rating').getContext('2d');

    charts.catRating = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Average Rating',
                data: Object.values(data),
                backgroundColor: COLORS.palette.slice(0, Object.keys(data).length),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f35',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `Rating: ${ctx.parsed.x.toFixed(2)} / 5.0`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    min: 3.0,
                    max: 5.0
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '500' } }
                }
            }
        }
    });
}

function renderSizeRatingChart() {
    const data = analyticsData.size_vs_rating;
    const ctx = document.getElementById('chart-size-rating').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');

    charts.sizeRating = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Average Rating',
                data: Object.values(data),
                borderColor: '#06b6d4',
                borderWidth: 3,
                fill: true,
                backgroundColor: gradient,
                tension: 0.4,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#1a1f35',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f35',
                    borderColor: '#06b6d4',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `Rating: ${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    min: 3.0,
                    max: 5.0
                }
            }
        }
    });
}

function renderInstallRatingChart() {
    const data = analyticsData.installs_vs_rating;
    const ctx = document.getElementById('chart-install-rating').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.5)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.05)');

    charts.installRating = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Average Rating',
                data: Object.values(data),
                borderColor: '#a78bfa',
                borderWidth: 3,
                fill: true,
                backgroundColor: gradient,
                tension: 0.4,
                pointBackgroundColor: '#a78bfa',
                pointBorderColor: '#1a1f35',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f35',
                    borderColor: '#a78bfa',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `Rating: ${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    min: 3.0,
                    max: 5.0
                }
            }
        }
    });
}


function renderPredictor() {
    if (!categoriesData) return;

    const catSelect = document.getElementById('pred-category');
    categoriesData.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
    });

    const contentSelect = document.getElementById('pred-content-rating');
    categoriesData.content_ratings.forEach(cr => {
        const opt = document.createElement('option');
        opt.value = cr;
        opt.textContent = cr;
        contentSelect.appendChild(opt);
    });

    document.getElementById('predict-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('predict-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Predicting...';
        btn.disabled = true;

        const payload = {
            category: document.getElementById('pred-category').value,
            reviews: document.getElementById('pred-reviews').value,
            installs: document.getElementById('pred-installs').value,
            size_mb: document.getElementById('pred-size').value,
            price: document.getElementById('pred-price').value,
            content_rating: document.getElementById('pred-content-rating').value,
            genre: document.getElementById('pred-category').value
        };

        try {
            const res = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            displayPrediction(result);
        } catch (err) {
            console.error('Prediction failed:', err);
        }

        btn.innerHTML = '<i class="fas fa-magic"></i> Predict Rating';
        btn.disabled = false;
    });
}

function displayPrediction(result) {
    document.getElementById('result-placeholder').style.display = 'none';
    document.getElementById('result-content').style.display = 'block';

    const rating = result.predicted_rating;
    document.getElementById('predicted-rating-value').textContent = rating.toFixed(1);


    const progress = document.getElementById('rating-progress');
    const circumference = 2 * Math.PI * 54;
    progress.style.stroke = '#7c3aed';
    const offset = circumference - (rating / 5) * circumference;
    setTimeout(() => {
        progress.style.strokeDashoffset = offset;
    }, 100);


    const starsEl = document.getElementById('rating-stars');
    starsEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        if (i <= Math.floor(rating)) {
            star.className = 'fas fa-star filled';
        } else if (i === Math.ceil(rating) && rating % 1 >= 0.3) {
            star.className = 'fas fa-star-half-alt half';
        } else {
            star.className = 'far fa-star';
        }
        star.style.animationDelay = (i * 0.1) + 's';
        starsEl.appendChild(star);
    }


    const confidence = result.confidence;
    document.getElementById('confidence-value').textContent = confidence + '%';
    setTimeout(() => {
        document.getElementById('confidence-fill').style.width = confidence + '%';
    }, 200);


    const factorsEl = document.getElementById('factors-list');
    factorsEl.innerHTML = '';
    result.top_factors.forEach(f => {
        const div = document.createElement('div');
        div.className = 'factor-item';
        const prettyName = f.feature.replace(/_/g, ' ').replace(/Encoded/g, '').trim();
        div.innerHTML = `
            <span class="factor-name">${prettyName}</span>
            <div class="factor-bar">
                <div class="factor-bar-fill" style="width: ${f.importance}%"></div>
            </div>
            <span class="factor-value">${f.importance}%</span>
        `;
        factorsEl.appendChild(div);
    });
}


function renderInsights() {
    if (!analyticsData) return;

    const grid = document.getElementById('insights-grid');
    const a = analyticsData;

    const topCat = a.category_stats[0];
    const highestRatedCat = Object.entries(a.top_categories_by_rating)[0];
    const freeCount = a.type_distribution['Free'] || 0;
    const paidCount = a.type_distribution['Paid'] || 0;

    const insights = [
        {
            color: 'purple',
            icon: 'fas fa-chart-pie',
            title: 'Most Popular Category',
            text: `"${topCat.Category}" dominates the Play Store with ${topCat.App_Count} apps, making it the most populated category in the dataset.`,
            stat: topCat.App_Count.toLocaleString() + ' apps'
        },
        {
            color: 'orange',
            icon: 'fas fa-crown',
            title: 'Highest Rated Category',
            text: `"${highestRatedCat[0]}" achieves the highest average rating of ${highestRatedCat[1]}/5.0, suggesting users find these apps most satisfying.`,
            stat: highestRatedCat[1] + ' / 5.0'
        },
        {
            color: 'green',
            icon: 'fas fa-gift',
            title: 'Free vs Paid Apps',
            text: `${(100 - a.paid_percentage).toFixed(1)}% of apps are free. Only ${a.paid_percentage}% are paid, showing the freemium model dominates.`,
            stat: freeCount.toLocaleString() + ' free'
        },
        {
            color: 'blue',
            icon: 'fas fa-star',
            title: 'Average App Quality',
            text: `The average rating across all apps is ${a.avg_rating}/5.0, indicating generally high user satisfaction on the platform.`,
            stat: a.avg_rating + ' \u2605'
        },
        {
            color: 'pink',
            icon: 'fas fa-weight-hanging',
            title: 'Average App Size',
            text: `The average app size is ${a.avg_size_mb} MB. Optimizing size can improve download conversion rates significantly.`,
            stat: a.avg_size_mb + ' MB'
        },
        {
            color: 'cyan',
            icon: 'fas fa-comments',
            title: 'User Engagement',
            text: `With ${formatNumber(a.total_reviews)} total reviews across ${a.total_apps} apps, the average engagement rate shows active user participation.`,
            stat: formatNumber(a.total_reviews)
        }
    ];

    grid.innerHTML = insights.map(i => `
        <div class="insight-card insight-${i.color}">
            <div class="insight-icon"><i class="${i.icon}"></i></div>
            <h3 class="insight-title">${i.title}</h3>
            <p class="insight-text">${i.text}</p>
            <div class="insight-stat">${i.stat}</div>
        </div>
    `).join('');
}


function renderModelInfo() {
    if (!metricsData) return;

    document.getElementById('metric-mae').textContent = metricsData.mae;
    document.getElementById('metric-rmse').textContent = metricsData.rmse;
    document.getElementById('metric-r2').textContent = metricsData.r2;
    document.getElementById('train-size').textContent = metricsData.train_size ? metricsData.train_size.toLocaleString() : '--';
    document.getElementById('test-size').textContent = metricsData.test_size ? metricsData.test_size.toLocaleString() : '--';

    renderFeatureImportanceChart();
}

function renderFeatureImportanceChart() {
    const data = metricsData.feature_importance;
    if (!data) return;

    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const ctx = document.getElementById('chart-feature-importance').getContext('2d');

    charts.featureImportance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s[0].replace(/_/g, ' ').replace(/Encoded/g, '').trim()),
            datasets: [{
                label: 'Importance',
                data: sorted.map(s => (s[1] * 100).toFixed(1)),
                backgroundColor: COLORS.palette.slice(0, sorted.length),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f35',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `Importance: ${ctx.parsed.x}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    title: {
                        display: true,
                        text: 'Importance (%)',
                        font: { weight: '600' }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '500' } }
                }
            }
        }
    });
}
