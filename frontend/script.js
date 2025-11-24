document.addEventListener('DOMContentLoaded', function() {
    // Initialize all core features
    initDarkMode();
    initStatisticsCounter();
    initProjectFilter();
    
    // New enhancements
    initCopyToClipboard();
    initSmoothTransitions();
    enhanceThemeToggle();
    injectPersonality();
    initScrollAnimations();
    
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
    
    // Initialize Visuals if elements exist
    if(document.getElementById('skillsRadarChart')) {
        // Add loading state
        document.getElementById('skillsRadarChart').classList.add('chart-loading');
        document.getElementById('skillsBarChart').classList.add('chart-loading');
        
        // Initialize charts with delay to show loading state
        setTimeout(initSkillsCharts, 1000);
    }
    if(document.getElementById('churnGraph')) initProjectCharts();
    
    // Initialize data playground if on projects page
    if (document.getElementById('dataRange')) {
        initDataPlayground();
    }
    
    // Scroll to Top Logic
    const scrollBtn = document.getElementById('scrollTopBtn');
    if(scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                scrollBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        });
    }
});

/* --- 1. Dark Mode Logic (FIXED) --- */
function initDarkMode() {
    // Check storage or system preference
    if (localStorage.getItem('theme') === 'dark' || 
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Listen for toggle clicks (Updated to handle Shadow DOM/Custom Elements)
    document.addEventListener('click', (e) => {
        // composedPath() helps find elements inside custom components/shadow DOM
        const path = e.composedPath ? e.composedPath() : [];
        const toggleBtn = path.find(el => el.classList && el.classList.contains('theme-toggle')) || e.target.closest('.theme-toggle');

        if(toggleBtn) {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Update charts color if they exist
            if(typeof updateChartsTheme === 'function') updateChartsTheme();
        }
    });
}

/* --- 2. Stats Counter Animation --- */
function initStatisticsCounter() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500; 
        const increment = target / (duration / 16); 
        
        let current = 0;
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current) + (counter.innerText.includes('+') ? '+' : '');
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target + (counter.getAttribute('data-target').includes('+') ? '+' : '');
            }
        };
        updateCounter();
    });
}

/* --- 3. Project Modal Logic --- */
window.openModal = function(title, desc, resultsArray, repoUrl) {
    const modal = document.getElementById('projectModal');
    if(!modal) return;
    
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDescription').innerText = desc;
    document.getElementById('modalGithub').href = repoUrl || '#';
    
    const resultsList = document.getElementById('modalResults');
    resultsList.innerHTML = resultsArray.map(r => `<li>${r}</li>`).join('');
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
};

window.closeModal = function() {
    const modal = document.getElementById('projectModal');
    if(modal) modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
};

/* --- 4. Project Filter Logic --- */
function initProjectFilter() {
    const searchInput = document.getElementById('projectSearch');
    if(!searchInput) return;

    const techFilter = document.getElementById('techFilter');
    const diffFilter = document.getElementById('difficultyFilter');
    const projects = document.querySelectorAll('.project-card');
    const noResults = document.getElementById('noResults');

    function filter() {
        const term = searchInput.value.toLowerCase();
        const tech = techFilter.value;
        const diff = diffFilter.value;
        let visibleCount = 0;

        projects.forEach(card => {
            const text = card.innerText.toLowerCase();
            const cTech = card.dataset.technologies || '';
            const cDiff = card.dataset.difficulty || '';

            const matchSearch = text.includes(term);
            const matchTech = tech === 'all' || cTech.includes(tech);
            const matchDiff = diff === 'all' || cDiff === diff;

            if(matchSearch && matchTech && matchDiff) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if(noResults) noResults.classList.toggle('hidden', visibleCount > 0);
    }

    searchInput.addEventListener('input', filter);
    techFilter.addEventListener('change', filter);
    diffFilter.addEventListener('change', filter);
}

/* --- 5. Chart Logic (Skills) - FIXED --- */
let radarChart, barChart;

function initSkillsCharts() {
    // Remove loading states
    const charts = document.querySelectorAll('.chart-loading');
    charts.forEach(chart => chart.classList.remove('chart-loading'));

    const isDark = document.documentElement.classList.contains('dark');
    // Define colors dynamically
    const textColor = isDark ? '#e2e8f0' : '#334155';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Radar
    const radarCtx = document.getElementById('skillsRadarChart').getContext('2d');
    let radarGradient = radarCtx.createRadialGradient(0, 0, 0, 0, 0, 200);
    radarGradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)'); // Cyan
    radarGradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');

    radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Python', 'SQL', 'ML', 'Viz', 'Stats', 'R', 'Cleaning', 'BI'],
            datasets: [{
                label: 'Level',
                data: [70, 85, 50, 80, 85, 75, 90, 60],
                backgroundColor: radarGradient,
                borderColor: '#06b6d4',
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#06b6d4',
                borderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false, // Fixes sizing issues in containers
            scales: {
                r: {
                    min: 0,   // Standardize scale start
                    max: 100, // Standardize scale end
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: { 
                        color: textColor, 
                        font: { family: "'JetBrains Mono', monospace", size: 12 } 
                    },
                    ticks: { 
                        display: false, // Hide the numbers on the axis for cleaner look
                        backdropColor: 'transparent' 
                    }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Bar
    const barCtx = document.getElementById('skillsBarChart').getContext('2d');
    let barGradient = barCtx.createLinearGradient(0, 0, 400, 0);
    barGradient.addColorStop(0, '#06b6d4');
    barGradient.addColorStop(1, '#8b5cf6');

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Python', 'Pandas', 'SQL', 'Power BI', 'R', 'Excel', 'Scikit-learn'],
            datasets: [{
                label: 'Proficiency (%)',
                data: [70, 80, 85, 60, 75, 70, 80],
                backgroundColor: barGradient,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y',
            maintainAspectRatio: false,
            scales: {
                x: {
                    max: 100,
                    grid: { color: gridColor },
                    ticks: { callback: val => val + '%', color: textColor, font: { family: "'JetBrains Mono', monospace" } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { family: "'JetBrains Mono', monospace" } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateChartsTheme() {
    if(!radarChart || !barChart) return;
    const isDark = document.documentElement.classList.contains('dark');
    
    // New color definitions
    const textColor = isDark ? '#e2e8f0' : '#334155';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update Radar Chart
    radarChart.options.scales.r.pointLabels.color = textColor;
    radarChart.options.scales.r.grid.color = gridColor;
    radarChart.options.scales.r.angleLines.color = gridColor;
    radarChart.update();
    
    // Update Bar Chart
    barChart.options.scales.x.ticks.color = textColor;
    barChart.options.scales.x.grid.color = gridColor;
    barChart.options.scales.y.ticks.color = textColor;
    barChart.update();
}

/* --- 6. Project Charts --- */
function initProjectCharts() {
    // Kept in HTML specific scripts usually, but can go here
}

/* --- ENHANCEMENTS --- */

// Interactive Data Storytelling
function initDataPlayground() {
    const range = document.getElementById('dataRange');
    const dataValue = document.getElementById('dataValue');
    const dataInsight = document.getElementById('dataInsight');
    const datasetName = document.getElementById('datasetName');
    const dataBtns = document.querySelectorAll('.data-btn');
    const liveChart = document.getElementById('liveChart');
    
    const datasets = {
        customers: {
            name: "Customer Behavior",
            insights: [
                "Low retention - review onboarding process",
                "Moderate engagement - consider loyalty program", 
                "Strong customer loyalty - focus on referrals",
                "Excellent retention - scale acquisition"
            ]
        },
        sales: {
            name: "Sales Performance", 
            insights: [
                "Below target - review sales strategy",
                "Meeting baseline goals - optimize conversion",
                "Strong performance - invest in top performers",
                "Exceptional growth - expand market reach"
            ]
        },
        engagement: {
            name: "User Engagement",
            insights: [
                "Low engagement - improve UX/features",
                "Moderate usage - push notifications needed",
                "High engagement - focus on monetization", 
                "Addicted users - scale community features"
            ]
        },
        revenue: {
            name: "Revenue Metrics",
            insights: [
                "Revenue declining - urgent action needed",
                "Stable but stagnant - new revenue streams",
                "Growing steadily - optimize pricing",
                "Explosive growth - prepare for scale"
            ]
        }
    };
    
    let currentDataset = 'customers';
    
    function updateDataStory(value) {
        const insightIndex = Math.floor(value / 25);
        dataValue.textContent = value + '%';
        if (datasets[currentDataset] && datasets[currentDataset].insights[insightIndex]) {
            dataInsight.textContent = datasets[currentDataset].insights[insightIndex];
            datasetName.textContent = datasets[currentDataset].name;
        }
        
        // Update visual indicator
        if(liveChart) {
            liveChart.style.background = `
                linear-gradient(90deg, #06b6d4 ${value}%, transparent ${value}%)
            `;
        }
    }
    
    if(range) {
        range.addEventListener('input', (e) => {
            updateDataStory(e.target.value);
        });
        
        // Initialize
        updateDataStory(range.value);
    }
    
    dataBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dataBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDataset = btn.dataset.dataset;
            if(range) updateDataStory(range.value);
        });
    });
}

// Copy to Clipboard with Toast
function initCopyToClipboard() {
    const email = 'unathibasholo@gmail.com';
    const phone = '+27 630 167 901';
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-mono text-sm">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Add copy functionality to contact info
    document.addEventListener('click', (e) => {
        const contactText = e.target.closest('.contact-text');
        if (contactText) {
            const text = contactText.textContent.trim();
            if (text.includes('@')) {
                navigator.clipboard.writeText(email);
                showToast('透 Email copied to clipboard!');
            } else if (text.includes('+')) {
                navigator.clipboard.writeText(phone);
                showToast('到 Phone number copied!');
            }
        }
    });
}

// Smooth Page Transitions
function initSmoothTransitions() {
    document.documentElement.classList.add('page-transition');
    
    // Add smooth exit for internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link && link.href && !link.target && 
            link.hostname === window.location.hostname &&
            !link.href.includes('#') &&
            (link.href.endsWith('.html') || link.href === window.location.origin + '/')) {
            
            e.preventDefault();
            document.documentElement.style.opacity = '0';
            document.documentElement.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        }
    });
}

// Enhanced Theme Toggle Animation (Updated for Shadow DOM)
function enhanceThemeToggle() {
    document.addEventListener('click', (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        const toggle = path.find(el => el.classList && el.classList.contains('theme-toggle')) || e.target.closest('.theme-toggle');
        
        if (toggle) {
            toggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                toggle.style.transform = '';
            }, 150);
        }
    });
}

// Personality Micro-copy
function injectPersonality() {
    // Add personality to empty states
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.innerHTML = `
            <div class="text-center">
                <div class="text-6xl mb-4">投</div>
                <p class="text-slate-500 font-mono">No data found for these parameters.</p>
                <p class="text-sm text-slate-400 mt-2">Try broadening your search - the insights are hiding!</p>
            </div>
        `;
    }
    
    // Update page titles with personality
    const titles = {
        'Data Lab': '溌 Data Lab - Where Insights Get Built',
        'Contact': '町 Let\'s Talk Data - Get In Touch',
        'Kekeletso Basholo': '噫 Kekeletso Basholo - Data Storyteller'
    };
    
    const currentTitle = document.title;
    if (titles[currentTitle]) {
        document.title = titles[currentTitle];
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
    
    // Observe project cards
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });
}
