// Operator Panel JavaScript

let selectedTeam = null;
let cardPrepared = false;
let teamData = {
    team1: { name: 'Time 1', cards: [] },
    team2: { name: 'Time 2', cards: [] }
};

// Carregar dados dos times
async function loadTeamsData() {
    try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();
        
        teamData.team1 = data.teams.team1;
        teamData.team2 = data.teams.team2;
        
        // Atualizar interface
        updateTeamButtons();
        
        // Atualizar histórico
        displayHistory(data.history);
        
        if (selectedTeam) {
            updateSelectedTeamInfo();
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao conectar com o servidor', 'error');
    }
}

// Atualizar botões dos times
function updateTeamButtons() {
    // Time 1
    document.getElementById('team1Name').textContent = teamData.team1.name;
    document.getElementById('team1Count').textContent = `${teamData.team1.cards.length} cartas`;
    
    const btn1 = document.getElementById('btnTeam1');
    if (teamData.team1.cards.length === 0) {
        btn1.classList.add('empty');
    } else {
        btn1.classList.remove('empty');
    }
    
    // Time 2
    document.getElementById('team2Name').textContent = teamData.team2.name;
    document.getElementById('team2Count').textContent = `${teamData.team2.cards.length} cartas`;
    
    const btn2 = document.getElementById('btnTeam2');
    if (teamData.team2.cards.length === 0) {
        btn2.classList.add('empty');
    } else {
        btn2.classList.remove('empty');
    }
}

// Selecionar time
function selectTeam(team) {
    selectedTeam = team;
    cardPrepared = false;
    
    // Atualizar visual dos botões
    document.getElementById('btnTeam1').classList.remove('selected');
    document.getElementById('btnTeam2').classList.remove('selected');
    document.getElementById(`btn${team.charAt(0).toUpperCase() + team.slice(1)}`).classList.add('selected');
    
    // Mostrar seção de time selecionado
    document.getElementById('selectedTeamSection').style.display = 'block';
    
    // Atualizar botões
    const prepareBtn = document.getElementById('prepareBtn');
    const revealBtn = document.getElementById('revealBtn');
    const hint = document.getElementById('revealHint');
    
    if (teamData[team].cards.length > 0) {
        prepareBtn.disabled = false;
        revealBtn.disabled = true;
        hint.textContent = 'Clique em "Preparar Carta" para mostrar o verso no OBS';
    } else {
        prepareBtn.disabled = true;
        revealBtn.disabled = true;
        hint.textContent = 'Este time não tem mais cartas disponíveis';
        showNotification('Este time não tem mais cartas disponíveis!', 'warning');
    }
    
    updateSelectedTeamInfo();
}

// Preparar carta (mostrar verso no OBS)
async function prepareCard() {
    if (!selectedTeam) {
        showNotification('Selecione um time primeiro!', 'warning');
        return;
    }
    
    if (teamData[selectedTeam].cards.length === 0) {
        showNotification('Este time não tem mais cartas!', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/operator/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team: selectedTeam })
        });
        
        const data = await response.json();
        
        if (data.success) {
            cardPrepared = true;
            showNotification('Carta preparada! O verso está visível no OBS', 'success');
            
            // Habilitar botão de revelar, desabilitar botão de preparar
            document.getElementById('prepareBtn').disabled = true;
            document.getElementById('revealBtn').disabled = false;
            document.getElementById('revealHint').textContent = 'Agora clique em "Revelar Carta" para virar a carta';
        } else {
            showNotification(data.error || 'Erro ao preparar carta', 'error');
        }
    } catch (error) {
        console.error('Erro ao preparar carta:', error);
        showNotification('Erro ao preparar carta', 'error');
    }
}

// Atualizar informações do time selecionado
function updateSelectedTeamInfo() {
    if (!selectedTeam) return;
    
    const team = teamData[selectedTeam];
    
    document.getElementById('selectedTeamName').textContent = team.name;
    document.getElementById('selectedTeamCards').textContent = team.cards.length;
    
    // Visualização de cartas
    const cardsVisual = document.getElementById('cardsVisual');
    cardsVisual.innerHTML = '';
    
    team.cards.forEach((cardNum) => {
        const cardIcon = document.createElement('div');
        cardIcon.className = 'card-icon';
        cardIcon.textContent = '🎴';
        cardsVisual.appendChild(cardIcon);
    });
}

// Revelar carta
async function revealCard() {
    if (!cardPrepared) {
        showNotification('Prepare a carta primeiro!', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/operator/reveal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Carta revelada com sucesso!', 'success');
            
            // Exibir última carta revelada
            displayLastRevealedCard(data.card);
            
            // Resetar estado
            cardPrepared = false;
            
            // Recarregar dados
            await loadTeamsData();
            
            // Atualizar botões
            const prepareBtn = document.getElementById('prepareBtn');
            const revealBtn = document.getElementById('revealBtn');
            const hint = document.getElementById('revealHint');
            
            if (teamData[selectedTeam].cards.length > 0) {
                prepareBtn.disabled = false;
                revealBtn.disabled = true;
                hint.textContent = 'Prepare a próxima carta';
            } else {
                prepareBtn.disabled = true;
                revealBtn.disabled = true;
                hint.textContent = 'Não há mais cartas disponíveis para este time';
            }
        } else {
            showNotification(data.error || 'Erro ao revelar carta', 'error');
        }
    } catch (error) {
        console.error('Erro ao revelar carta:', error);
        showNotification('Erro ao revelar carta', 'error');
    }
}

// Exibir última carta revelada
function displayLastRevealedCard(card) {
    const container = document.getElementById('lastRevealedCard');
    
    const date = new Date(card.timestamp);
    const timeStr = date.toLocaleTimeString('pt-BR');
    
    container.innerHTML = `
        <div class="revealed-card">
            <img src="/cartas/${card.cardImage}" alt="${card.teamName}" class="revealed-card-image">
            <div class="revealed-info">
                <h3>${card.teamName} <span class="side-badge-small">${card.teamSide}</span></h3>
                <p class="timestamp">Revelada às ${timeStr}</p>
            </div>
        </div>
    `;
    
    // Adicionar animação
    container.classList.add('reveal-animation');
    setTimeout(() => container.classList.remove('reveal-animation'), 1000);
}

// Exibir histórico
function displayHistory(history) {
    const container = document.getElementById('historyDisplay');
    
    if (!history || history.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma carta revelada ainda</p>';
        return;
    }
    
    const historyHTML = history.slice(0, 10).map(card => {
        const date = new Date(card.timestamp);
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="history-item">
                <img src="/cartas/${card.cardImage}" alt="${card.teamName}" class="history-card-thumb">
                <div class="history-info">
                    <strong>${card.teamName}</strong>
                    <span class="side-badge-small">${card.teamSide}</span>
                    <span class="history-time">${timeStr}</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = historyHTML;
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadTeamsData();
    
    // Atualizar dados a cada 3 segundos
    setInterval(loadTeamsData, 3000);
});
