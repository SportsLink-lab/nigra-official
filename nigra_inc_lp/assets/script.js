document.addEventListener('DOMContentLoaded', () => {
    // Check if gsap is available
    if (typeof gsap === 'undefined') {
        forceShow();
        return;
    }

    // Register plugins safely
    const plugins = [ScrollTrigger];
    if (typeof TextPlugin !== 'undefined') {
        plugins.push(TextPlugin);
    }
    gsap.registerPlugin(...plugins);

    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text');
    const path = window.location.pathname;
    const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('nigra_inc_lp/') || path === '';

    // 4. 強制表示ロジック (さらに強化: bodyのスタイルも制御)
    function forceShow() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
        document.querySelectorAll('.reveal').forEach(el => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.transform = 'none';
        });
        document.body.style.overflow = 'visible';
        document.body.style.opacity = '1';
    }

    // セーフティネット: 1.5秒経過したら何があっても表示
    const safetyTimer = setTimeout(forceShow, 1500);

    // 1. ホームページ・アニメーション
    if (isHomePage && loader && loaderText && typeof TextPlugin !== 'undefined') {
        const tl = gsap.timeline();

        tl.to(loaderText, {
            duration: 1.0,
            text: { value: "可能性を加速させる", delimiter: "" },
            ease: "none",
            delay: 0.2
        });

        tl.to(loader, {
            duration: 0.6,
            opacity: 0,
            delay: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                clearTimeout(safetyTimer);
                loader.style.display = 'none';
                startScrollAnimations();
            }
        });
    } else {
        // サブページやプラグイン不足時は即時フェードアウト開始
        if (loader) {
            gsap.to(loader, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                    clearTimeout(safetyTimer);
                    loader.style.display = 'none';
                    forceShow(); // Ensure everything is visible
                    startScrollAnimations();
                }
            });
        } else {
            forceShow();
            startScrollAnimations();
        }
    }

    function startScrollAnimations() {
        if (typeof ScrollTrigger === 'undefined') return;

        document.querySelectorAll('.reveal').forEach((el) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 92%",
                    toggleActions: "play none none none"
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    }

    // CMS logic unification: load latest news on home
    if (isHomePage) {
        loadLatestNews();
    }

    // SportsLink Tab Switcher
    const tabButtons = document.querySelectorAll('.sl-tab-btn');
    const tabContents = document.querySelectorAll('.sl-tab-content');
    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-tab');
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => {
                    c.classList.remove('active');
                    if (c.id === targetId) {
                        c.classList.add('active');
                        gsap.fromTo(c, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
                    }
                });
                btn.classList.add('active');
            });
        });
    }
});

function loadLatestNews() {
    const STORAGE_KEY = 'nigra_news_data';
    const data = localStorage.getItem(STORAGE_KEY);
    const container = document.getElementById('home-news-list');
    if (!container) return;

    if (data) {
        let news = JSON.parse(data);
        news.sort((a, b) => new Date(b.date.replace(/\./g, '/')) - new Date(a.date.replace(/\./g, '/')));
        const latest = news.slice(0, 3);

        container.innerHTML = '';
        latest.forEach(item => {
            const a = document.createElement('a');
            a.href = `news-detail.html?id=${item.id}`;
            a.className = 'news-item-link reveal';
            a.innerHTML = `
                <div class="news-header">
                    <span class="news-date">${item.date}</span>
                    <span class="news-title">${item.title}</span>
                    <span class="news-arrow">→</span>
                </div>
            `;
            container.appendChild(a);
        });
    }
}
