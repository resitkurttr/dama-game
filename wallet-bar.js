/**
 * Tonton Game - Paylasilan Wallet Bar
 * Tum oyun sayfalarina eklenir. DOM'a sticky wallet bar'i inject eder.
 *
 * Kullanim:
 *   <script src="tonconnect-ui.min.js"></script>
 *   <script src="wallet-bar.js"></script>
 */
(function() {
    if (document.getElementById('tonton-wallet-bar')) return;

    // === CSS inject ===
    var css = document.createElement('style');
    css.textContent = `
        #tonton-wallet-bar {
            position: fixed; top: 0; left: 0; right: 0;
            background: rgba(10,1,24,0.92);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding: 8px 14px;
            display: flex; align-items: center; justify-content: space-between;
            gap: 8px; z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #fff;
        }
        #tonton-wallet-bar .tw-brand {
            display: flex; align-items: center; gap: 6px;
            font-size: 12px; font-weight: 600;
        }
        #tonton-wallet-bar .tw-brand-icon {
            width: 22px; height: 22px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border-radius: 6px;
            display: flex; align-items: center; justify-content: center;
            font-size: 13px;
        }
        #tonton-wallet-bar .tw-back {
            background: rgba(255,255,255,0.08);
            color: #fff; border: none;
            padding: 6px 10px; border-radius: 8px;
            font-size: 12px; cursor: pointer;
            font-family: inherit;
        }
        #tonton-wallet-bar .tw-balance {
            font-size: 11px;
            color: #FFD700; font-weight: 600;
            display: none;
            font-variant-numeric: tabular-nums;
        }
        #tonton-wallet-bar .tw-balance.show { display: inline; }
        #tonton-wallet-bar .tw-btn {
            background: linear-gradient(135deg, #0098EA, #0070a8);
            color: #fff; border: none;
            padding: 6px 12px; border-radius: 8px;
            font-size: 12px; font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,152,234,0.3);
            font-family: inherit;
            white-space: nowrap;
        }
        #tonton-wallet-bar .tw-btn.connected {
            background: linear-gradient(135deg, #10b981, #059669);
            box-shadow: 0 2px 10px rgba(16,185,129,0.3);
        }
    `;
    document.head.appendChild(css);

    // === HTML inject ===
    var bar = document.createElement('div');
    bar.id = 'tonton-wallet-bar';
    bar.innerHTML = [
        '<button class="tw-back" id="twBack">‹ Ana</button>',
        '<div class="tw-brand">',
        '  <div class="tw-brand-icon">🎮</div>',
        '  <span>Tonton</span>',
        '</div>',
        '<span class="tw-balance" id="twBalance"></span>',
        '<button class="tw-btn" id="twBtn">Cuzdan</button>'
    ].join('');
    document.body.appendChild(bar);

    // === Buton islemleri ===
    document.getElementById('twBack').addEventListener('click', function() {
        // Index sayfasina don
        var idx = location.pathname.replace(/[^/]*$/, 'index.html');
        location.href = idx;
    });

    var btn = document.getElementById('twBtn');
    var bal = document.getElementById('twBalance');

    var UI = (window.TON_CONNECT_UI && window.TON_CONNECT_UI.TonConnectUI) || window.TonConnectUI;
    if (!UI) {
        btn.textContent = 'Wallet Hata';
        btn.disabled = true;
        return;
    }

    var ui = new UI({
        manifestUrl: 'https://resitkurttr.github.io/dama-game/tonconnect-manifest.json'
    });

    function updateUI(w) {
        if (w && w.account) {
            var addr = w.account.address || '';
            var short = addr.slice(0,4) + '...' + addr.slice(-4);
            btn.textContent = short;
            btn.classList.add('connected');
            bal.classList.add('show');
            bal.textContent = 'TON';
        } else {
            btn.textContent = 'Cuzdan';
            btn.classList.remove('connected');
            bal.classList.remove('show');
        }
    }

    ui.onStatusChange(updateUI);

    btn.addEventListener('click', function() {
        if (ui.connected) {
            ui.disconnect();
        } else {
            ui.openModal();
        }
    });

    window._tontonUI = ui;
})();
