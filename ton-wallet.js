/**
 * Tonton Game - TON Wallet Integration Module
 * 
 * Bu modül HTML5 Canvas oyunlarından TON cüzdanına bağlanmayı sağlar.
 * Kullanım: <script src="ton-wallet.js"></script>
 * 
 * Özellikler:
 * - TonConnect UI ile cüzdan bağlantısı
 * - TON gönderme/alma
 * - İşlem geçmişi
 * - Testnet/Prodnet desteği
 */

var TontonWallet = (function() {
    'use strict';
    
    // ═══ CONFIGURATION ═══
    var config = {
        manifestUrl: 'https://resitkurttr.github.io/dama-game/tonconnect-manifest.json',
        testnet: true, // Development için testnet kullan
        testnetEndpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        mainnetEndpoint: 'https://toncenter.com/api/v2/jsonRPC',
        gameContractAddress: null // Smart contract address buraya eklenecek
    };
    
    // ═══ STATE ═══
    var state = {
        connected: false,
        address: null,
        balance: null,
        tonConnectUI: null,
        onConnect: null,
        onDisconnect: null,
        onBalanceUpdate: null
    };
    
    // ═══ INITIALIZATION ═══
    function init(options) {
        if (options) {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    config[key] = options[key];
                }
            }
        }
        
        // TonConnectUI'yi yükle
        if (typeof TonConnectUI !== 'undefined') {
            state.tonConnectUI = new TonConnectUI({
                manifestUrl: config.manifestUrl
            });
            
            // Bağlantı durumu değişikliklerini dinle
            state.tonConnectUI.onStatusChange(function(wallet) {
                if (wallet) {
                    state.connected = true;
                    state.address = wallet.address;
                    updateBalance();
                    if (state.onConnect) state.onConnect(wallet);
                } else {
                    state.connected = false;
                    state.address = null;
                    state.balance = null;
                    if (state.onDisconnect) state.onDisconnect();
                }
            });
            
            console.log('[TontonWallet] Initialized');
            return true;
        } else {
            console.warn('[TontonWallet] TonConnectUI not loaded');
            return false;
        }
    }
    
    // ═══ WALLET OPERATIONS ═══
    async function connect() {
        if (!state.tonConnectUI) {
            console.error('[TontonWallet] Not initialized');
            return null;
        }
        
        try {
            var connected = await state.tonConnectUI.connectWallet();
            return connected;
        } catch (e) {
            console.error('[TontonWallet] Connection rejected:', e);
            return null;
        }
    }
    
    async function disconnect() {
        if (state.tonConnectUI) {
            await state.tonConnectUI.disconnect();
        }
    }
    
    function isConnected() {
        return state.connected;
    }
    
    function getAddress() {
        return state.address;
    }
    
    async function updateBalance() {
        if (!state.address) return null;
        
        try {
            // Testnet/Mainnet endpoint seç
            var endpoint = config.testnet ? config.testnetEndpoint : config.mainnetEndpoint;
            
            // Basit balance sorgusu (gerçek projede @ton/ton kullanılmalı)
            var response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'getBalance',
                    params: [state.address],
                    id: 1
                })
            });
            
            var data = await response.json();
            if (data.result) {
                state.balance = data.result.balance / 1e9; // nanotons → TON
                if (state.onBalanceUpdate) state.onBalanceUpdate(state.balance);
                return state.balance;
            }
        } catch (e) {
            console.error('[TontonWallet] Balance error:', e);
        }
        return null;
    }
    
    // ═══ TRANSACTIONS ═══
    async function sendTON(toAddress, amount, payload) {
        if (!state.connected || !state.tonConnectUI) {
            console.error('[TontonWallet] Not connected');
            return null;
        }
        
        var transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 dakika
            messages: [{
                address: toAddress,
                amount: (amount * 1e9).toString(), // TON → nanotons
                payload: payload || ''
            }]
        };
        
        try {
            var result = await state.tonConnectUI.sendTransaction(transaction);
            console.log('[TontonWallet] Transaction sent:', result);
            await updateBalance();
            return result;
        } catch (e) {
            console.error('[TontonWallet] Transaction failed:', e);
            return null;
        }
    }
    
    async function placeBet(gameId, betAmount) {
        if (!config.gameContractAddress) {
            console.error('[TontonWallet] Game contract not configured');
            return null;
        }
        
        // Bet payload'ı oluştur (op: 0x1 = BET)
        var payload = buildBetPayload(gameId);
        
        return await sendTON(config.gameContractAddress, betAmount, payload);
    }
    
    // ═══ PAYLOAD BUILDERS ═══
    function buildBetPayload(gameId) {
        // Basit payload: op(32bit) + gameId(256bit)
        // Gerçek projede @ton/core ile Cell kullanın
        var hex = '00000001'; // op: BET
        hex += gameId.toString().padStart(64, '0'); // gameId
        return hex;
    }
    
    function buildSettlePayload(gameId, winnerAddress, prize) {
        var hex = '00000002'; // op: SETTLE
        hex += gameId.toString().padStart(64, '0');
        hex += winnerAddress.replace('0:', ''); // address
        hex += prize.toString(16).padStart(16, '0'); // prize in nanotons
        return hex;
    }
    
    // ═══ EVENT HANDLERS ═══
    function onConnect(callback) {
        state.onConnect = callback;
    }
    
    function onDisconnect(callback) {
        state.onDisconnect = callback;
    }
    
    function onBalanceUpdate(callback) {
        state.onBalanceUpdate = callback;
    }
    
    // ═══ PUBLIC API ═══
    return {
        init: init,
        connect: connect,
        disconnect: disconnect,
        isConnected: isConnected,
        getAddress: getAddress,
        getBalance: updateBalance,
        sendTON: sendTON,
        placeBet: placeBet,
        onConnect: onConnect,
        onDisconnect: onDisconnect,
        onBalanceUpdate: onBalanceUpdate,
        config: config
    };
})();

// Otomatik yükleme
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[TontonWallet] Ready');
    });
}
