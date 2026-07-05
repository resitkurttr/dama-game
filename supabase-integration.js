/**
 * Tonton Game - Supabase Integration Module
 * 
 * Bu modül HTML5 Canvas oyunlarını Supabase ile entegre eder.
 * Gerçek zamanlı çoklu oyuncu desteği sağlar.
 * 
 * Kullanım:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-integration.js"></script>
 * 
 * Özellikler:
 * - Gerçek zamanlı oyun senkronizasyonu
 * - Otomatik eşleştirme
 * - Turnuva yönetimi
 * - Kullanıcı profilleri
 */

var TontonSupabase = (function() {
    'use strict';
    
    // ═══ CONFIGURATION ═══
    var config = {
        supabaseUrl: 'https://qkevfffrtsxvggcudqfz.supabase.co',
        supabaseKey: 'sb_publishable_NVVmFW3LU96Yme-OgEWViw_laRIv7MU',
        userId: null,
        username: null
    };
    
    // ═══ STATE ═══
    var state = {
        client: null,
        currentGame: null,
        gameStateChannel: null,
        onGameStateUpdate: null,
        onPlayerJoined: null,
        onGameEnd: null,
        connected: false
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
        
        // Supabase client'ı oluştur
        if (typeof supabase !== 'undefined') {
            state.client = supabase.createClient(config.supabaseUrl, config.supabaseKey);
            state.connected = true;
            console.log('[TontonSupabase] Initialized');
            return true;
        } else {
            console.warn('[TontonSupabase] Supabase JS not loaded');
            state.connected = false;
            return false;
        }
    }
    
    // ═══ USER MANAGEMENT ═══
    async function registerUser(telegramId, username, displayName) {
        if (!state.client) return null;
        
        try {
            // Kullanıcı var mı kontrol et
            var { data: existingUser } = await state.client
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();
            
            if (existingUser) {
                config.userId = existingUser.id;
                return existingUser;
            }
            
            // Yeni kullanıcı oluştur
            var { data: newUser, error } = await state.client
                .from('users')
                .insert({
                    telegram_id: telegramId,
                    username: username,
                    display_name: displayName
                })
                .select()
                .single();
            
            if (error) throw error;
            
            config.userId = newUser.id;
            console.log('[TontonSupabase] User registered:', newUser.id);
            return newUser;
        } catch (e) {
            console.error('[TontonSupabase] Registration error:', e);
            return null;
        }
    }
    
    // ═══ MATCHMAKING (EŞLEŞTİRME) ═══
    async function findMatch(gameType) {
        if (!state.client || !config.userId) return null;
        
        try {
            // Sıradaki rakibi ara
            var { data: waitingMatch } = await state.client
                .from('match_queue')
                .select('*')
                .eq('game_type', gameType)
                .eq('status', 'waiting')
                .neq('user_id', config.userId)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
            
            if (waitingMatch) {
                // Rakip bulundu! Yeni oyun oluştur
                return await createGame(gameType, waitingMatch.user_id);
            } else {
                // Sıraya gir
                return await joinQueue(gameType);
            }
        } catch (e) {
            // Hata olursa sıraya gir
            return await joinQueue(gameType);
        }
    }
    
    async function joinQueue(gameType) {
        if (!state.client || !config.userId) return null;
        
        try {
            // Önce eski sıralarımı temizle
            await state.client
                .from('match_queue')
                .delete()
                .eq('user_id', config.userId)
                .eq('status', 'waiting');
            
            // Yeni sıra kaydı oluştur
            var { data, error } = await state.client
                .from('match_queue')
                .insert({
                    user_id: config.userId,
                    game_type: gameType,
                    status: 'waiting'
                })
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('[TontonSupabase] Joined queue:', data.id);
            return { status: 'waiting', queueId: data.id };
        } catch (e) {
            console.error('[TontonSupabase] Queue error:', e);
            return null;
        }
    }
    
    async function cancelQueue() {
        if (!state.client || !config.userId) return;
        
        await state.client
            .from('match_queue')
            .delete()
            .eq('user_id', config.userId)
            .eq('status', 'waiting');
    }
    
    // ═══ GAME MANAGEMENT ═══
    async function createGame(gameType, opponentId) {
        if (!state.client || !config.userId) return null;
        
        try {
            // Yeni oyun oluştur
            var { data: game, error } = await state.client
                .from('games')
                .insert({
                    game_type: gameType,
                    status: 'playing',
                    player1_id: config.userId,
                    player2_id: opponentId
                })
                .select()
                .single();
            
            if (error) throw error;
            
            // Sıra kaydını güncelle
            await state.client
                .from('match_queue')
                .update({ 
                    status: 'matched',
                    matched_game_id: game.id 
                })
                .eq('user_id', opponentId)
                .eq('status', 'waiting');
            
            // Oyun durumu tablosu oluştur
            await state.client
                .from('game_state')
                .insert({
                    game_id: game.id,
                    state: JSON.stringify({
                        score: { player1: 0, player2: 0 },
                        ball: { x: 50, y: 50 },
                        paddles: { player1: 50, player2: 50 }
                    })
                });
            
            state.currentGame = game;
            console.log('[TontonSupabase] Game created:', game.id);
            
            // Gerçek zamanlı dinlemeyi başlat
            subscribeToGame(game.id);
            
            return game;
        } catch (e) {
            console.error('[TontonSupabase] Create game error:', e);
            return null;
        }
    }
    
    async function updateGameState(gameId, newState) {
        if (!state.client) return;
        
        try {
            await state.client
                .from('game_state')
                .update({
                    state: JSON.stringify(newState),
                    updated_at: new Date().toISOString()
                })
                .eq('game_id', gameId);
        } catch (e) {
            console.error('[TontonSupabase] Update state error:', e);
        }
    }
    
    async function endGame(gameId, winnerId, score) {
        if (!state.client) return;
        
        try {
            await state.client
                .from('games')
                .update({
                    status: 'finished',
                    winner_id: winnerId,
                    score_player1: score.player1,
                    score_player2: score.player2,
                    finished_at: new Date().toISOString()
                })
                .eq('id', gameId);
            
            console.log('[TontonSupabase] Game ended:', gameId);
        } catch (e) {
            console.error('[TontonSupabase] End game error:', e);
        }
    }
    
    // ═══ REAL-TIME SUBSCRIPTIONS ═══
    function subscribeToGame(gameId) {
        if (!state.client) return;
        
        // Eski aboneliği temizle
        if (state.gameStateChannel) {
            state.client.removeChannel(state.gameStateChannel);
        }
        
        // Yeni abonelik oluştur
        state.gameStateChannel = state.client
            .channel('game-' + gameId)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'game_state',
                    filter: 'game_id=eq.' + gameId
                },
                (payload) => {
                    console.log('[TontonSupabase] State update:', payload);
                    if (state.onGameStateUpdate) {
                        state.onGameStateUpdate(payload.new);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'games',
                    filter: 'id=eq.' + gameId
                },
                (payload) => {
                    console.log('[TontonSupabase] Game update:', payload);
                    if (payload.new.status === 'finished') {
                        if (state.onGameEnd) {
                            state.onGameEnd(payload.new);
                        }
                    }
                }
            )
            .subscribe();
        
        console.log('[TontonSupabase] Subscribed to game:', gameId);
    }
    
    function unsubscribeFromGame() {
        if (state.client && state.gameStateChannel) {
            state.client.removeChannel(state.gameStateChannel);
            state.gameStateChannel = null;
        }
    }
    
    // ═══ EVENT HANDLERS ═══
    function onGameStateUpdate(callback) {
        state.onGameStateUpdate = callback;
    }
    
    function onPlayerJoined(callback) {
        state.onPlayerJoined = callback;
    }
    
    function onGameEnd(callback) {
        state.onGameEnd = callback;
    }
    
    // ═══ TOURNAMENT ═══
    async function joinTournament(tournamentId) {
        if (!state.client || !config.userId) return null;
        
        try {
            var { data, error } = await state.client
                .from('tournament_players')
                .insert({
                    tournament_id: tournamentId,
                    user_id: config.userId
                })
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (e) {
            console.error('[TontonSupabase] Tournament join error:', e);
            return null;
        }
    }
    
    async function getTournaments() {
        if (!state.client) return [];
        
        var { data, error } = await state.client
            .from('tournaments')
            .select('*')
            .eq('status', 'registering')
            .order('start_time', { ascending: true });
        
        return data || [];
    }
    
    // ═══ PUBLIC API ═══
    function isConnected() {
        return state.client !== null && state.connected;
    }
    return {
        init: init,
        registerUser: registerUser,
        findMatch: findMatch,
        cancelQueue: cancelQueue,
        createGame: createGame,
        updateGameState: updateGameState,
        endGame: endGame,
        subscribeToGame: subscribeToGame,
        unsubscribeFromGame: unsubscribeFromGame,
        onGameStateUpdate: onGameStateUpdate,
        onPlayerJoined: onPlayerJoined,
        onGameEnd: onGameEnd,
        joinTournament: joinTournament,
        getTournaments: getTournaments,
        isConnected: isConnected,
        config: config,
        state: state
    };
})();
