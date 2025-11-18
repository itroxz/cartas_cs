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
        cards: [1, 2, 3, 4, 5, 6]
      },
      team2: {
        name: 'Time 2',
        side: 'TR', // CT ou TR
        cards: [1, 2, 3, 4, 5, 6]
      }
    },
    currentCard: null,
    preparedCard: null,
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
  data.teams.team1.cards = [1, 2, 3, 4, 5, 6];
  data.teams.team2.cards = [1, 2, 3, 4, 5, 6];
  data.currentCard = null;
  data.preparedCard = null;
  data.history = [];
  
  saveData(data);
  res.json({ success: true, message: 'Sistema resetado com sucesso' });
});

// Restaurar cartas de um time específico
app.post('/api/admin/restore-team', (req, res) => {
  const { team } = req.body;
  const data = readData();
  
  if (team === 'team1' || team === 'team2') {
    data.teams[team].cards = [1, 2, 3, 4, 5, 6];
    saveData(data);
    res.json({ success: true, team: data.teams[team] });
  } else {
    res.status(400).json({ success: false, error: 'Time inválido' });
  }
});

// ========== ROTAS OPERADOR ==========

// Obter informações de um time
app.get('/api/operator/team/:teamId', (req, res) => {
  const { teamId } = req.params;
  const data = readData();
  
  if (data.teams[teamId]) {
    res.json({
      name: data.teams[teamId].name,
      remainingCards: data.teams[teamId].cards.length,
      cards: data.teams[teamId].cards
    });
  } else {
    res.status(404).json({ error: 'Time não encontrado' });
  }
});

// Preparar uma carta (mostrar verso no OBS)
app.post('/api/operator/prepare', (req, res) => {
  const { team } = req.body;
  const data = readData();
  
  if (!data.teams[team]) {
    return res.status(400).json({ success: false, error: 'Time inválido' });
  }
  
  if (data.teams[team].cards.length === 0) {
    return res.status(400).json({ success: false, error: 'Não há mais cartas disponíveis' });
  }
  
  const nextCard = data.teams[team].cards[0];
  const teamSide = data.teams[team].side;
  const cardImage = getCardImage(nextCard, teamSide);
  
  data.preparedCard = {
    team: team,
    teamName: data.teams[team].name,
    teamSide: teamSide,
    cardNumber: nextCard,
    cardImage: cardImage,
    prepared: true
  };
  
  saveData(data);
  
  res.json({
    success: true,
    preparedCard: data.preparedCard,
    remainingCards: data.teams[team].cards.length
  });
});

// Revelar a carta preparada
app.post('/api/operator/reveal', (req, res) => {
  const data = readData();
  
  if (!data.preparedCard) {
    return res.status(400).json({ success: false, error: 'Nenhuma carta preparada. Prepare uma carta primeiro.' });
  }
  
  const team = data.preparedCard.team;
  
  // Remover a carta do pool
  const revealedCard = data.teams[team].cards.shift();
  const teamSide = data.teams[team].side;
  const cardImage = getCardImage(revealedCard, teamSide);
  
  // Atualizar carta atual
  data.currentCard = {
    team: team,
    teamName: data.teams[team].name,
    teamSide: teamSide,
    cardNumber: revealedCard,
    cardImage: cardImage,
    revealed: true,
    timestamp: Date.now()
  };
  
  // Adicionar ao histórico (manter últimas 20)
  if (!data.history) {
    data.history = [];
  }
  data.history.unshift({
    team: team,
    teamName: data.teams[team].name,
    teamSide: teamSide,
    cardNumber: revealedCard,
    cardImage: cardImage,
    timestamp: Date.now()
  });
  if (data.history.length > 20) {
    data.history = data.history.slice(0, 20);
  }
  
  // Limpar carta preparada
  data.preparedCard = null;
  
  saveData(data);
  
  res.json({
    success: true,
    card: data.currentCard,
    remainingCards: data.teams[team].cards.length
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
  res.write(`data: ${JSON.stringify(data.currentCard)}\n\n`);
  
  // Verificar mudanças a cada 500ms
  const interval = setInterval(() => {
    const currentData = readData();
    res.write(`data: ${JSON.stringify(currentData.currentCard)}\n\n`);
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
