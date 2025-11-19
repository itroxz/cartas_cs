// Admin Panel JavaScript

let statusInterval;
let isEditingTeam1 = false;
let isEditingTeam2 = false;

// Carregar status inicial
async function loadStatus() {
    try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();
        
        // Atualizar nomes dos times apenas se não estiver editando
        if (!isEditingTeam1) {
            document.getElementById('team1Name').value = data.teams.team1.name;
        }
        if (!isEditingTeam2) {
            document.getElementById('team2Name').value = data.teams.team2.name;
        }
        document.getElementById('team1NameDisplay').textContent = data.teams.team1.name;
        document.getElementById('team2NameDisplay').textContent = data.teams.team2.name;
        
        // Atualizar lados CT/TR
        document.getElementById('team1SideDisplay').textContent = data.teams.team1.side;
        document.getElementById('team2SideDisplay').textContent = data.teams.team2.side;
        
        // Atualizar botões de lado
        document.getElementById('btnCT').classList.remove('active');
        document.getElementById('btnTR').classList.remove('active');
        if (data.teams.team1.side === 'CT') {
            document.getElementById('btnCT').classList.add('active');
        } else {
            document.getElementById('btnTR').classList.add('active');
        }
        
        // Atualizar contadores de cartas (cartas não usadas)
        const team1Available = data.teams.team1.cards.filter(c => !c.used).length;
        const team2Available = data.teams.team2.cards.filter(c => !c.used).length;
        document.getElementById('team1Cards').textContent = team1Available;
        document.getElementById('team2Cards').textContent = team2Available;
        
        // Atualizar limite máximo de cartas
        if (data.maxCardsPerTeam) {
            document.getElementById('maxCardsInput').value = data.maxCardsPerTeam;
        }
        
        // Atualizar carta atual
        displayCurrentCard(data.currentCard);
        
        // Atualizar histórico
        displayHistory(data.history);
    } catch (error) {
        console.error('Erro ao carregar status:', error);
        showNotification('Erro ao conectar com o servidor', 'error');
    }
}

// Atualizar nomes dos times
async function updateTeamNames() {
    const team1Name = document.getElementById('team1Name').value.trim();
    const team2Name = document.getElementById('team2Name').value.trim();
    
    if (!team1Name || !team2Name) {
        showNotification('Por favor, preencha os nomes de ambos os times', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/set-team-names', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team1Name, team2Name })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Nomes dos times atualizados com sucesso!', 'success');
            loadStatus();
        }
    } catch (error) {
        console.error('Erro ao atualizar nomes:', error);
        showNotification('Erro ao atualizar nomes dos times', 'error');
    }
}

// Atualizar limite máximo de cartas por time
async function updateMaxCards() {
    const maxCards = parseInt(document.getElementById('maxCardsInput').value);
    
    if (!maxCards || maxCards < 1 || maxCards > 13) {
        showNotification('Por favor, insira um valor entre 1 e 13', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/set-max-cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maxCards })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Limite atualizado para ${maxCards} cartas por time!`, 'success');
            loadStatus();
        } else {
            showNotification(data.error || 'Erro ao atualizar limite', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar limite:', error);
        showNotification('Erro ao atualizar limite de cartas', 'error');
    }
}

// Configurar lado CT/TR
async function setTeamSide(team1Side) {
    try {
        const response = await fetch('/api/admin/set-team-sides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team1Side })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Lados atualizados! Time 1: ${data.teams.team1.side}, Time 2: ${data.teams.team2.side}`, 'success');
            loadStatus();
        }
    } catch (error) {
        console.error('Erro ao atualizar lados:', error);
        showNotification('Erro ao atualizar lados dos times', 'error');
    }
}

// Restaurar cartas de um time
async function restoreTeam(team) {
    if (!confirm(`Deseja restaurar todas as cartas do ${team === 'team1' ? 'Time 1' : 'Time 2'}?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/restore-team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Cartas do ${data.team.name} restauradas!`, 'success');
            loadStatus();
        }
    } catch (error) {
        console.error('Erro ao restaurar time:', error);
        showNotification('Erro ao restaurar cartas', 'error');
    }
}

// Resetar sistema completo
async function resetSystem() {
    if (!confirm('⚠️ ATENÇÃO! Isso irá resetar TODOS os times e limpar a carta revelada. Deseja continuar?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Sistema resetado com sucesso!', 'success');
            loadStatus();
        }
    } catch (error) {
        console.error('Erro ao resetar sistema:', error);
        showNotification('Erro ao resetar sistema', 'error');
    }
}

// Exibir carta atual
function displayCurrentCard(card) {
    const container = document.getElementById('currentCardDisplay');
    
    if (!card) {
        container.innerHTML = '<p class="empty-state">Nenhuma carta revelada ainda</p>';
        return;
    }
    
    const date = new Date(card.timestamp);
    const timeStr = date.toLocaleTimeString('pt-BR');
    
    container.innerHTML = `
        <div class="current-card">
            <img src="/cartas/${card.cardImage}" alt="${card.teamName}" class="card-preview">
            <div class="card-info">
                <h3>${card.teamName} <span class="side-badge-small">${card.teamSide}</span></h3>
                <p class="timestamp">Revelada às ${timeStr}</p>
            </div>
        </div>
    `;
}

// Exibir histórico
function displayHistory(history) {
    const container = document.getElementById('historyDisplay');
    
    if (!history || history.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma carta foi revelada ainda</p>';
        return;
    }
    
    const historyHTML = history.map(card => {
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
    // Remover notificação anterior
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
    loadStatus();
    
    // Atualizar status a cada 2 segundos
    statusInterval = setInterval(loadStatus, 2000);
    
    // Detectar quando usuário está editando os campos
    const team1Input = document.getElementById('team1Name');
    const team2Input = document.getElementById('team2Name');
    
    team1Input.addEventListener('focus', () => {
        isEditingTeam1 = true;
    });
    
    team1Input.addEventListener('blur', () => {
        isEditingTeam1 = false;
    });
    
    team2Input.addEventListener('focus', () => {
        isEditingTeam2 = true;
    });
    
    team2Input.addEventListener('blur', () => {
        isEditingTeam2 = false;
    });
});
