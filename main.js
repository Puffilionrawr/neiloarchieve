/**
 * Ruang Fiksi - Neilo Archive
 * Skrip interaktivitas: Pengaturan Mode Baca (Tema & Ukuran Font),
 * Indikator Kemajuan Membaca, Filter Kategori, dan Salin Tautan.
 */

(function () {
    'use strict';

    // Inisialisasi Tema dari localStorage
    const savedTheme = localStorage.getItem('neilo_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Inisialisasi Ukuran Font dari localStorage
    const savedFontSize = localStorage.getItem('neilo_font_size') || 'md';
    document.documentElement.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
    document.documentElement.classList.add(`font-${savedFontSize}`);

    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initFontSizeToggle();
        initReadingProgress();
        initCategoryFilter();
        initShareButtons();
    });

    /**
     * Pengalih Tema (Terang -> Sepia -> Gelap)
     */
    function initThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (!themeBtn) return;

        const themes = ['light', 'sepia', 'dark'];
        const labels = {
            light: 'Mode Terang',
            sepia: 'Mode Sepia',
            dark: 'Mode Gelap'
        };

        function updateButton(theme) {
            themeBtn.setAttribute('title', `Ganti tema (Saat ini: ${labels[theme]})`);
            themeBtn.setAttribute('aria-label', `Ganti tema (Saat ini: ${labels[theme]})`);
            const labelSpan = themeBtn.querySelector('.theme-label');
            if (labelSpan) labelSpan.textContent = labels[theme];
        }

        updateButton(document.documentElement.getAttribute('data-theme') || 'light');

        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
            const nextTheme = themes[nextIndex];

            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('neilo_theme', nextTheme);
            updateButton(nextTheme);
        });
    }

    /**
     * Pengatur Ukuran Font untuk Kenyamanan Membaca
     */
    function initFontSizeToggle() {
        const decBtn = document.getElementById('font-decrease-btn');
        const incBtn = document.getElementById('font-increase-btn');
        const sizes = ['sm', 'md', 'lg', 'xl'];

        function setFontSize(newSize) {
            sizes.forEach(s => document.documentElement.classList.remove(`font-${s}`));
            document.documentElement.classList.add(`font-${newSize}`);
            localStorage.setItem('neilo_font_size', newSize);
        }

        function getCurrentSize() {
            for (let s of sizes) {
                if (document.documentElement.classList.contains(`font-${s}`)) return s;
            }
            return 'md';
        }

        if (decBtn) {
            decBtn.addEventListener('click', () => {
                const current = getCurrentSize();
                const idx = sizes.indexOf(current);
                if (idx > 0) {
                    setFontSize(sizes[idx - 1]);
                }
            });
        }

        if (incBtn) {
            incBtn.addEventListener('click', () => {
                const current = getCurrentSize();
                const idx = sizes.indexOf(current);
                if (idx < sizes.length - 1) {
                    setFontSize(sizes[idx + 1]);
                }
            });
        }
    }

    /**
     * Indikator Kemajuan Membaca (Scroll Progress Bar)
     */
    function initReadingProgress() {
        const progressBar = document.getElementById('reading-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const docElement = document.documentElement;
            const body = document.body;
            const scrollTop = docElement.scrollTop || body.scrollTop;
            const scrollHeight = (docElement.scrollHeight || body.scrollHeight) - docElement.clientHeight;

            if (scrollHeight > 0) {
                const progress = (scrollTop / scrollHeight) * 100;
                progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
            } else {
                progressBar.style.width = '0%';
            }
        }, { passive: true });
    }

    /**
     * Filter Kategori di Beranda
     */
    function initCategoryFilter() {
        const filterBtns = document.querySelectorAll('.filter-pill');
        const cards = document.querySelectorAll('.story-card');

        if (!filterBtns.length || !cards.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                cards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (category === 'all' || cardCat === category) {
                        card.style.display = 'flex';
                        setTimeout(() => { card.style.opacity = '1'; }, 20);
                    } else {
                        card.style.display = 'none';
                        card.style.opacity = '0';
                    }
                });
            });
        });
    }

    /**
     * Tombol Bagikan / Salin Tautan
     */
    function initShareButtons() {
        const shareBtns = document.querySelectorAll('.btn-share-link');
        shareBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(() => {
                        showToast('Tautan cerpen berhasil disalin!');
                    }).catch(() => {
                        fallbackCopy(url);
                    });
                } else {
                    fallbackCopy(url);
                }
            });
        });
    }

    function fallbackCopy(text) {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        try {
            document.execCommand('copy');
            showToast('Tautan cerpen berhasil disalin!');
        } catch (e) {
            showToast('Gagal menyalin tautan secara otomatis.');
        }
        document.body.removeChild(input);
    }

    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    window.neiloToast = showToast;
})();
