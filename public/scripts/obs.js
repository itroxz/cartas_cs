// OBS Page JavaScript - FIFA-style Card Animation

let currentCardData = null;
let eventSource = null;
let isAnimating = false;

// Conectar ao stream de eventos
function connectToStream() {
    eventSource = new EventSource('/api/stream');
    
    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            // Verificar se há carta nova
            if (data.currentCard && data.currentCard.cardNumber) {
                // Nova carta revelada
                if (!currentCardData || 
                    data.currentCard.cardNumber !== currentCardData.cardNumber || 
                    data.currentCard.team !== currentCardData.team ||
                    data.currentCard.timestamp !== currentCardData.timestamp) {
                    
                    currentCardData = data.currentCard;
                    showCard(data.currentCard);
                }
            } else {
                // Nenhuma carta
                if (currentCardData !== null) {
                    currentCardData = null;
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

// Mostrar carta com animação FIFA
function showCard(card) {
    if (isAnimating) return;
    
    isAnimating = true;
    const wrapper = document.getElementById('cardWrapper');
    const cardImage = document.getElementById('cardImage');
    const teamName = document.getElementById('teamName');
    
    // Esconder carta anterior se houver
    wrapper.classList.remove('show', 'hide');
    
    // Pequeno delay para reset
    setTimeout(() => {
        // Atualizar conteúdo
        cardImage.src = `/cartas/${card.cardImage}`;
        teamName.textContent = card.teamName.toUpperCase();
        
        // Iniciar animação
        wrapper.classList.add('show');
        
        // Resetar flag após animação (2s agora)
        setTimeout(() => {
            isAnimating = false;
        }, 2000);
    }, 100);
}

// Esconder carta
function hideCard() {
    const wrapper = document.getElementById('cardWrapper');
    
    if (!wrapper.classList.contains('show')) return;
    
    wrapper.classList.remove('show');
    wrapper.classList.add('hide');
    
    setTimeout(() => {
        wrapper.classList.remove('hide');
    }, 800);
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
