# 🎴 Sistema de Cartas - Counter-Strike Edition

Sistema web local para gerenciamento de cartas de times de Counter-Strike, com painéis administrativo e operacional, ideal para transmissões ao vivo (OBS).

## 📋 Características

- ✅ **Painel Administrativo**: Configure nomes dos times, lados CT/TR, restaure cartas, gerencie o sistema
- ✅ **Lados CT/TR**: Sistema inteligente que define automaticamente o lado oposto
- ✅ **Cartas Específicas**: Carta "Jogo Bicho" adaptada por lado (CT ou TR)
- ✅ **Painel do Operador**: Interface visual com 6 cartas, revelação em 1 clique (otimizado para tablet)
- ✅ **Sistema de Bloqueio**: Cartas ficam bloqueadas por 30s após revelação antes de serem permanentemente desabilitadas
- ✅ **Página OBS**: Display com animação estilo FIFA mostrando verso e frente da carta em 3D
- ✅ **Animação 3D**: Verso da carta (verso.png) gira em 3D e revela a carta real com efeitos visuais
- ✅ **API REST**: Endpoint JSON com dados da carta atual
- ✅ **Auto-atualização**: Sistema de eventos (SSE) para atualização em tempo real
- ✅ **Contador Visual**: Indicador de cartas disponíveis (X/6) no painel operador
- ✅ **Design Modular**: Preparado para customização futura de design e animações
- ✅ **Servidor Local**: Funciona totalmente offline, acessível por tablets na rede local

## 🎮 Cartas Disponíveis

O sistema inclui 6 cartas por time:
1. **Cortina de Fumaça** (`cortina-fumaca.png`)
2. **Duro Dorme** (`duro-dorme.png`)
3. **Golpe Katana** (`golpe-katana.png`)
4. **Tommy Gun** (`tommy-gun.png`)
5. **Vem Tranquilo** (`vem-tranquilo.png`)
6. **Jogo Bicho** - Específica por lado:
   - CT: `ct-jogo-bicho.png`
   - TR: `tr-jogo-bicho.png`

**Verso da carta**: `verso.png` (usado na animação de flip)

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js instalado (v14 ou superior)

### Passo 1: Instalar dependências
```powershell
npm install
```

### Passo 2: Iniciar o servidor
```powershell
npm start
```

O servidor será iniciado na porta 3000. Acesse:

- **Painel Admin**: http://localhost:3000/admin
- **Painel Operador**: http://localhost:3000/operator
- **Página OBS**: http://localhost:3000/obs
- **API JSON**: http://localhost:3000/api/current-card

### Acesso via Tablet/Rede Local

1. Descubra o IP do seu computador na rede local
2. No tablet, acesse `http://[IP-DO-PC]:3000/operator`
3. Exemplo: `http://192.168.1.100:3000/operator`

## 📱 Como Usar

### Painel Administrativo (`/admin`)

1. **Configurar Times**: Defina os nomes do Time 1 e Time 2
2. **Definir Lados CT/TR**: Selecione se o Time 1 é CT ou TR (o Time 2 fica automaticamente o oposto)
   - Isso afeta qual versão da carta "Jogo Bicho" será mostrada
3. **Monitorar Status**: Veja quantas cartas cada time possui e seu lado atual
4. **Restaurar Cartas**: Restaure as 6 cartas de um time específico
5. **Resetar Sistema**: Restaure tudo ao estado inicial (ambos os times com 6 cartas)

### Painel do Operador (`/operator`)

1. **Selecionar Time**: Clique no botão do time desejado (TIME 1 ou TIME 2)
2. **Visualizar Cartas**: Veja as 6 cartas disponíveis em grade visual
3. **Contador**: Indicador mostra cartas disponíveis (ex: 5/6)
4. **Revelar Carta**: Clique diretamente na carta desejada
5. **Bloqueio de 30s**: Após revelar, a carta fica bloqueada e mostra contagem regressiva
6. **Desabilitação**: Após 30s, a carta fica permanentemente desabilitada (cinza, opacidade 30%)

### Página OBS (`/obs`)

1. No OBS, adicione uma fonte "Browser"
2. Configure a URL: `http://localhost:3000/obs`
3. Defina as dimensões: **400x600** (ou ajuste conforme necessário)
4. A página mostrará automaticamente:
   - **Verso da carta** (verso.png) inicialmente com rotação 3D
   - **Animação estilo FIFA** quando uma carta for revelada (2 segundos)
   - **Frente da carta** com a imagem PNG correspondente
   - **Efeitos visuais**: brilho, saturação, partículas rotativas
   - **Nome do time** posicionado abaixo da carta
   - Atualização automática em tempo real via SSE

### API JSON (`/api/current-card`)

Retorna dados da carta atual em formato JSON:
```json
{
  "team": "team1",
  "teamName": "Nome do Time",
  "teamSide": "CT",
  "cardNumber": 3,
  "cardImage": "golpe-katana.png",
  "timestamp": 1700000000000
}
```

## 🎨 Estrutura do Projeto

```
cs_cartass/
├── server.js                 # Servidor Express e API
├── package.json              # Dependências do projeto
├── data/
│   └── system.json           # Dados persistidos (gerado automaticamente)
└── public/
    ├── admin.html            # Painel administrativo
    ├── operator.html         # Painel do operador
    ├── obs.html              # Página para OBS
    ├── scripts/
    │   ├── admin.js          # Lógica do painel admin
    │   ├── operator.js       # Lógica do painel operador
    │   └── obs.js            # Lógica da página OBS
    └── styles/
        ├── admin.css         # Estilos do painel admin
        ├── operator.css      # Estilos do painel operador
        └── obs.css           # Estilos da página OBS (CUSTOMIZÁVEL)
```

## 🎨 Customização de Design

O sistema foi preparado para receber design customizado facilmente:

### Customizar Cores dos Times
Edite `public/styles/obs.css`:
```css
:root {
    --team1-primary: #2563eb;    /* Cor principal Time 1 */
    --team2-primary: #dc2626;    /* Cor principal Time 2 */
}
```

### Adicionar Imagens de Fundo
```css
.card-content {
    background-image: url('/assets/card-background.png');
    background-size: cover;
}
```

### Substituir Números por Imagens
```css
.card-number {
    background-image: url('/assets/numbers/1.png');
    background-size: contain;
    width: 300px;
    height: 300px;
}
```

### Modificar Animações
Ajuste os keyframes em `obs.css` ou crie novos efeitos.

## 🔧 API Endpoints

### Admin
- `GET /api/admin/status` - Status completo do sistema
- `POST /api/admin/set-team-names` - Configurar nomes dos times
- `POST /api/admin/reset` - Resetar sistema completo
- `POST /api/admin/restore-team` - Restaurar cartas de um time

### Operador
- `GET /api/operator/team/:teamId` - Informações de um time
- `POST /api/operator/reveal` - Revelar uma carta

### Dados
- `GET /api/current-card` - Carta atual em JSON
- `GET /api/stream` - Stream de eventos (SSE) para auto-atualização

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Comunicação em Tempo Real**: Server-Sent Events (SSE)
- **Armazenamento**: JSON (arquivo local)

## 📝 Notas Importantes

- Cada time começa com 6 cartas (numeradas de 1 a 6)
- Cartas reveladas são removidas permanentemente até restauração manual
- O sistema funciona completamente offline
- Dados são salvos em `data/system.json`
- A página OBS atualiza automaticamente via SSE

## ✨ Melhorias Recentes (v2.0)

- ✅ **Sistema de 1 Clique**: Revelação direta sem etapa de preparação
- ✅ **Interface Visual**: 6 cartas visíveis em grade 3x2
- ✅ **Bloqueio Temporário**: 30 segundos com contador antes da desabilitação permanente
- ✅ **Animação FIFA**: Efeito 3D de entrada e flip com verso/frente (2s)
- ✅ **Contador de Cartas**: Indicador visual X/6 no painel operador
- ✅ **Confirmação de Revelação**: Diálogo de confirmação para evitar cliques acidentais
- ✅ **Otimização de Performance**: Eliminação de flickering com atualizações seletivas
- ✅ **Layout Responsivo**: Otimizado para tablets com controles na parte inferior

## 🔄 Funcionalidades Futuras

- [ ] Efeitos sonoros ao revelar cartas
- [ ] Histórico expandido com estatísticas
- [ ] Atalhos de teclado (1-6 para revelar, T para trocar time)
- [ ] Temas visuais alternativos (modo escuro/claro)
- [ ] Upload de imagens personalizadas
- [ ] Suporte a mais de 2 times
- [ ] Configuração de quantidade de cartas por time

## 📄 Licença

MIT License - Livre para uso e modificação

---

**Desenvolvido para transmissões ao vivo e eventos esportivos** 🎮🏆
