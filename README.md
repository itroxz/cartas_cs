# 🎴 Sistema de Cartas - Counter-Strike Edition

Sistema web local para gerenciamento de cartas de times de Counter-Strike, com painéis administrativo e operacional, ideal para transmissões ao vivo (OBS).

## 📋 Características

- ✅ **Painel Administrativo**: Configure nomes dos times, lados CT/TR, restaure cartas, gerencie o sistema
- ✅ **Lados CT/TR**: Sistema inteligente que define automaticamente o lado oposto
- ✅ **Cartas Específicas**: Carta "Jogo Bicho" adaptada por lado (CT ou TR)
- ✅ **Painel do Operador**: Selecione times e revele cartas com interface intuitiva
- ✅ **Página OBS**: Display com animação de flip mostrando verso e frente da carta
- ✅ **Animação de Flip**: Verso da carta (verso.png) vira e revela a carta real
- ✅ **API REST**: Endpoint JSON com dados da carta atual
- ✅ **Auto-atualização**: Sistema de eventos (SSE) para atualização em tempo real
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

1. **Selecionar Time**: Clique no botão do time desejado
2. **Verificar Cartas**: Veja quantas cartas restam disponíveis
3. **Revelar Carta**: Clique no grande botão "Revelar Carta"
4. **Confirmação**: A carta revelada aparecerá na seção "Última Carta Revelada"

### Página OBS (`/obs`)

1. No OBS, adicione uma fonte "Browser"
2. Configure a URL: `http://localhost:3000/obs`
3. Defina as dimensões: **400x600** (ou ajuste conforme necessário)
4. A página mostrará automaticamente:
   - **Verso da carta** inicialmente
   - **Animação de flip** quando uma carta for revelada
   - **Frente da carta** com a imagem PNG correspondente
   - Atualização automática em tempo real

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

## 🔄 Funcionalidades Futuras (Preparadas)

- [ ] Upload de imagens personalizadas para cartas
- [ ] Efeitos sonoros ao revelar cartas
- [ ] Histórico de cartas reveladas
- [ ] Temas visuais alternativos
- [ ] Suporte a mais de 2 times
- [ ] Configuração de quantidade de cartas por time

## 📄 Licença

MIT License - Livre para uso e modificação

---

**Desenvolvido para transmissões ao vivo e eventos esportivos** 🎮🏆
