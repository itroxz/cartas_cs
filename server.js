const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage (arquivo JSON simples)
const DATA_FILE = path.join(__dirname, 'data', 'system.json');

// Inicializar dados
function initializeData() {
  const defaultData = {
    teams: {
      team1: {
        name: 'Time 1',
        side: 'CT', // CT ou TR
        cards: [
          { number: 1, used: false, usedAt: null },
          { number: 2, used: false, usedAt: null },
          { number: 3, used: false, usedAt: null },
          { number: 4, used: false, usedAt: null },
          { number: 5, used: false, usedAt: null },
          { number: 6, used: false, usedAt: null }
        ]
      },
      team2: {
        name: 'Time 2',
        side: 'TR', // CT ou TR
        cards: [
          { number: 1, used: false, usedAt: null },
          { number: 2, used: false, usedAt: null },
          { number: 3, used: false, usedAt: null },
          { number: 4, used: false, usedAt: null },
          { number: 5, used: false, usedAt: null },
          { number: 6, used: false, usedAt: null }
        ]
      }
    },
    currentCard: null,
    history: [],
    lastUpdate: Date.now()
  };

  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// Ler dados
function readData() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Salvar dados
function saveData(data) {
  data.lastUpdate = Date.now();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Mapeamento de cartas
const cardImages = {
  1: 'cortina-fumaca.png',
  2: 'duro-dorme.png',
  3: 'golpe-katana.png',
  4: 'tommy-gun.png',
  5: 'vem-tranquilo.png',
  6: 'jogo-bicho' // Especial - depende do lado
};

// Obter imagem da carta baseada no número e lado do time
function getCardImage(cardNumber, side) {
  const card = cardImages[cardNumber];
  if (card === 'jogo-bicho') {
    return side === 'CT' ? 'ct-jogo-bicho.png' : 'tr-jogo-bicho.png';
  }
  return card;
}

// ========== ROTAS ADMIN ==========

// Obter estado completo do sistema
app.get('/api/admin/status', (req, res) => {
  const data = readData();
  res.json(data);
});

// Configurar nomes dos times
app.post('/api/admin/set-team-names', (req, res) => {
  const { team1Name, team2Name } = req.body;
  const data = readData();
  
  if (team1Name) data.teams.team1.name = team1Name;
  if (team2Name) data.teams.team2.name = team2Name;
  
  saveData(data);
  res.json({ success: true, teams: data.teams });
});

// Configurar lados CT/TR dos times
app.post('/api/admin/set-team-sides', (req, res) => {
  const { team1Side } = req.body;
  const data = readData();
  
  if (team1Side === 'CT' || team1Side === 'TR') {
    data.teams.team1.side = team1Side;
    data.teams.team2.side = team1Side === 'CT' ? 'TR' : 'CT';
    saveData(data);
    res.json({ success: true, teams: data.teams });
  } else {
    res.status(400).json({ success: false, error: 'Lado inválido' });
  }
});

// Resetar sistema completo
app.post('/api/admin/reset', (req, res) => {
  const data = readData();
  data.teams.team1.cards = [
    { number: 1, used: false, usedAt: null },
    { number: 2, used: false, usedAt: null },
    { number: 3, used: false, usedAt: null },
    { number: 4, used: false, usedAt: null },
    { number: 5, used: false, usedAt: null },
    { number: 6, used: false, usedAt: null }
  ];
  data.teams.team2.cards = [
    { number: 1, used: false, usedAt: null },
    { number: 2, used: false, usedAt: null },
    { number: 3, used: false, usedAt: null },
    { number: 4, used: false, usedAt: null },
    { number: 5, used: false, usedAt: null },
    { number: 6, used: false, usedAt: null }
  ];
  data.currentCard = null;
  data.history = [];
  
  saveData(data);
  res.json({ success: true, message: 'Sistema resetado com sucesso' });
});

// Restaurar cartas de um time específico
app.post('/api/admin/restore-team', (req, res) => {
  const { team } = req.body;
  const data = readData();
  
  if (team === 'team1' || team === 'team2') {
    data.teams[team].cards = [
      { number: 1, used: false, usedAt: null },
      { number: 2, used: false, usedAt: null },
      { number: 3, used: false, usedAt: null },
      { number: 4, used: false, usedAt: null },
      { number: 5, used: false, usedAt: null },
      { number: 6, used: false, usedAt: null }
    ];
    saveData(data);
    res.json({ success: true, team: data.teams[team] });
  } else {
    res.status(400).json({ success: false, error: 'Time inválido' });
  }
});

// ========== ROTAS OPERADOR ==========

// Obter informações de um time (com cartas completas)
app.get('/api/operator/team/:teamId', (req, res) => {
  const { teamId } = req.params;
  const data = readData();
  
  if (data.teams[teamId]) {
    const teamSide = data.teams[teamId].side;
    const cardsWithImages = data.teams[teamId].cards.map(card => ({
      number: card.number,
      used: card.used,
      usedAt: card.usedAt,
      image: getCardImage(card.number, teamSide),
      canClick: !card.used || (Date.now() - card.usedAt < 30000)
    }));
    
    res.json({
      name: data.teams[teamId].name,
      side: teamSide,
      cards: cardsWithImages
    });
  } else {
    res.status(404).json({ error: 'Time não encontrado' });
  }
});

// Revelar uma carta diretamente (novo sistema)
app.post('/api/operator/reveal-card', (req, res) => {
  const { team, cardNumber } = req.body;
  const data = readData();
  
  if (!data.teams[team]) {
    return res.status(400).json({ success: false, error: 'Time inválido' });
  }
  
  // Encontrar a carta
  const cardIndex = data.teams[team].cards.findIndex(c => c.number === cardNumber);
  
  if (cardIndex === -1) {
    return res.status(400).json({ success: false, error: 'Carta não encontrada' });
  }
  
  const card = data.teams[team].cards[cardIndex];
  
  // Verificar se já foi usada
  if (card.used) {
    return res.status(400).json({ success: false, error: 'Carta já foi usada' });
  }
  
  // Marcar carta como usada
  card.used = true;
  card.usedAt = Date.now();
  
  const teamSide = data.teams[team].side;
  const cardImage = getCardImage(cardNumber, teamSide);
  
  // Atualizar carta atual
  data.currentCard = {
    team: team,
    teamName: data.teams[team].name,
    teamSide: teamSide,
    cardNumber: cardNumber,
    cardImage: cardImage,
    timestamp: Date.now()
  };
  
  // Adicionar ao histórico
  if (!data.history) {
    data.history = [];
  }
  data.history.unshift({
    team: team,
    teamName: data.teams[team].name,
    teamSide: teamSide,
    cardNumber: cardNumber,
    cardImage: cardImage,
    timestamp: Date.now()
  });
  if (data.history.length > 20) {
    data.history = data.history.slice(0, 20);
  }
  
  saveData(data);
  
  res.json({
    success: true,
    card: data.currentCard
  });
});

// ========== ROTA JSON CARTA ATUAL ==========

app.get('/api/current-card', (req, res) => {
  const data = readData();
  res.json(data.currentCard || { message: 'Nenhuma carta revelada' });
});

// ========== ROTA SSE PARA AUTO-ATUALIZAÇÃO ==========

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Enviar dados iniciais
  const data = readData();
  res.write(`data: ${JSON.stringify({
    currentCard: data.currentCard
  })}\n\n`);
  
  // Verificar mudanças a cada 500ms
  const interval = setInterval(() => {
    const currentData = readData();
    res.write(`data: ${JSON.stringify({
      currentCard: currentData.currentCard
    })}\n\n`);
  }, 500);
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

// ========== PÁGINAS HTML ==========

// Painel Admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Painel Operador
app.get('/operator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'operator.html'));
});

// Página OBS
app.get('/obs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'obs.html'));
});

// Inicializar servidor
initializeData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🎴 Sistema de Cartas - Servidor Iniciado`);
  console.log(`=================================================`);
  console.log(`Painel Admin:    http://localhost:${PORT}/admin`);
  console.log(`Painel Operador: http://localhost:${PORT}/operator`);
  console.log(`Página OBS:      http://localhost:${PORT}/obs`);
  console.log(`API JSON:        http://localhost:${PORT}/api/current-card`);
  console.log(`=================================================`);
  console.log(`Acesso via rede local: http://[SEU-IP]:${PORT}`);
  console.log(`=================================================`);
});
