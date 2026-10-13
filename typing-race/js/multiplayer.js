/**
 * Gerenciador Multiplayer em Tempo Real (Typing Race)
 * Suporte Híbrido: WebRTC P2P (PeerJS) para computadores em rede + BroadcastChannel para abas locais
 * SODIPROM - CAMP Diadema
 */

class RaceMultiplayer {
  constructor() {
    this.isHost = false;
    this.roomCode = null;
    this.playerName = "Piloto";
    this.carColor = "red";
    this.opponentName = "Oponente";
    this.opponentCarColor = "blue";
    this.isConnected = false;

    // WebRTC PeerJS
    this.peer = null;
    this.dataConnection = null;

    // Local BroadcastChannel (fallback instantâneo)
    this.broadcastChannel = null;

    // Callbacks
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * Cria uma nova sala de corrida (HOST)
   */
  createRoom(playerName, carColor) {
    this.isHost = true;
    this.playerName = playerName || "Piloto 1";
    this.carColor = carColor || "red";
    this.roomCode = this.generateRoomCode();

    // Inicializa BroadcastChannel local
    this.initBroadcastChannel(this.roomCode);

    // Inicializa PeerJS (se PeerJS estiver carregado no window)
    this.initPeerHost(this.roomCode);

    return this.roomCode;
  }

  /**
   * Conecta a uma sala existente (GUEST)
   */
  joinRoom(roomCode, playerName, carColor) {
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();
    this.playerName = playerName || "Piloto 2";
    this.carColor = carColor || "blue";

    // Inicializa BroadcastChannel local
    this.initBroadcastChannel(this.roomCode);

    // Inicializa PeerJS cliente
    this.initPeerGuest(this.roomCode);

    // Envia sinal inicial de entrada
    setTimeout(() => {
      this.sendPacket({
        type: 'GUEST_JOINED',
        playerName: this.playerName,
        carColor: this.carColor
      });
    }, 400);
  }

  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  initBroadcastChannel(roomCode) {
    try {
      if (window.BroadcastChannel) {
        if (this.broadcastChannel) this.broadcastChannel.close();
        this.broadcastChannel = new BroadcastChannel(`sodiprom_race_${roomCode}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingPacket(event.data);
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel não suportado neste navegador", e);
    }
  }

  initPeerHost(roomCode) {
    if (!window.Peer) return;

    try {
      const peerId = `sodi-race-${roomCode.toLowerCase()}`;
      this.peer = new Peer(peerId, {
        debug: 1
      });

      this.peer.on('open', (id) => {
        this.emit('HOST_READY', { roomCode });
      });

      this.peer.on('connection', (conn) => {
        this.dataConnection = conn;
        this.setupConnectionHandlers(conn);
      });

      this.peer.on('error', (err) => {
        console.warn("PeerJS Host notice:", err);
      });
    } catch (e) {
      console.warn("Falha ao inicializar PeerJS host", e);
    }
  }

  initPeerGuest(roomCode) {
    if (!window.Peer) return;

    try {
      this.peer = new Peer({
        debug: 1
      });

      this.peer.on('open', () => {
        const targetId = `sodi-race-${roomCode.toLowerCase()}`;
        const conn = this.peer.connect(targetId);
        this.dataConnection = conn;
        this.setupConnectionHandlers(conn);
      });

      this.peer.on('error', (err) => {
        console.warn("PeerJS Guest notice:", err);
      });
    } catch (e) {
      console.warn("Falha ao inicializar PeerJS guest", e);
    }
  }

  setupConnectionHandlers(conn) {
    conn.on('open', () => {
      this.isConnected = true;
      if (!this.isHost) {
        this.sendPacket({
          type: 'GUEST_JOINED',
          playerName: this.playerName,
          carColor: this.carColor
        });
      }
    });

    conn.on('data', (data) => {
      this.handleIncomingPacket(data);
    });

    conn.on('close', () => {
      this.isConnected = false;
      this.emit('OPPONENT_DISCONNECTED');
    });
  }

  /**
   * Envia pacote para o oponente por WebRTC e BroadcastChannel
   */
  sendPacket(data) {
    // 1. Tenta via DataConnection (WebRTC)
    if (this.dataConnection && this.dataConnection.open) {
      try {
        this.dataConnection.send(data);
      } catch (e) {}
    }

    // 2. Tenta via BroadcastChannel (local/abas)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (e) {}
    }
  }

  /**
   * Processa pacotes recebidos
   */
  handleIncomingPacket(pkt) {
    if (!pkt || !pkt.type) return;

    switch (pkt.type) {
      case 'GUEST_JOINED':
        if (this.isHost) {
          this.opponentName = pkt.playerName;
          this.opponentCarColor = pkt.carColor;
          this.isConnected = true;

          // Responde com dados do Host
          this.sendPacket({
            type: 'HOST_ACK',
            hostName: this.playerName,
            carColor: this.carColor
          });

          this.emit('PLAYER_CONNECTED', {
            opponentName: this.opponentName,
            opponentCarColor: this.opponentCarColor,
            isHost: true
          });
        }
        break;

      case 'HOST_ACK':
        if (!this.isHost) {
          this.opponentName = pkt.hostName;
          this.opponentCarColor = pkt.carColor;
          this.isConnected = true;

          this.emit('PLAYER_CONNECTED', {
            opponentName: this.opponentName,
            opponentCarColor: this.opponentCarColor,
            isHost: false
          });
        }
        break;

      case 'START_RACE':
        this.emit('START_RACE', {
          textId: pkt.textId,
          startInMs: pkt.startInMs
        });
        break;

      case 'PROGRESS':
        this.emit('OPPONENT_PROGRESS', {
          progressPct: pkt.progressPct,
          wpm: pkt.wpm
        });
        break;

      case 'FINISH':
        this.emit('OPPONENT_FINISHED', {
          timeSecs: pkt.timeSecs,
          wpm: pkt.wpm,
          accuracy: pkt.accuracy
        });
        break;

      case 'REMATCH_REQUEST':
        this.emit('REMATCH_REQUESTED');
        break;
    }
  }

  /**
   * Host inicia a contagem da corrida
   */
  broadcastStartRace(textId, startInMs = 4000) {
    this.sendPacket({
      type: 'START_RACE',
      textId: textId,
      startInMs: startInMs
    });
  }

  /**
   * Envia progresso contínuo de digitação na pista (0 a 100%)
   */
  sendProgress(progressPct, wpm) {
    this.sendPacket({
      type: 'PROGRESS',
      progressPct: Math.min(100, Math.max(0, progressPct)),
      wpm: Math.round(wpm)
    });
  }

  /**
   * Envia conclusão da corrida na linha de chegada
   */
  sendFinish(timeSecs, wpm, accuracy) {
    this.sendPacket({
      type: 'FINISH',
      timeSecs: timeSecs,
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy)
    });
  }

  sendRematch() {
    this.sendPacket({
      type: 'REMATCH_REQUEST'
    });
  }

  disconnect() {
    if (this.dataConnection) {
      try { this.dataConnection.close(); } catch (e) {}
      this.dataConnection = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }
    this.isConnected = false;
  }
}

window.raceMultiplayer = new RaceMultiplayer();
