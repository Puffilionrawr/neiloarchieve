/**
 * Ruang Fiksi - Neilo Archive
 * Skrip Interaktivitas:
 * 1. Pengaturan Mode Baca (Tema & Ukuran Font)
 * 2. Indikator Kemajuan Membaca (Scroll Progress Bar)
 * 3. Filter Kategori Beranda
 * 4. Salin Tautan Cerpen
 * 5. Sistem Rating Bintang 1-5 (Maksimal 1 kali per akun/email per cerpen)
 * 6. Sistem Komentar & Ulasan Pembaca
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
        initStoryFeedback();
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
        }, 3200);
    }

    window.neiloToast = showToast;

    /* ==========================================================================
       DATA SEED DAN SISTEM KOMENTAR & RATING BINTANG
       ========================================================================== */

    const SEED_DATA = {
        'pemustaka-yang-bijak': {
            ratings: {
                'aris.munandar@gmail.com': { stars: 5, date: '2026-08-24' },
                'dian.k@outlook.com': { stars: 4, date: '2026-08-25' },
                'budi.santoso@yahoo.com': { stars: 5, date: '2026-08-26' },
                'citra.dewi@gmail.com': { stars: 4, date: '2026-08-28' }
            },
            comments: [
                {
                    id: 'seed_p1',
                    name: 'Aris Munandar',
                    email: 'aris.munandar@gmail.com',
                    rating: 5,
                    date: '24 Agustus 2026',
                    text: 'Paling suka bagian si remaja yang bawa novel zero to hero. Nyata banget banyak orang di dunia nyata dan media sosial yang sok bijak tanpa paham konteks lapangan.'
                },
                {
                    id: 'seed_p2',
                    name: 'Dian Kartika',
                    email: 'dian.k@outlook.com',
                    rating: 4,
                    date: '25 Agustus 2026',
                    text: 'Petugas perpustakaannya benar-benar representasi birokrasi yang cari aman. Karena takut dicap tidak adil, akhirnya malah menghukum korban dan pelaku sama rata. Satir yang tajam!'
                }
            ]
        },
        'pengakuan': {
            ratings: {
                'farhan.y@gmail.com': { stars: 5, date: '2025-08-19' },
                's.clarissa@yahoo.com': { stars: 5, date: '2025-08-20' },
                'reza.mahendra@gmail.com': { stars: 4, date: '2025-08-22' },
                'alya.putri@gmail.com': { stars: 5, date: '2025-08-25' }
            },
            comments: [
                {
                    id: 'seed_pg1',
                    name: 'Farhan Yudha',
                    email: 'farhan.y@gmail.com',
                    rating: 5,
                    date: '19 Agustus 2025',
                    text: 'Monolog Meruem sangat dalam. Gejolak imposter syndrome dan rasa tak pantas dicintai itu nyata banget dirasakan oleh orang-orang yang terbiasa hidup terasing.'
                },
                {
                    id: 'seed_pg2',
                    name: 'Sarah Clarissa',
                    email: 's.clarissa@yahoo.com',
                    rating: 5,
                    date: '20 Agustus 2025',
                    text: 'Kutipan tentang dentang lonceng jam Rosalt sangat membekas. Surat Zevanka yang manis berbanding terbalik dengan kecurigaan patologis Meruem di akhir. Cerita yang menyayat hati.'
                }
            ]
        },
        'perempuan-di-pinggir-jalan': {
            ratings: {
                'bagus.pras@gmail.com': { stars: 5, date: '2026-08-01' },
                'nurul.h@gmail.com': { stars: 5, date: '2026-08-02' },
                'agus.setiawan@gmail.com': { stars: 4, date: '2026-08-03' }
            },
            comments: [
                {
                    id: 'seed_pr1',
                    name: 'Bagus Prasetyo',
                    email: 'bagus.pras@gmail.com',
                    rating: 5,
                    date: '1 Agustus 2026',
                    text: 'Peralihan suasananya halus tapi menohok. Dari obrolan ojol yang santai dan humoris tentang ketiak robek, tiba-tiba masuk ke momen tangan menembus badan. Merinding.'
                },
                {
                    id: 'seed_pr2',
                    name: 'Nurul Hidayati',
                    email: 'nurul.h@gmail.com',
                    rating: 5,
                    date: '2 Agustus 2026',
                    text: 'Bagian memikirkan adik yang masih SD dan belum sempat melihatnya memakai toga benar-benar bikin sesak dada. Menggambarkan kerasnya realitas hidup kelas pekerja.'
                }
            ]
        },
        'satu-hari-seribu-kali': {
            ratings: {
                'kevin.ramadhan@gmail.com': { stars: 5, date: '2026-08-01' },
                'tiara.ang@gmail.com': { stars: 5, date: '2026-08-02' },
                'dimas.aditya@gmail.com': { stars: 5, date: '2026-08-03' },
                'fani.oktav@gmail.com': { stars: 4, date: '2026-08-04' }
            },
            comments: [
                {
                    id: 'seed_s1',
                    name: 'Kevin Ramadhan',
                    email: 'kevin.ramadhan@gmail.com',
                    rating: 5,
                    date: '1 Agustus 2026',
                    text: 'Karakter Luna sangat segar! Momen beli pembalut diskon 20% dan makan ramen blepotan beneran bikin ngakak. Romansa yang manis tanpa harus terasa dibuat-buat.'
                },
                {
                    id: 'seed_s2',
                    name: 'Tiara Anggraini',
                    email: 'tiara.ang@gmail.com',
                    rating: 5,
                    date: '2 Agustus 2026',
                    text: 'Kalimat terakhirnya juara: "Dan jika boleh memilih, aku ingin mengulang hari itu. Sampai seribu kali." Senang banget melihat proses sembuhnya Rayyan dari rasa takut.'
                }
            ]
        },
        'serigala-terkutuk': {
            ratings: {
                'hendra.k@gmail.com': { stars: 5, date: '2025-10-31' },
                'maya.safitri@yahoo.com': { stars: 5, date: '2025-11-01' },
                'doni.firmansyah@gmail.com': { stars: 4, date: '2025-11-02' }
            },
            comments: [
                {
                    id: 'seed_sg1',
                    name: 'Hendra Kusuma',
                    email: 'hendra.k@gmail.com',
                    rating: 5,
                    date: '31 Oktober 2025',
                    text: 'Sangat singkat tapi pukulannya telak. Fabel politik yang cerdas tentang bagaimana nalar kritis selalu dianggap ancaman oleh penjaga status quo.'
                },
                {
                    id: 'seed_sg2',
                    name: 'Maya Safitri',
                    email: 'maya.safitri@yahoo.com',
                    rating: 5,
                    date: '1 November 2025',
                    text: 'Kalimat penutupnya dingin sekali: "Bangsa serigala hidup makmur." Mengingatkan bahwa kemakmuran tanpa kebebasan berpikir adalah kepalsuan.'
                }
            ]
        },
        'tias-itu-orang-baik': {
            ratings: {
                'rizki.p@gmail.com': { stars: 5, date: '2026-08-01' },
                'siti.nur@gmail.com': { stars: 5, date: '2026-08-02' },
                'fajar.nugroho@gmail.com': { stars: 5, date: '2026-08-03' }
            },
            comments: [
                {
                    id: 'seed_t1',
                    name: 'Rizki Pratama',
                    email: 'rizki.p@gmail.com',
                    rating: 5,
                    date: '1 Agustus 2026',
                    text: 'Dialog di warkop Bang Aji sangat hidup dan membumi. Kebaikan itu bukan bahan perdebatan teori, melainkan tindakan nyata sehari-hari.'
                },
                {
                    id: 'seed_t2',
                    name: 'Siti Nurhaliza',
                    email: 'siti.nur@gmail.com',
                    rating: 5,
                    date: '2 Agustus 2026',
                    text: 'Penggambaran daster robek dan cucian baju tetangga milik ibu Tias sangat menyentuh. Jawaban Tias di kelas adalah bentuk penghormatan paling tulus untuk sang ibu.'
                }
            ]
        }
    };

    /**
     * Inisialisasi Kolom Rating & Komentar
     */
    function initStoryFeedback() {
        const feedbackSection = document.querySelector('.story-feedback-section');
        if (!feedbackSection) return;

        const storyId = feedbackSection.getAttribute('data-story-id');
        if (!storyId) return;

        // Ambil atau inisialisasi data storage
        ensureSeedData(storyId);

        // Ambil elemen DOM
        const avgScoreEl = document.getElementById('rating-average-score');
        const avgStarsEl = document.getElementById('rating-average-stars');
        const totalCountEl = document.getElementById('rating-total-count');
        const starWidgetEl = document.getElementById('star-rating-widget');
        const statusMsgEl = document.getElementById('rating-status-message');
        const commentForm = document.getElementById('comment-form');
        const nameInput = document.getElementById('comment-author-name');
        const emailInput = document.getElementById('comment-author-email');
        const bodyInput = document.getElementById('comment-body');
        const commentsContainer = document.getElementById('comments-container');
        const commentsCountEl = document.getElementById('comments-count');

        // Render akun pembaca yang tersimpan
        renderAccountInfo();

        // Render rating
        renderRatingOverview();

        // Render komentar
        renderComments();

        // Setup event listener untuk bintang rating
        setupStarRatingEvents();

        // Setup event listener untuk form komentar
        if (commentForm) {
            commentForm.addEventListener('submit', handleCommentSubmit);
        }

        /**
         * Pastikan seed data ada jika storage masih kosong
         */
        function ensureSeedData(id) {
            const ratingsKey = `neilo_ratings_${id}`;
            const commentsKey = `neilo_comments_${id}`;

            if (!localStorage.getItem(ratingsKey) && SEED_DATA[id]) {
                localStorage.setItem(ratingsKey, JSON.stringify(SEED_DATA[id].ratings));
            }
            if (!localStorage.getItem(commentsKey) && SEED_DATA[id]) {
                localStorage.setItem(commentsKey, JSON.stringify(SEED_DATA[id].comments));
            }
        }

        function getRatings() {
            try {
                return JSON.parse(localStorage.getItem(`neilo_ratings_${storyId}`)) || {};
            } catch (e) {
                return {};
            }
        }

        function saveRatings(ratings) {
            localStorage.setItem(`neilo_ratings_${storyId}`, JSON.stringify(ratings));
        }

        function getComments() {
            try {
                return JSON.parse(localStorage.getItem(`neilo_comments_${storyId}`)) || [];
            } catch (e) {
                return [];
            }
        }

        function saveComments(comments) {
            localStorage.setItem(`neilo_comments_${storyId}`, JSON.stringify(comments));
        }

        function getUserEmail() {
            return (localStorage.getItem('neilo_user_email') || '').trim().toLowerCase();
        }

        function getUserName() {
            return (localStorage.getItem('neilo_user_name') || '').trim();
        }

        function saveUserAccount(name, email) {
            if (name) localStorage.setItem('neilo_user_name', name.trim());
            if (email) localStorage.setItem('neilo_user_email', email.trim().toLowerCase());
            renderAccountInfo();
        }

        /**
         * Render Bilah Identitas Akun
         */
        function renderAccountInfo() {
            let accountBar = document.getElementById('account-info-bar');
            const currentEmail = getUserEmail();
            const currentName = getUserName();

            if (currentEmail) {
                if (!accountBar) {
                    accountBar = document.createElement('div');
                    accountBar.id = 'account-info-bar';
                    accountBar.className = 'account-bar';
                    const formCard = document.querySelector('.comment-form-card');
                    if (formCard) formCard.parentNode.insertBefore(accountBar, formCard);
                }
                accountBar.innerHTML = `
                    <span>Identitas Akun: <strong class="account-identity-text">${escapeHtml(currentName || currentEmail)}</strong> (${escapeHtml(currentEmail)})</span>
                    <button type="button" class="btn-switch-account" id="btn-switch-account">Ganti Akun</button>
                `;

                const switchBtn = document.getElementById('btn-switch-account');
                if (switchBtn) {
                    switchBtn.addEventListener('click', () => {
                        localStorage.removeItem('neilo_user_email');
                        localStorage.removeItem('neilo_user_name');
                        if (nameInput) nameInput.value = '';
                        if (emailInput) emailInput.value = '';
                        if (accountBar) accountBar.remove();
                        renderRatingOverview();
                        showToast('Silakan masukkan nama & email baru untuk beralih akun.');
                        if (emailInput) emailInput.focus();
                    });
                }

                if (nameInput && !nameInput.value) nameInput.value = currentName;
                if (emailInput && !emailInput.value) emailInput.value = currentEmail;
            } else if (accountBar) {
                accountBar.remove();
            }
        }

        /**
         * Render Statistik Rating & Status Pengguna
         */
        function renderRatingOverview() {
            const ratings = getRatings();
            const userEmail = getUserEmail();
            const entries = Object.entries(ratings);
            const totalCount = entries.length;

            let avg = 0;
            if (totalCount > 0) {
                const sum = entries.reduce((acc, curr) => acc + (Number(curr[1].stars) || 0), 0);
                avg = (sum / totalCount).toFixed(1);
            }

            if (avgScoreEl) avgScoreEl.textContent = totalCount > 0 ? avg : '0.0';
            if (totalCountEl) totalCountEl.textContent = `${totalCount} ulasan`;

            if (avgStarsEl) {
                const roundedAvg = Math.round(Number(avg) || 0);
                avgStarsEl.textContent = '★'.repeat(roundedAvg) + '☆'.repeat(5 - roundedAvg);
            }

            // Periksa apakah akun saat ini sudah pernah memberi rating
            const starButtons = starWidgetEl ? starWidgetEl.querySelectorAll('.star-btn') : [];
            const userVote = userEmail && ratings[userEmail] ? ratings[userEmail] : null;

            if (userVote) {
                // Pengguna SUDAH memberikan rating: KUNCI bintang
                const starsGiven = Number(userVote.stars) || 5;
                starButtons.forEach(btn => {
                    const val = Number(btn.getAttribute('data-value'));
                    btn.classList.toggle('active', val <= starsGiven);
                    btn.classList.remove('hover');
                    btn.setAttribute('disabled', 'true');
                });

                if (statusMsgEl) {
                    statusMsgEl.innerHTML = `
                        <span class="rating-badge-voted">
                            ✓ Anda telah memberikan rating ★${starsGiven} untuk cerpen ini
                        </span>
                    `;
                }
            } else {
                // Pengguna BELUM memberikan rating: Buka interaksi bintang
                starButtons.forEach(btn => {
                    btn.classList.remove('active', 'hover');
                    btn.removeAttribute('disabled');
                });

                if (statusMsgEl) {
                    statusMsgEl.textContent = userEmail
                        ? `Beri rating sebagai ${userEmail} (Maksimal 1x per cerpen)`
                        : 'Pilih bintang 1-5 untuk menilai cerpen ini (Maks. 1 kali per akun).';
                }
            }
        }

        /**
         * Event Hover dan Klik pada Bintang Rating
         */
        function setupStarRatingEvents() {
            if (!starWidgetEl) return;
            const starButtons = starWidgetEl.querySelectorAll('.star-btn');

            starButtons.forEach((btn, idx) => {
                btn.addEventListener('mouseenter', () => {
                    const userEmail = getUserEmail();
                    const ratings = getRatings();
                    if (userEmail && ratings[userEmail]) return; // Terkunci

                    starButtons.forEach((b, i) => {
                        b.classList.toggle('hover', i <= idx);
                    });
                });

                btn.addEventListener('mouseleave', () => {
                    starButtons.forEach(b => b.classList.remove('hover'));
                });

                btn.addEventListener('click', () => {
                    const starsSelected = Number(btn.getAttribute('data-value'));
                    handleRatingClick(starsSelected);
                });
            });
        }

        /**
         * Proses Klik Rating
         */
        function handleRatingClick(stars) {
            let userEmail = getUserEmail();
            let userName = getUserName();

            // Jika belum ada email tersimpan di storage, periksa dari form komentar
            if (!userEmail && emailInput && emailInput.value.trim()) {
                const candidateEmail = emailInput.value.trim().toLowerCase();
                if (validateEmail(candidateEmail)) {
                    userEmail = candidateEmail;
                    userName = nameInput ? nameInput.value.trim() : '';
                    saveUserAccount(userName, userEmail);
                }
            }

            // Jika masih belum ada identitas email akun
            if (!userEmail) {
                showToast('Masukkan email akun pembaca Anda pada form di bawah untuk mengonfirmasi rating.');
                if (statusMsgEl) {
                    statusMsgEl.innerHTML = '<span style="color: #e11d48; font-weight: 600;">⚠️ Masukkan email Anda di form komentar terlebih dahulu untuk memberikan rating.</span>';
                }
                if (emailInput) {
                    emailInput.focus();
                    emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const ratings = getRatings();

            // Cek apakah akun ini sudah pernah rating cerpen ini
            if (ratings[userEmail]) {
                showToast(`Akun ${userEmail} sudah pernah memberikan rating ★${ratings[userEmail].stars} untuk cerpen ini.`);
                renderRatingOverview();
                return;
            }

            // Simpan rating baru untuk akun ini
            ratings[userEmail] = {
                stars: stars,
                date: new Date().toISOString()
            };
            saveRatings(ratings);

            renderRatingOverview();
            showToast(`Terima kasih! Rating ★${stars} Anda berhasil disimpan.`);
        }

        /**
         * Submit Form Komentar
         */
        function handleCommentSubmit(e) {
            e.preventDefault();

            const name = (nameInput ? nameInput.value : '').trim();
            const email = (emailInput ? emailInput.value : '').trim().toLowerCase();
            const text = (bodyInput ? bodyInput.value : '').trim();

            if (!name) {
                showToast('Harap isi nama Anda.');
                if (nameInput) nameInput.focus();
                return;
            }

            if (!email || !validateEmail(email)) {
                showToast('Harap isi alamat email yang valid sebagai identitas akun.');
                if (emailInput) emailInput.focus();
                return;
            }

            if (!text || text.length < 3) {
                showToast('Komentar terlalu pendek (minimal 3 karakter).');
                if (bodyInput) bodyInput.focus();
                return;
            }

            // Simpan akun pembaca
            saveUserAccount(name, email);

            // Cek apakah akun ini memiliki rating di cerpen ini
            const ratings = getRatings();
            const userRating = ratings[email] ? ratings[email].stars : null;

            const comments = getComments();
            const newComment = {
                id: 'c_' + Date.now(),
                name: name,
                email: email,
                rating: userRating,
                date: formatTodayDate(),
                text: text
            };

            // Tambahkan komentar di urutan teratas
            comments.unshift(newComment);
            saveComments(comments);

            // Bersihkan form textarea
            if (bodyInput) bodyInput.value = '';

            // Update UI
            renderRatingOverview();
            renderComments();

            showToast('Komentar Anda berhasil dikirim!');
        }

        /**
         * Render Daftar Komentar
         */
        function renderComments() {
            if (!commentsContainer) return;
            const comments = getComments();

            if (commentsCountEl) {
                commentsCountEl.textContent = comments.length;
            }

            if (comments.length === 0) {
                commentsContainer.innerHTML = `
                    <div class="comments-empty">
                        Belum ada komentar untuk cerpen ini. Jadilah pembaca pertama yang memberikan ulasan!
                    </div>
                `;
                return;
            }

            commentsContainer.innerHTML = comments.map(c => {
                const initial = (c.name || 'U').charAt(0).toUpperCase();
                const starsDisplay = c.rating ? `<span class="comment-rating-stars" title="Rating: ${c.rating} bintang">${'★'.repeat(c.rating)}</span>` : '';

                return `
                    <div class="comment-item" id="${escapeHtml(c.id)}">
                        <div class="comment-item-header">
                            <div class="comment-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
                            <div class="comment-meta">
                                <div class="comment-author-name">
                                    <span>${escapeHtml(c.name)}</span>
                                    ${starsDisplay}
                                </div>
                                <span class="comment-date">${escapeHtml(c.date)}</span>
                            </div>
                        </div>
                        <p class="comment-body-text">${escapeHtml(c.text)}</p>
                    </div>
                `;
            }).join('');
        }

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function formatTodayDate() {
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            const now = new Date();
            return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
    }
})();
