// Operator Panel JavaScript - New Card Selection Interface

let selectedTeam = null;
let teamData = null;
let updateInterval = null;

// Carregar dados de um time
async function loadTeamData(teamId) {
    try {
        const response = await fetch(`/api/operator/team/${teamId}`);
        const data = await response.json();
        
        console.log('Team data loaded:', data);
        
        teamData = data;
        renderTeamCards();
        startCardTimers();
    } catch (error) {
        console.error('Erro ao carregar time:', error);
        showStatus('Erro ao carregar dados', 'error');
    }
}

// Renderizar cartas do time
function renderTeamCards() {
    const grid = document.getElementById('cardsGrid');
    const teamName = document.getElementById('teamName');
    const teamSide = document.getElementById('teamSide');
    
    if (!teamData) {
        grid.innerHTML = '<div class="no-team-message">Selecione um time</div>';
        teamName.textContent = 'Selecione um time';
        teamSide.textContent = '';
        teamSide.className = 'side-badge';
        document.getElementById('cardCounter').textContent = '0/6';
        return;
    }
    
    // Atualizar contador de cartas disponíveis
    const availableCards = teamData.cards.filter(c => !c.used).length;
    document.getElementById('cardCounter').textContent = `${availableCards}/6`;
    
    teamName.textContent = teamData.name;
    teamSide.textContent = teamData.side;
    teamSide.className = `side-badge ${teamData.side}`;
    
    grid.innerHTML = teamData.cards.map(card => {
        const now = Date.now();
        const isLocked = card.used && card.usedAt && (now - card.usedAt < 30000);
        const timeRemaining = isLocked ? Math.ceil((30000 - (now - card.usedAt)) / 1000) : 0;
        
        let classes = 'card-item';
        if (card.used) classes += ' used';
        if (isLocked) classes += ' locked';
        
        console.log('Rendering card:', card.number, 'image:', card.image);
        
        return `
            <div class="${classes}" 
                 onclick="${!card.used ? `revealCard(${card.number})` : ''}"
                 data-card="${card.number}">
                <img src="/cartas/${card.image}" alt="Carta ${card.number}" onerror="console.error('Failed to load:', this.src)">
                ${isLocked ? `<div class="time-overlay">${timeRemaining}s</div>` : ''}
            </div>
        `;
    }).join('');
}

// Revelar carta
async function revealCard(cardNumber) {
    if (!selectedTeam || !teamData) return;
    
    const card = teamData.cards.find(c => c.number === cardNumber);
    if (!card || card.used) return;
    
    // Mostrar modal de confirmação touch-friendly
    const cardName = getCardName(card.image);
    const confirmed = await showConfirmModal(
        `Revelar a carta "${cardName}"?`,
        'Esta ação não pode ser desfeita.'
    );
    
    if (!confirmed) return;
    
    try {
        showStatus('Revelando carta...', 'info');
        
        const response = await fetch('/api/operator/reveal-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                team: selectedTeam,
                cardNumber: cardNumber
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatus('Carta revelada!', 'success');
            // Recarregar dados do time
            await loadTeamData(selectedTeam);
        } else {
            showStatus(data.error || 'Erro ao revelar carta', 'error');
        }
    } catch (error) {
        console.error('Erro ao revelar carta:', error);
        showStatus('Erro ao revelar carta', 'error');
    }
}

function getCardName(image) {
    const names = {
        'cortina-fumaca.png': 'Cortina de Fumaça',
        'duro-dorme.png': 'Duro Dorme',
        'golpe-katana.png': 'Golpe Katana',
        'tommy-gun.png': 'Tommy Gun',
        'vem-tranquilo.png': 'Vem Tranquilo',
        'ct-jogo-bicho.png': 'Jogo Bicho (CT)',
        'tr-jogo-bicho.png': 'Jogo Bicho (TR)'
    };
    return names[image] || `Carta ${image}`;
}

// Modal de confirmação touch-friendly
function showConfirmModal(title, subtitle) {
    console.log('showConfirmModal called:', title, subtitle);
    
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const message = document.getElementById('confirmMessage');
        const btnConfirm = document.getElementById('btnConfirm');
        
        console.log('Modal elements:', { modal, message, btnConfirm });
        
        if (!modal || !message || !btnConfirm) {
            console.error('Modal elements not found!');
            resolve(false);
            return;
        }
        
        message.innerHTML = `<strong>${title}</strong><br><small style="opacity: 0.8">${subtitle}</small>`;
        modal.classList.add('active');
        
        console.log('Modal activated');
        
        const handleConfirm = () => {
            console.log('Confirm clicked');
            cleanup();
            resolve(true);
        };
        
        const handleCancel = () => {
            console.log('Cancel clicked');
            cleanup();
            resolve(false);
        };
        
        const cleanup = () => {
            modal.classList.remove('active');
            btnConfirm.removeEventListener('click', handleConfirm);
        };
        
        btnConfirm.addEventListener('click', handleConfirm);
        window.closeConfirmModal = handleCancel;
    });
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
}

// Selecionar time
function selectTeam(teamId) {
    selectedTeam = teamId;
    
    // Atualizar botões
    document.getElementById('btnSelectTeam1').classList.remove('active');
    document.getElementById('btnSelectTeam2').classList.remove('active');
    document.getElementById(`btnSelectTeam${teamId === 'team1' ? '1' : '2'}`).classList.add('active');
    
    // Carregar dados
    loadTeamData(teamId);
    
    // Não atualizar automaticamente para evitar piscar
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Atualizar timers das cartas bloqueadas
function startCardTimers() {
    setInterval(() => {
        if (!teamData) return;
        
        let needsUpdate = false;
        teamData.cards.forEach(card => {
            if (card.used && card.usedAt) {
                const now = Date.now();
                const elapsed = now - card.usedAt;
                if (elapsed < 30000) {
                    needsUpdate = true;
                    // Atualizar apenas o timer, não toda a carta
                    const cardElement = document.querySelector(`[data-card="${card.number}"]`);
                    if (cardElement) {
                        const timeRemaining = Math.ceil((30000 - elapsed) / 1000);
                        const overlay = cardElement.querySelector('.time-overlay');
                        if (overlay) {
                            overlay.textContent = `${timeRemaining}s`;
                        }
                    }
                } else if (elapsed >= 30000 && elapsed < 31000) {
                    // Passou dos 30s, atualizar classe da carta
                    const cardElement = document.querySelector(`[data-card="${card.number}"]`);
                    if (cardElement && cardElement.classList.contains('locked')) {
                        cardElement.classList.remove('locked');
                        const overlay = cardElement.querySelector('.time-overlay');
                        if (overlay) {
                            overlay.remove();
                        }
                    }
                }
            }
        });
    }, 1000);
}

// Mostrar status (removido elemento visual, apenas console)
function showStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Feedback visual opcional via toast (futuro)
    if (type === 'error') {
        // Em caso de erro, podemos mostrar no modal ou console
        console.error(message);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    // Carregar nomes dos times nos botões
    fetch('/api/admin/status')
        .then(response => response.json())
        .then(data => {
            document.getElementById('btnSelectTeam1').textContent = data.teams.team1.name.toUpperCase();
            document.getElementById('btnSelectTeam2').textContent = data.teams.team2.name.toUpperCase();
        })
        .catch(error => console.error('Erro ao carregar nomes dos times:', error));
    
    // Configurar botões
    document.getElementById('btnSelectTeam1').addEventListener('click', () => selectTeam('team1'));
    document.getElementById('btnSelectTeam2').addEventListener('click', () => selectTeam('team2'));
    
    // Renderizar estado inicial
    renderTeamCards();
});

// Limpar ao sair
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
