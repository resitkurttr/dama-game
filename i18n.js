/**
 * Tonton Game - I18n (Internationalization)
 * Otomatik dil algilama: Telegram > browser > localStorage
 *
 * Kullanim:
 *   1. Sayfaya ekle: <script src="i18n.js"></script>
 *   2. HTML'de data-i18n="KEY" kullan (orn: data-i18n="btn.serve")
 *   3. JS'de: t('btn.serve') veya i18n.t('btn.serve')
 *
 * Manuel dil degistirme: i18n.setLocale('en') veya localStorage.setItem('tonton-lang','en')
 */

(function(global) {
    'use strict';

    // ═══ ÇEVİRİLER ═══
    // Desteklenen diller: Telegram destekli tum diller (https://t.me/setlanguage/)
    // https://core.telegram.org/bots/api - language_code
    var TRANSLATIONS = {
        // Turkce (varsayilan)
        tr: {
            // Genel
            'app.name': 'Tonton Game',
            'app.back': 'Ana Sayfa',

            // Oyun modlari
            'mode.ai': 'AI',
            'mode.2p': '2 Kişilik',
            'mode.pvp': 'Online',

            // Oyuncu isimleri
            'player.you': 'Sen',
            'player.opponent': 'Rakip',
            'player.player2': '2. Oyuncu',
            'player.ai': 'AI',

            // Skor
            'score.you': 'Sen: {0}',
            'score.opponent': 'Rakip: {0}',
            'score.player2': '2. Oyuncu: {0}',
            'score.you_win': 'Sen {0} - {1} Kazandın! 🏆',
            'score.opponent_wins': 'Rakip {0} - {1} Kazandı! 🏆',

            // Butonlar
            'btn.serve': 'SERVE',
            'btn.servis': 'SERVİS',
            'btn.new_game': 'Yeni Oyun',
            'btn.undo': 'Geri Al',
            'btn.retry': 'Tekrar',
            'btn.play': 'Oyna',
            'btn.confirm': 'Tamam',
            'btn.cancel': 'İptal',

            // Mesajlar (oyun ici)
            'msg.press_serve': 'Servis atmak için butona bas',
            'msg.you_served': 'Sen servis attın!',
            'msg.opp_serving': 'Rakip servis atıyor...',
            'msg.your_turn': 'Senin sıran',
            'msg.opp_turn': 'Rakibin sırası',
            'msg.you_won': 'Sen Kazandın! 🏆',
            'msg.you_lost': 'Kaybettin 😔',
            'msg.draw': 'Berabere 🤝',
            'msg.select_piece': 'Taş seç',
            'msg.move_piece': 'Taşı oynat',
            'msg.must_jump': 'Zıplaman gerekiyor!',
            'msg.connect_wallet': 'Cüzdan Bağla',

            // Dama ozel
            'dama.title': 'Dama',
            'dama.crowned': 'Kral!',
            'dama.turn_you': 'Sıran',
            'dama.turn_ai': 'AI düşünüyor...',
            'dama.pieces': 'taş',
            'dama.all_captured': 'Tüm taşlar yok edildi',
            'dama.no_moves': 'Hamle hakkı yok',

            // Ping pong ozel
            'pingpong.title': 'Ping Pong',
            'pingpong.first_to': 'İlk 5 olan kazanır',

            // Mangala ozel
            'mangala.title': 'Mangala',
            'mangala.your_pits': 'Senin Çukurların',
            'mangala.opp_pits': 'Rakibin Çukurları',
            'mangala.stores': 'Hazneler',
            'mangala.continue': 'Devam',

            // PvP
            'pvp.finding': 'Rakip aranıyor...',
            'pvp.connected': 'Bağlandı! Oyun başlıyor',
            'pvp.disconnected': 'Bağlantı kesildi',
            'pvp.opponent_left': 'Rakip ayrıldı',

            // Genel UI
            'ui.loading': 'Yükleniyor...',
            'ui.error': 'Bir hata oluştu',
            'ui.try_again': 'Tekrar Dene',
            'ui.lang': 'Dil',
        },

        // Ingilizce
        en: {
            // Genel
            'app.name': 'Tonton Game',
            'app.back': 'Home',

            // Oyun modlari
            'mode.ai': 'AI',
            'mode.2p': '2 Players',
            'mode.pvp': 'Online',

            // Oyuncu isimleri
            'player.you': 'You',
            'player.opponent': 'Opponent',
            'player.player2': 'Player 2',
            'player.ai': 'AI',

            // Skor
            'score.you': 'You: {0}',
            'score.opponent': 'Opponent: {0}',
            'score.player2': 'Player 2: {0}',
            'score.you_win': 'You won {0} - {1}! 🏆',
            'score.opponent_wins': 'Opponent won {0} - {1}! 🏆',

            // Butonlar
            'btn.serve': 'SERVE',
            'btn.servis': 'SERVE',
            'btn.new_game': 'New Game',
            'btn.undo': 'Undo',
            'btn.retry': 'Retry',
            'btn.play': 'Play',
            'btn.confirm': 'OK',
            'btn.cancel': 'Cancel',

            // Mesajlar
            'msg.press_serve': 'Press button to serve',
            'msg.you_served': 'You served!',
            'msg.opp_serving': 'Opponent is serving...',
            'msg.your_turn': 'Your turn',
            'msg.opp_turn': "Opponent's turn",
            'msg.you_won': 'You Won! 🏆',
            'msg.you_lost': 'You Lost 😔',
            'msg.draw': 'Draw 🤝',
            'msg.select_piece': 'Select piece',
            'msg.move_piece': 'Move piece',
            'msg.must_jump': 'You must jump!',
            'msg.connect_wallet': 'Connect Wallet',

            // Dama
            'dama.title': 'Checkers',
            'dama.crowned': 'King!',
            'dama.turn_you': 'Your turn',
            'dama.turn_ai': 'AI thinking...',
            'dama.pieces': 'pieces',
            'dama.all_captured': 'All pieces captured',
            'dama.no_moves': 'No moves left',

            // Ping pong
            'pingpong.title': 'Ping Pong',
            'pingpong.first_to': 'First to 5 wins',

            // Mangala
            'mangala.title': 'Mangala',
            'mangala.your_pits': 'Your Pits',
            'mangala.opp_pits': "Opponent's Pits",
            'mangala.stores': 'Stores',
            'mangala.continue': 'Continue',

            // PvP
            'pvp.finding': 'Finding opponent...',
            'pvp.connected': 'Connected! Game starting',
            'pvp.disconnected': 'Disconnected',
            'pvp.opponent_left': 'Opponent left',

            // Genel
            'ui.loading': 'Loading...',
            'ui.error': 'An error occurred',
            'ui.try_again': 'Try Again',
            'ui.lang': 'Language',
        }
    };

    // ═══ DİL ALGILAMA ═══
    function detectLanguage() {
        // 1. localStorage (kullanici manuel degistirmis olabilir)
        try {
            var saved = localStorage.getItem('tonton-lang');
            if (saved && TRANSLATIONS[saved]) return saved;
        } catch(e) {}

        // 2. Telegram WebApp API (en guvenilir)
        try {
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
                var user = window.Telegram.WebApp.initDataUnsafe.user;
                if (user && user.language_code) {
                    var lang = user.language_code.toLowerCase().split('-')[0];  // 'tr-TR' -> 'tr'
                    if (TRANSLATIONS[lang]) return lang;
                }
            }
        } catch(e) {}

        // 3. navigator.language
        try {
            var nav = (navigator.language || 'en').toLowerCase().split('-')[0];
            if (TRANSLATIONS[nav]) return nav;
        } catch(e) {}

        // 4. Fallback
        return 'tr';
    }

    // ═══ ÇEVİRİ FONKSİYONU ═══
    function t(key) {
        var locale = state.locale;
        var trans = TRANSLATIONS[locale] || TRANSLATIONS.tr;
        return trans[key] || TRANSLATIONS.tr[key] || key;
    }

    // ═══ PLACEHOLDER DESTEĞİ (score.you: {0} gibi) ═══
    function format(key) {
        var template = t(key);
        for (var i = 1; i < arguments.length; i++) {
            template = template.replace('{' + (i-1) + '}', arguments[i]);
        }
        return template;
    }

    // ═══ DOM'A UYGULA ═══
    function applyDOM(root) {
        root = root || document;
        var nodes = root.querySelectorAll('[data-i18n]');
        nodes.forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            var html = el.getAttribute('data-i18n-html') === 'true';
            if (html) el.innerHTML = t(key);
            else el.textContent = t(key);
        });

        // Placeholder'lar (input/title vs.)
        var attrs = ['title', 'placeholder', 'aria-label'];
        attrs.forEach(function(attr) {
            var nodes2 = root.querySelectorAll('[data-i18n-' + attr + ']');
            nodes2.forEach(function(el) {
                var key = el.getAttribute('data-i18n-' + attr);
                el.setAttribute(attr, t(key));
            });
        });
    }

    // ═══ DURUM ═══
    var state = {
        locale: detectLanguage()
    };

    // ═══ PUBLİC API ═══
    var i18n = {
        t: t,
        format: format,
        applyDOM: applyDOM,
        setLocale: function(newLocale) {
            if (!TRANSLATIONS[newLocale]) return false;
            state.locale = newLocale;
            try { localStorage.setItem('tonton-lang', newLocale); } catch(e) {}
            // html lang attr guncelle
            document.documentElement.lang = newLocale;
            applyDOM();
            // Event dispatch - oyun script'leri dinleyebilir
            window.dispatchEvent(new CustomEvent('tonton:localechange', { detail: { locale: newLocale } }));
            return true;
        },
        getLocale: function() { return state.locale; },
        getSupportedLocales: function() { return Object.keys(TRANSLATIONS); },
        // Desteklenmeyen dil icin fallback
        addLocale: function(code, dict) {
            TRANSLATIONS[code] = dict;
        }
    };

    // HTML lang attr baslangicta ayarla
    try { document.documentElement.lang = state.locale; } catch(e) {}

    // DOMContentLoaded'da otomatik uygula
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { applyDOM(); });
    } else {
        // Eger sayfa zaten yuklenmisse, applyDOM'u bir tick sonra cagir
        // (oyun scriptleri oncelikli calissin)
        setTimeout(function() { applyDOM(); }, 0);
    }

    global.i18n = i18n;
    global.t = t;
})(window);
