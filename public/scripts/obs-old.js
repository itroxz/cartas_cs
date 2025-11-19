// OBS Page JavaScript - Auto-updating card display with flip animation

let currentCardData = null;
let preparedCardData = null;
let eventSource = null;
let isFlipping = false;
let isPrepared = false;

// Conectar ao stream de eventos
function connectToStream() {
    eventSource = new EventSource('/api/stream');
    
    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            // Verificar se há carta preparada
            if (data.preparedCard && data.preparedCard.prepared) {
                // Carta preparada - mostrar verso
                if (!preparedCardData || 
                    data.preparedCard.cardNumber !== preparedCardData.cardNumber || 
                    data.preparedCard.team !== preparedCardData.team) {
                    
                    preparedCardData = data.preparedCard;
                    showPreparedCard(data.preparedCard);
                }
            } 
            // Verificar se há carta revelada
            else if (data.currentCard && data.currentCard.cardNumber) {
                // Nova carta revelada - fazer flip
                if (!currentCardData || 
                    data.currentCard.cardNumber !== currentCardData.cardNumber || 
                    data.currentCard.team !== currentCardData.team ||
                    data.currentCard.timestamp !== currentCardData.timestamp) {
                    
                    currentCardData = data.currentCard;
                    preparedCardData = null;
                    revealCard(data.currentCard);
                }
            } else {
                // Nenhuma carta
                if (currentCardData !== null || preparedCardData !== null) {
                    currentCardData = null;
                    preparedCardData = null;
                    hideCard();
                }
            }
        } catch (error) {
            console.error('Erro ao processar evento:', error);
        }
    };
    
    eventSource.onerror = (error) => {
        console.error('Erro no stream:', error);
        // Reconectar após 3 segundos
        setTimeout(() => {
            eventSource.close();
            connectToStream();
        }, 3000);
    };
}

// Mostrar carta preparada (apenas verso, sem flip)
function showPreparedCard(card) {
    const wrapper = document.getElementById('obsWrapper');
    const cardImage = document.getElementById('cardImage');
    const teamNameTop = document.getElementById('teamNameTop');
    
    // Atualizar dados da carta (para quando fizer flip)
    cardImage.src = `/cartas/${card.cardImage}`;
    teamNameTop.textContent = card.teamName.toUpperCase();
    
    // Remover flip se estiver ativo
    wrapper.classList.remove('flipped');
    
    // Mostrar verso
    if (wrapper.classList.contains('hidden')) {
        wrapper.classList.remove('hidden');
    }
    
    isPrepared = true;
}

// Revelar carta (fazer flip do verso para a frente)
function revealCard(card) {
    if (isFlipping) return;
    
    const wrapper = document.getElementById('obsWrapper');
    const cardImage = document.getElementById('cardImage');
    const teamNameTop = document.getElementById('teamNameTop');
    
    // Atualizar conteúdo
    cardImage.src = `/cartas/${card.cardImage}`;
    teamNameTop.textContent = card.teamName.toUpperCase();
    
    // Se estava preparada, apenas fazer flip
    if (isPrepared) {
        flipCard();
        isPrepared = false;
    } 
    // Se não estava preparada, mostrar verso primeiro
    else {
        wrapper.classList.remove('ct', 'tr', 'flipped');
        
        if (wrapper.classList.contains('hidden')) {
            wrapper.classList.remove('hidden');
            
            setTimeout(() => {
                flipCard();
            }, 1000);
        } else {
            wrapper.classList.remove('flipped');
            
            setTimeout(() => {
                cardImage.src = `/cartas/${card.cardImage}`;
                teamNameTop.textContent = card.teamName.toUpperCase();
                
                setTimeout(() => {
                    flipCard();
                }, 300);
            }, 600);
        }
    }
}

// Mostrar carta com animação de flip (função antiga - mantida para compatibilidade)
function showCard(card) {
    revealCard(card);
}

// Executar animação de flip
function flipCard() {
    isFlipping = true;
    const wrapper = document.getElementById('obsWrapper');
    
    // Adicionar classe de flip
    wrapper.classList.add('flipped');
    
    // Após a animação de flip, resetar flag
    setTimeout(() => {
        isFlipping = false;
    }, 1200); // Duração do flip
}

// Esconder carta
function hideCard() {
    const wrapper = document.getElementById('obsWrapper');
    
    // Voltar ao verso
    wrapper.classList.remove('flipped');
    
    // Aguardar flip terminar, depois esconder
    setTimeout(() => {
        wrapper.classList.add('hidden');
        wrapper.classList.remove('ct', 'tr');
    }, 1200);
    
    isPrepared = false;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    connectToStream();
    
    // Carregar estado inicial
    fetch('/api/current-card')
        .then(response => response.json())
        .then(data => {
            if (data && data.cardNumber) {
                currentCardData = data;
                showCard(data);
            }
        })
        .catch(error => console.error('Erro ao carregar carta inicial:', error));
});

// Limpar ao fechar
window.addEventListener('beforeunload', () => {
    if (eventSource) {
        eventSource.close();
    }
});
