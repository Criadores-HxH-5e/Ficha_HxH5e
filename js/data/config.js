// --- CONFIGURAÇÃO DISCORD (PREENCHA AQUI) ---
const DISCORD_CONFIG = {
    clientId: '1271506937111904286', // Substitua pelo ID do seu App Discord
    guildId: '831867588656758804',   // ID do Servidor Discord
    roleId: '1335940980628521000',     // ID do Cargo necessário
    redirectUri: window.location.origin + window.location.pathname // URL atual
};

// Lista de IDs de usuários que pagaram (Acesso liberado sem cargo)
const PAID_USERS = [
    "831128693313110076",
    "1463667613338046535"
];

// IDs Discord dos administradores do sistema
const ADMIN_USERS = [
    "833442072174264351",
    "513323323355037717"
];

// --- CONFIGURAÇÃO GOOGLE ---
const GOOGLE_CONFIG = {
    clientId: '440879807821-j3fik1fmkreqnbpmovo4vgm0p1v3seu5.apps.googleusercontent.com'
};

// Emails Google autorizados (equivalente ao PAID_USERS para login via Google)
const PAID_GOOGLE_EMAILS = [
    // Adicione os emails autorizados aqui, ex: "usuario@gmail.com"
];

// --- DADOS DO SISTEMA ---
const ITEM_DB = {
    armas: {
        simples_corpo_a_corpo: [
            { nome: "Adaga", custo: 10, dano: "1d4", tipo_dano: "Corte", peso: 0.5, tags: ["Acuidade", "Arremesso (6m/18m)"], detalhe: "Lâmina versátil para combate ou arremesso." },
            { nome: "Azagaia", custo: 25, dano: "1d6", tipo_dano: "Perfuração", peso: 1.0, tags: ["Arremesso (6m/18m)", "Perfuração"], detalhe: "Uma lança curta projetada para ser lançada." },
            { nome: "Cajado / Bastão", custo: 5, dano: "1d6", tipo_dano: "Impacto", peso: 1.0, tags: ["Versátil (1d8)", "Finta"], detalhe: "Pode ser usado com uma ou duas mãos." },
            { nome: "Clava Grande", custo: 150, dano: "1d8", tipo_dano: "Impacto", peso: 2.0, tags: ["Pesada", "Duas Mãos"], detalhe: "Uma arma bruta que exige força e ambas as mãos." },
            { nome: "Foice Curta", custo: 30, dano: "1d4", tipo_dano: "Corte", peso: 1.0, tags: ["Leve", "Mortal x3"], detalhe: "Eficiente em causar cortes profundos e críticos." },
            { nome: "Lança", custo: 120, dano: "1d6", tipo_dano: "Perfuração", peso: 1.0, tags: ["Versátil (1d8)", "Arremesso (9m/36m)"], detalhe: "Arma de haste clássica para estocar ou arremessar." },
            { nome: "Maça", custo: 120, dano: "1d6", tipo_dano: "Impacto", peso: 1.0, tags: ["Bloqueio"], detalhe: "Arma contundente que auxilia na defesa." },
            { nome: "Machadinha", custo: 20, dano: "1d6", tipo_dano: "Corte", peso: 0.5, tags: ["Leve", "Arremesso (6m/18m)"], detalhe: "Machado pequeno e equilibrado." },
            { nome: "Martelo Leve", custo: 10, dano: "1d4", tipo_dano: "Impacto", peso: 0.5, tags: ["Leve", "Arremesso (6m/18m)"], detalhe: "Ferramenta de impacto fácil de manusear." },
            { nome: "Porrete Pogamoggan", custo: 80, dano: "1d4", tipo_dano: "Impacto", peso: 0.5, tags: ["Leve", "Versátil (1d6)", "Bloqueio"], detalhe: "Bastão reforçado para defesa e ataque." }
        ],
        simples_distancia: [
            { nome: "Agulha Senbon (1)", custo: 30, dano: "1d4", tipo_dano: "Perfuração", peso: 0.1, tags: ["Arremesso (9m/18m)", "Ataque Múltiplo", "Munição"], detalhe: "Pequenos projéteis precisos e leves." },
            { nome: "Arco Curto", custo: 60, dano: "1d6", tipo_dano: "Perfuração", peso: 1.0, tags: ["Munição (6m/18m)", "Perfuração", "Duas Mãos"], detalhe: "Arco compacto para disparos rápidos." },
            { nome: "Corrente Pesada", custo: 60, dano: "1d8", tipo_dano: "Impacto", peso: 1.0, tags: ["Alcance (3m)", "Agarrar", "Tropeçar", "Duas Mãos", "Pesada"], detalhe: "Utilizada para controle de área e imobilização." },
            { nome: "Dardo / Zarabatana", custo: 20, dano: "1d4", tipo_dano: "Perfuração", peso: 0.5, tags: ["Arremesso (6m/12m)", "Duas Mãos", "Munição"], detalhe: "Armas silenciosas para aplicação de toxinas." },
            { nome: "Funda / Estilingue", custo: 20, dano: "1d4", tipo_dano: "Impacto", peso: 0.3, tags: ["Arremesso (6m/18m)", "Duas Mãos", "Munição"], detalhe: "Usa pedras ou esferas como munição." },
            { nome: "Rede", custo: 30, dano: "-", tipo_dano: "Sem dano", peso: 1.0, tags: ["Alcance (3m)", "Agarrar/Prender", "Duas Mãos"], detalhe: "Projetada apenas para incapacitar o oponente." },
            { nome: "Shuriken", custo: 30, dano: "1d4", tipo_dano: "Corte", peso: 0.1, tags: ["Arremesso (6m/18m)", "Ataque Múltiplo"], detalhe: "Estrelas de arremesso para ataques em sequência." }
        ],
        marciais_corpo_a_corpo: [
            { nome: "Alabarda", custo: 400, dano: "1d12", tipo_dano: "Corte", peso: 1.5, tags: ["Alcance", "Duas Mãos", "Pesada"] },
            { nome: "Bastão de 3 partes", custo: 300, dano: "1d8", tipo_dano: "Impacto", peso: 1.0, tags: ["Bloqueio", "Derrubar", "Finta"] },
            { nome: "Bumerangue", custo: 150, dano: "1d6", tipo_dano: "Impacto", peso: 0.5, tags: ["Arremesso (6m/18m)", "Finta", "Leve", "Retorno"] },
            { nome: "Chakram", custo: 150, dano: "1d6", tipo_dano: "Corte", peso: 1.0, tags: ["Arremesso (6m/18m)", "Finta", "Leve", "Retorno"] },
            { nome: "Chicote", custo: 120, dano: "1d4", tipo_dano: "Corte", peso: 0.5, tags: ["Acuidade", "Alcance", "Desarmar"] },
            { nome: "Cimitarra", custo: 120, dano: "1d6", tipo_dano: "Corte", peso: 1.0, tags: ["Acuidade", "Leve"] },
            { nome: "Espada Curta", custo: 120, dano: "1d6", tipo_dano: "Corte", peso: 1.0, tags: ["Leve"] },
            { nome: "Espada Exótica (Katana)", custo: 180, dano: "1d8", tipo_dano: "Corte", peso: 1.0, tags: ["Acuidade"] },
            { nome: "Espada Grande", custo: 450, dano: "2d6", tipo_dano: "Corte", peso: 1.5, tags: ["Bloqueio", "Duas Mãos", "Pesada"] },
            { nome: "Espada Longa", custo: 150, dano: "1d8", tipo_dano: "Corte", peso: 1.0, tags: ["Versátil (1d10)"] },
            { nome: "Foice com Corrente", custo: 250, dano: "2d4", tipo_dano: "Corte", peso: 1.0, tags: ["Agarrar", "Alcance", "Duas Mãos", "Finta"] },
            { nome: "Foice", custo: 350, dano: "2d4", tipo_dano: "Corte", peso: 1.0, tags: ["Alcance", "Duas Mãos", "Mortal x3", "Pesada"] },
            { nome: "Florete/Rapieira", custo: 180, dano: "1d8", tipo_dano: "Perfuração", peso: 1.0, tags: ["Acuidade"] },
            { nome: "Garra de Ferro", custo: 180, dano: "1d6", tipo_dano: "Corte", peso: 1.0, tags: ["Acuidade", "Crítico"] },
            { nome: "Glaive", custo: 280, dano: "1d10", tipo_dano: "Corte", peso: 1.5, tags: ["Alcance", "Duas mãos", "Pesada"] },
            { nome: "Jitte", custo: 120, dano: "1d6", tipo_dano: "Perfuração", peso: 1.0, tags: ["Bloqueio", "Leve"] },
            { nome: "Lança de Montaria", custo: 500, dano: "1d12", tipo_dano: "Perfuração", peso: 1.5, tags: ["Alcance", "Especial (estocada)", "Duas Mãos", "Pesada"] },
            { nome: "Linha de Batalha", custo: 5, dano: "1d4", tipo_dano: "Corte", peso: 0.1, tags: ["Alcance", "Agarrar", "Tropeçar", "Duas Mãos"] },
            { nome: "Maça Estrela", custo: 250, dano: "1d8", tipo_dano: "Impacto", peso: 1.0, tags: ["Bloqueio", "Mortal x3"] },
            { nome: "Machado", custo: 150, dano: "1d8", tipo_dano: "Corte", peso: 1.0, tags: ["Versátil (1d10)"] },
            { nome: "Machado Grande", custo: 450, dano: "1d12", tipo_dano: "Corte", peso: 1.5, tags: ["Bloqueio", "Duas Mãos", "Pesada"] },
            { nome: "Mangual", custo: 220, dano: "1d8", tipo_dano: "Impacto", peso: 1.0, tags: ["Desarmar", "Duas Mãos", "Especial (+1 em ataque)"] },
            { nome: "Manopla de Combate", custo: 350, dano: "+1 ataque Desarmado", tipo_dano: "Impacto", peso: 1.0, tags: ["Bloqueio", "Leve"] },
            { nome: "Marreta", custo: 450, dano: "2d6", tipo_dano: "Impacto", peso: 1.5, tags: ["Bloqueio", "Duas Mãos", "Pesada"] },
            { nome: "Martelo de Guerra", custo: 150, dano: "1d8", tipo_dano: "Impacto", peso: 1.0, tags: ["Versátil (1d10)"] },
            { nome: "Nunchaku", custo: 120, dano: "1d6", tipo_dano: "Impacto", peso: 1.0, tags: ["Desarmar", "Leve"] },
            { nome: "Picareta de Guerra", custo: 150, dano: "1d8", tipo_dano: "Perfuração", peso: 1.0, tags: ["Duas Mãos"] },
            { nome: "Soqueira com Lâminas", custo: 120, dano: "1d6", tipo_dano: "Corte", peso: 0.5, tags: ["Acuidade", "Leve"] },
            { nome: "Tonfá", custo: 120, dano: "1d6", tipo_dano: "Impacto", peso: 1.0, tags: ["Bloqueio", "Leve"] },
            { nome: "Tridente", custo: 350, dano: "1d10", tipo_dano: "Perfuração", peso: 1.5, tags: ["Duas Mãos", "Pesada"] }
        ],
        marciais_distancia: [
            { nome: "Arco Longo", custo: 250, dano: "1d8", tipo_dano: "Perfuração", peso: 1.0, tags: ["Duas Mãos", "Munição (32m/96m)"], detalhe: "Arco de grande porte com longo alcance." },
            { nome: "Besta de Mão", custo: 200, dano: "1d6", tipo_dano: "Perfuração", peso: 1.0, tags: ["Munição (9m/18m)", "Recarregar"], detalhe: "Compacta, pode ser usada com uma mão, mas exige recarga." },
            { nome: "Besta Pesada", custo: 250, dano: "1d10", tipo_dano: "Perfuração", peso: 1.0, tags: ["Munição (18m/32m)", "Duas Mãos"], detalhe: "Disparo potente que exige ambas as mãos." },
            { nome: "Fuma-Shuriken", custo: 200, dano: "1d8", tipo_dano: "Corte", peso: 1.0, tags: ["Arremesso (6m/18m)", "Retorno", "Oculto"], detalhe: "Shuriken gigante dobrável, difícil de detectar antes do uso." },
            { nome: "Monster Chakram", custo: 250, dano: "1d10", tipo_dano: "Corte", peso: 2.0, tags: ["Arremesso (6m/18m)", "Retorno", "Duas Mãos"], detalhe: "Versão massiva do chakram para danos elevados." }
        ],
        cientificas_simples: [
            { nome: "Bola de gude explosiva (5)", custo: 300, dano: "2d4 cada", tipo_dano: "Explosivo", peso: 0.5, tags: ["Arremesso (12m)", "Ataques Múltiplos", "Explosiva"], detalhe: "Explode ao tocar em qualquer superfície depois de lançada." },
            { nome: "Mosquete", custo: 3000, dano: "1d12", tipo_dano: "Balístico", peso: 1.0, tags: ["Balística", "Duas Mãos", "Munição (32m/96m)", "Recarregar"], area: "12m Linha", detalhe: "Arma de fogo longa de cano liso. Requer munição de cartucho." },
            { nome: "Motosserra", custo: 5000, dano: "2d6", tipo_dano: "Corte", peso: 2.0, tags: ["Mortal x3", "Pesada"], teste_resistencia: "TR CON CD 15", condicao: "Sangramento Leve (2d4)", detalhe: "Ferramenta motorizada adaptada para combate. Requer combustível." },
            { nome: "Pistola", custo: 2000, dano: "1d10", tipo_dano: "Balístico", peso: 1.0, tags: ["Balística", "Munição (18m/32m)"], area: "Linha", detalhe: "Arma de fogo padrão para defesa pessoal." },
            { nome: "Spray de pimenta (10)", custo: 100, dano: "0", tipo_dano: "Químico", peso: 0.5, tags: ["Ataque Múltiplo", "Persistência"], teste_resistencia: "TR CON CD 16", area: "1,5m Linha", condicao: "Cego", detalhe: "Item portátil com propriedade de dispersão que causa irritação severa aos olhos." },
            { nome: "Tazer (3 Cargas)", custo: 1000, dano: "0", tipo_dano: "Elétrico", peso: 0.5, tags: ["Ataque Múltiplo", "Persistência"], teste_resistencia: "TR CON CD 12", condicao: "Atordoado", detalhe: "Dispositivo de imobilização por choque elétrico." }
        ],
        cientificas_complexas: [
            { nome: "Dinamite (1 banana)", custo: 1000, dano: "2d8 + 8", tipo_dano: "Explosivo", peso: 1.0, tags: ["Arma de Cerco", "Explosivo", "Detonador"], teste_resistencia: "TR DES CD 17", area: "4,5m Raio", detalhe: "Dano dobrado em estruturas." },
            { nome: "Espingarda", custo: 10000, dano: "4d6", tipo_dano: "Balístico", peso: 1.0, tags: ["Balística", "Duas Mãos", "Munição (6m/18m)", "Recarregar"], area: "12m Linha", detalhe: "Arma de cano longo com alto poder de parada." },
            { nome: "Dispositivo de PEM (3 usos)", custo: 500, dano: "1d6", tipo_dano: "Eletromagnético", peso: 0.5, tags: ["Detonador"], area: "6m Raio", detalhe: "Pulso Eletromagnético para desfazer equipamentos eletrônicos." },
            { nome: "Fuzil de Assalto", custo: 185000, dano: "2d10", tipo_dano: "Balístico", peso: 1.0, tags: ["Balística", "Crítico", "Duas Mãos", "Rajada: 10", "Munição"], teste_resistencia: "TR CON CD 15", area: "9m Cone", condicao: "Sangramento", detalhe: "Permite disparos em área gastando 10 unidades de munição." },
            { nome: "Granada Comum", custo: 500, dano: "2d6 + 5", tipo_dano: "Explosivo", peso: 0.5, tags: ["Arremesso (12m)", "Explosivo"], teste_resistencia: "TR DES CD 15", area: "3m Raio", condicao: "Caído", detalhe: "Explode ao tocar em superfícies." },
            { nome: "Granada Gás Lacrimogêneo", custo: 400, dano: "1d4", tipo_dano: "Químico", peso: 0.5, tags: ["Arremesso (12m)", "Dispersão", "Leve"], teste_resistencia: "TR CON CD 12", area: "9m Raio", condicao: "Cego e Envenenado", detalhe: "Cria nuvem de gás que persiste." },
            { nome: "Granada de Fumaça", custo: 150, dano: "0", tipo_dano: "-", peso: 0.5, tags: ["Arremesso (9m/18m)", "Cobertura", "Leve"], area: "4,5m Raio", condicao: "Cego", detalhe: "Gera cobertura pesada." },
            { nome: "Granada de Luz/Som", custo: 200, dano: "0", tipo_dano: "Sensorial", peso: 0.5, tags: ["Arremesso (9m/18m)", "Persistência"], teste_resistencia: "TR CON CD 18", area: "3m Raio", condicao: "Cego ou Surdo", detalhe: "Atordoante." },
            { nome: "Lança Chamas", custo: 20000, dano: "3d6", tipo_dano: "Fogo", peso: 2.0, tags: ["Duas Mãos", "Dispersão", "Munição", "Pesada"], teste_resistencia: "TR CON CD 15", area: "4,5m Cone", condicao: "Queimado", detalhe: "Projeta fogo em cone." },
            { nome: "Molotov", custo: 100, dano: "1d6", tipo_dano: "Fogo", peso: 0.2, tags: ["Arremesso (18m)"], area: "3m Raio", condicao: "Queimado", detalhe: "Artefato incendiário simples." }
        ],
        cientificas_especiais: [
            { nome: "Bazuca (6 munições)", custo: 250000, dano: "2d10 + 15", tipo_dano: "Explosivo", peso: 4.0, tags: ["Arma de Cerco", "Duas Mãos", "Explosivo", "Munição", "Pesada", "Recarregar"], teste_resistencia: "TR DES CD 25", area: "4,5m Raio", condicao: "Atordoado, Caído", detalhe: "Armamento pesado capaz de destruir estruturas." },
            { nome: "Fuzil de Precisão", custo: 200000, dano: "2d10", tipo_dano: "Balístico", peso: 1.0, tags: ["Balística", "Crítico", "Distância Mínima 15m", "Duas Mãos", "Mortal x4", "Munição", "Recarregar"], area: "200m Linha", condicao: "Sangramento Médio", detalhe: "Arma de altíssimo alcance e precisão para snipers." },
            { nome: "Metralhadora", custo: 200000, dano: "2d12", tipo_dano: "Balístico", peso: 1.0, tags: ["Balística", "Duas Mãos", "Especial (Rajada: 15)", "Mortal x3", "Munição"], teste_resistencia: "TR CON CD 15", area: "12m Cone", condicao: "Sangramento Médio", detalhe: "Arma de disparo rápido." }
        ],
        cerco: [
            { nome: "Balestra Fixa", tipo: "Objeto Grande", custo: 2500, ca: 15, pv: 30, peso: 5.0, tags: ["Arma de Cerco", "Projétil", "Recarregar"], detalhe: "Balestra maciça que dispara setas pesadas." },
            { nome: "Canhão", tipo: "Objeto Grande", custo: 12000, ca: 15, pv: 75, peso: 15.0, tags: ["Arma de Cerco", "Explosivo", "Recarregar", "Pesada"], detalhe: "Usa pólvora para impulsionar bolas de ferro." },
            { nome: "Torreta", tipo: "Objeto Grande", custo: 34000, ca: 15, pv: 75, peso: 12.0, tags: ["Arma de Cerco", "Balística", "Rajada", "Fixa"], detalhe: "Metralhadora de veículo." },
            { nome: "Tanque de Guerra", tipo: "Veículo Grande", custo: 7000000, ca: 12, pv: 500, peso: 12000.0, tags: ["Arma de Cerco", "Blindado", "Móvel", "Complexo"], detalhe: "Veículo de combate completo." }
        ]
    },
    armaduras: {
        leves: [
            { nome: "Casaco Reforçado", custo: 130, ca: "11 + DES", peso: 0, tags: ["Resistência Balística"], detalhe: "Ocupa +0,5 de espaço adicional." },
            { nome: "Jaqueta de Couro", custo: 300, ca: "11 + DES", peso: 0, tags: ["Resistência Balística"], detalhe: "Ocupa +0,5 de espaço adicional." },
            { nome: "Camisa Embutida", custo: 50, ca: "11 + DES", peso: 0, tags: ["Resistência Balística"], detalhe: "Proteção discreta." },
            { nome: "Colete Fino de Kevlar", custo: 350, ca: "12 + DES", peso: 0.3, tags: ["Resistência Balística"], detalhe: "Leve e eficiente contra disparos de baixo calibre." },
            { nome: "Colete Oculto", custo: 500, ca: "12 + DES", peso: 0.5, tags: ["Resistência Balística"], detalhe: "Projetado para não ser notado." },
            { nome: "Escudo Comum", custo: 60, ca: "+1", peso: 1.0, tags: ["Resistência Balística"], detalhe: "Aumenta a CA enquanto empunhado." }
        ],
        medias: [
            { nome: "Colete Oculto Maior", custo: 560, ca: "13 + DES (max. 2)", peso: 1.0, tags: ["RD 1 (Cort/Perf)", "Resistência Balística"], detalhe: "Oferece redução de dano física." },
            { nome: "Colete Padrão Kevlar", custo: 1200, ca: "14 + DES (max. 3)", peso: 0, tags: ["Resistência Balística"], detalhe: "Ocupa +1 de espaço." },
            { nome: "Peitoral Adamantina", custo: 180000, ca: "14 + DES (max. 3)", peso: 0, tags: ["Resistência Crítico", "Resistência Balística"], detalhe: "Anula efeito extra de críticos." },
            { nome: "Colete Tático", custo: 1500, ca: "15 + DES (max. 2)", peso: 0, tags: ["Resistência Balística", "Desv. Furtividade"], detalhe: "Ocupa +0,5 de espaço." },
            { nome: "Escudo Tático", custo: 300, ca: "+3", peso: 1.5, tags: ["Resistência Balística"], detalhe: "Proteção robusta." }
        ],
        pesadas: [
            { nome: "Colete Resposta Rápida", custo: 1000, ca: "16", peso: 1.0, requisito: "FOR 14", tags: ["RD 3 (Físico/Balístico)", "Desv. Furtividade"], detalhe: "Proteção integral." },
            { nome: "Farda de Combate", custo: 2000, ca: "17", peso: 1.0, requisito: "FOR 14", tags: ["RD 3 (Físico/Balístico)", "Desv. Furtividade"], detalhe: "Uniforme reforçado." },
            { nome: "Farda Op. Especiais", custo: 3500, ca: "18", peso: 1.5, requisito: "FOR 14", tags: ["RD 5 (Físico/Balístico)", "Desv. Furtividade"], detalhe: "Máxima proteção física." },
            { nome: "Armadura Adamantina", custo: 200000, ca: "17", peso: 1.0, requisito: "FOR 16", tags: ["Resistência Crítico", "Desv. Furtividade"], detalhe: "Extremamente pesada." },
            { nome: "Escudo Torre Tático", custo: 580, ca: "+5", peso: 3.0, requisito: "FOR 14", tags: [], detalhe: "Cobertura quase total." }
        ]
    },
    municoes: [
        { nome: "Flecha (20)", quantidade: 20, compativel: ["Arco"], peso: 1.0, custo: 50, detalhe: "Munição padrão para arcos." },
        { nome: "Projétil Bazuca", quantidade: 1, compativel: ["Bazuca"], peso: 0.5, custo: 1500, detalhe: "Munição explosiva." },
        { nome: "Cartucho Grosso (4)", quantidade: 4, compativel: ["Espingarda", "Mosquete"], peso: 0.5, custo: 50, detalhe: "Cartuchos de grosso calibre." },
        { nome: "Cartucho Fuzil (30)", quantidade: 30, compativel: ["Fuzil de Assalto"], peso: 1.0, custo: 200, detalhe: "Pente padrão." },
        { nome: "Cartucho Precisão (6)", quantidade: 6, compativel: ["Fuzil de Precisão"], peso: 1.0, custo: 100, detalhe: "Alta precisão." },
        { nome: "Cartucho Metralhadora (45)", quantidade: 45, compativel: ["Metralhadora"], peso: 1.5, custo: 300, detalhe: "Cinto de munição." },
        { nome: "Cartucho Pistola (12)", quantidade: 12, compativel: ["Pistola"], peso: 0.5, custo: 100, detalhe: "Pente padrão." },
        { nome: "Combustível", quantidade: 1, compativel: ["Motosserra", "Lança Chamas"], peso: 1.0, custo: 50, detalhe: "Galão para ferramentas motorizadas." }
    ],
    itens_medicos: [
        { nome: "Kit Antídoto", custo: 50, peso: 0.5, usos: 3, tags: ["Ingestão", "Cura"], detalhe: "Injetores para neutralizar venenos." },
        { nome: "Kit Médico", custo: 500, peso: 0.8, usos: 5, tags: ["Cura", "Estabilizar"], detalhe: "Estabiliza criatura com 0 PV sem teste." },
        { nome: "Máscara de Gás", custo: 350, peso: 0.5, usos: 15, tags: ["Ferramenta"], detalhe: "Sobreviver em ambientes com gases." },
        { nome: "Pílula Hemoglobina", custo: 5, peso: 0, exaustao: "40%", tags: ["Ingestão", "Cura"], efeito: "Cura 2d4 + CON PV" },
        { nome: "Pílula Paracetamol", custo: 10, peso: 0, exaustao: "50%", tags: ["Ingestão", "Cura"], efeito: "Cura 2d6 + CON PV" },
        { nome: "Pílula Morfina", custo: 100, peso: 0, exaustao: "60%", tags: ["Ingestão", "Cura"], efeito: "Cura 2d8 + CON PV" },
        { nome: "Respirador Aquático", custo: 350, peso: 2.0, tags: ["Ferramenta"], detalhe: "Respirar sob a água por até 1 hora." }
    ],
    kits: [
        { nome: "Kit de Armas", custo: 120, peso: 1.5, usos: 5, tags: ["Ferramenta", "Artesanal"], detalhe: "Para preparar armadilhas ou armas mundanas." },
        { nome: "Kit de Caça e Rastreio", custo: 150, peso: 1.5, usos: 5, tags: ["Ferramenta", "Rastrear"], detalhe: "Prepara armadilhas e persegue criaturas." },
        { nome: "Kit de Cozinha", custo: 80, peso: 1.0, usos: 5, tags: ["Ferramenta"], detalhe: "Preparar comida e identificar venenos." },
        { nome: "Kit de Disfarce", custo: 50, peso: 0.5, usos: 10, tags: ["Ferramenta"], detalhe: "Mudar aparência física." },
        { nome: "Kit de Falsificação", custo: 30, peso: 0.5, usos: 10, tags: ["Ferramenta"], detalhe: "Criar falsificações de documentos." },
        { nome: "Kit Forense", custo: 500, peso: 1.0, usos: 5, tags: ["Ferramenta", "Investigação"], detalhe: "Coletar evidências (DNA, resquícios)." },
        { nome: "Kit de Hacker", custo: 800, peso: 1.5, usos: 10, tags: ["Ferramenta", "Tecnologia"], detalhe: "Roteador 5g e cabos para invadir sistemas." },
        { nome: "Kit Ferramentas Ofício", custo: 50, peso: 1.5, usos: 3, tags: ["Ferramenta"], detalhe: "Tipo específico definido pelo mestre." }
    ],
    equipamentos_gerais: {
        comunicacao: [
            { nome: "Ponto de Rádio", custo: 150, peso: 0, tags: ["Comunicação", "Vestir"], detalhe: "Transmissor com receptor auditivo." },
            { nome: "Celular", custo: 1500, peso: 0.1, tags: ["Comunicação", "Conexão"], detalhe: "GPS e satélite. Acessa portal Hunter." },
            { nome: "Pen-Drive", custo: 60, peso: 0, tags: ["Armazenamento"], detalhe: "Armazenamento via USB." },
            { nome: "Câmera", custo: 600, peso: 0.5, tags: ["Armazenamento"], detalhe: "Gravação visual." },
            { nome: "Computador", custo: 3000, peso: 1.0, tags: ["Armazenamento", "Comunicação"], detalhe: "Portátil para pesquisa." }
        ],
        utilitarios: [
            { nome: "Relógio Bússola", custo: 50, peso: 0.1, tags: ["Ferramentas"] },
            { nome: "Corda (10m)", custo: 25, peso: 0.5, tags: ["Ferramentas"] },
            { nome: "Haste Luminosa (par)", custo: 35, peso: 0.2, tags: ["Ferramentas"] },
            { nome: "Gancho Escalada (par)", custo: 50, peso: 0.5, tags: ["Ferramentas"] },
            { nome: "Gerador Calor", custo: 200, peso: 1.0, tags: ["Ferramentas"] },
            { nome: "Binóculos", custo: 45, peso: 0.5, tags: ["Ferramentas"] },
            { nome: "Espelho de mão", custo: 10, peso: 0.1, tags: ["Ferramentas"] },
            { nome: "Barraca (2 pessoas)", custo: 500, peso: 2.0, tags: ["Ferramentas"] },
            { nome: "Algema", custo: 100, peso: 0.5, tags: ["Ferramentas"] }
        ],
        expansao_carga: [
            { nome: "Mochila", custo: 120, espaco_gerado: 1.5, tags: ["Ferramentas"] },
            { nome: "Mala de Roupas", custo: 120, espaco_gerado: 2.0, tags: ["Desv. Furtividade", "Ferramentas"] },
            { nome: "Mala de Viagem", custo: 120, espaco_gerado: 2.5, tags: ["Desv. Furtividade", "Ferramentas"] },
            { nome: "Bracelete acoplar", custo: 120, espaco_gerado: 1.0, tags: ["Desv. Furtividade", "Ferramentas"] },
            { nome: "Pochete", custo: 120, espaco_gerado: 0.7, tags: ["Ferramentas"] },
            { nome: "Cartucheira", custo: 120, espaco_gerado: 0.7, tags: ["Ferramentas"] },
            { nome: "Garrafa Térmica", custo: 120, peso: 0.5, tags: ["Ferramentas"] }
        ]
    }
};

const SYSTEM_DB = {
    classes: [
        { id: 'INTENSIFICAÇÃO', color: '#00ff9d', label: 'INTENSIFICAÇÃO', angle: 270, desc: 'Aura expressa maior poder, cura e resistência' },
        { id: 'TRANSMUTAÇÃO', color: '#d946ef', label: 'TRANSMUTAÇÃO', angle: 330, desc: 'Aura assume outra(s) propriedades(s)' },
        { id: 'MATERIALIZAÇÃO', color: '#ff0055', label: 'MATERIALIZAÇÃO', angle: 30, desc: 'Aura cria e altera matéria física' },
        { id: 'ESPECIALIZAÇÃO', color: '#00f0ff', label: 'ESPECIALIZAÇÃO', angle: 90, desc: 'Aura se apresenta de maneira inovadora' },
        { id: 'MANIPULAÇÃO', color: '#9ca3af', label: 'MANIPULAÇÃO', angle: 150, desc: 'Aura manipula objetos, matéria ou seres vivos' },
        { id: 'EMISSÃO', color: '#ffe600', label: 'EMISSÃO', angle: 210, desc: 'Aura se mantém forte fora do corpo e em longas distâncias' }
    ],
    xpTable: [50, 150, 350, 500, 800, 1000, 1500, 2500, 3200, 4000, 5000, 6500],
    racas: [
        // Humanos e Tribos
        { nome: "Humano Comum", descricao: "Raça mais comum no mundo.", aumento_atributo: { "FOR": 1, "DES": 1, "CON": 1, "INT": 1, "SAB": 1, "PRE": 1 }, fonte: "[3, 4]", categoria: "Humanos e Tribos" },
        { nome: "Fanalis", descricao: "Composição física descomunal.", aumento_atributo: { "FOR": 4, "CON": 2, "DES": -2, "INT": -2, "SAB": -2, "PRE": -2 }, fonte: "[3, 4]", categoria: "Humanos e Tribos" },
        { nome: "Gyudondond", descricao: "Homens Flauta.", aumento_atributo: "Distribua 3 pontos em qualquer atributo", caracteristicas: [{ nome: "Alarido de Guerra", efeito: "Intimidação com dança." }], fonte: "[3, 4]", categoria: "Humanos e Tribos" },
        { nome: "Imuchack", descricao: "Guerreiros gélidos.", aumento_atributo: { "FOR": 2, "CON": 1, "INT": -2 }, opcoes_caracteristica: [{ nome: "Imunidade ao Frio", efeito: "Imune frio/gelo." }, { nome: "Caça Aquática", efeito: "Nadar e respirar melhor." }], fonte: "[3, 4]", categoria: "Humanos e Tribos" },
        // Clãs Especiais
        { nome: "Kurta", descricao: "Olhos Escarlates.", aumento_atributo: { "INT_ou_SAB": 2 }, caracteristicas: [{ nome: "Mudança Escarlate", efeito: "+1 atributos com olhos vermelhos." }, { nome: "Caça Fascinante", efeito: "Procurado." }, { nome: "Sofrimento Profundo", efeito: "Gatilhos emocionais." }], fonte: "[5, 6]", categoria: "Clãs Especiais" },
        // Formigas Quimera
        {
            nome: "Formiga Quimera",
            descricao: "Sem Antecedentes. Ver Regra.",
            aumento_atributo: "Nenhum",
            fagogenese_options: ["Ave", "Mamífero", "Réptil/Anfíbio", "Aquático", "Inseto/Insectóide", "Bestas Mágicas"],
            caracteristicas: [
                { nome: "Arma natural", efeito: "Dano variado baseado na anatomia.", opcoes: ["Bico", "Cauda", "Chifres", "Espinhos", "Garras", "Presas (Mordida)", "Ferrão (Picada)", "Tentáculos/Cipós"] },
                { nome: "Corpo Adaptável", efeito: "Mudança corporal dramática ou adaptação ambiental.", opcoes: ["Metamorfose (Lagarta->Borboleta)", "Constituição Respiratória (Aéreo)", "Constituição Respiratória (Aquático)", "Corpo Mole (Resistência Impacto)"] },
                { nome: "Criatura de Cerco", efeito: "Dano crítico em construções e Constructos." },
                { nome: "Destreza animal", efeito: "Vantagem em testes de resistência de Destreza." },
                { nome: "Escudo Natural/Carapaça", efeito: "Resistência a tipos específicos de dano físico.", opcoes: ["Resistência a Corte", "Resistência a Perfuração", "Resistência a Impacto"] },
                { nome: "Evasão", efeito: "Manobra de fuga que adiciona +2 na Reação de Esquiva.", opcoes: ["Aérea", "Aquática", "Terrestre"] },
                { nome: "Investida", efeito: "Dano extra com movimento." },
                { nome: "Rasante", efeito: "Manobra de ataque aéreo sem receber AdO." },
                { nome: "Regeneração", efeito: "Recuperação gradual de Vida." },
                { nome: "Telepatia", efeito: "Comunicação entre espécies.", opcoes: ["Ativa (Inferior)", "Passiva (Superior)"] },
                { nome: "Tração Animal", efeito: "Capacidade de carga aumentada e/ou salto dobrado." },
                { nome: "Veneno/Peçonha", efeito: "Aplica veneno. Imune ao próprio veneno." }
            ],
            fonte: "[1, 2]",
            categoria: "Formigas Quimera"
        },
        // Modificados e Fantasia
        { nome: "Wormorfos", descricao: "Povo verme.", aumento_atributo: "Nenhum", caracteristicas: [{ nome: "Visão", efeito: "Ecolocalização." }, { nome: "Corpo Malemolente", efeito: "Resistência concussão." }, { nome: "Enterrada", efeito: "Submergir." }], fonte: "[5, 6]", categoria: "Modificados e Fantasia" },
        { nome: "Elfos e Meio-Elfos", descricao: "Herança feérica.", aumento_atributo: "Escolha +2", caracteristicas: [{ nome: "Ancestral Feérico", efeito: "Vantagem social." }], fonte: "[5, 6]", categoria: "Modificados e Fantasia" },
        { nome: "Meio-Orcs", descricao: "Guerreiros robustos.", aumento_atributo: { "FOR": 1, "CON": 1 }, caracteristicas: [{ nome: "Resistência Implacável", efeito: "Volta a 1 HP." }], fonte: "[5, 6]", categoria: "Modificados e Fantasia" },
        { nome: "Anões", descricao: "Robustos.", aumento_atributo: { "CON": 2 }, caracteristicas: [{ nome: "Resiliência Anã", efeito: "Vantagem veneno." }], fonte: "[7]", categoria: "Modificados e Fantasia" },
        { nome: "Draconatos", descricao: "Herança dragão.", aumento_atributo: "Escolha +2", caracteristicas: [{ nome: "Arma de Sopro", efeito: "2d6 dano." }], fonte: "[7]", categoria: "Modificados e Fantasia" },
        { nome: "Halflings", descricao: "Pequenos e sortudos.", aumento_atributo: { "DES": 1, "INT": 2 }, opcoes_caracteristica: [{ nome: "Sortudo", efeito: "Rerolar 1." }, { nome: "Bravura", efeito: "Vantagem medo." }, { nome: "Agilidade", efeito: "Passar por maiores." }], fonte: "Extra", categoria: "Modificados e Fantasia" },
        { nome: "Gnomos", descricao: "Inventores.", aumento_atributo: "Escolha +2", caracteristicas: [{ nome: "Esperteza Gnômica", efeito: "Vantagem mental magia." }], fonte: "Extra", categoria: "Modificados e Fantasia" },
        { nome: "Golias", descricao: "Gigantes de pedra.", aumento_atributo: "Escolha +2", caracteristicas: [{ nome: "Resistência de Pedra", efeito: "Reduz dano." }], fonte: "Extra", categoria: "Modificados e Fantasia" },
        // Tecnológicos e Sobrenaturais
        { nome: "Neans", descricao: "Andróides.", aumento_atributo: "Varia", caracteristicas: [{ nome: "Atualização", efeito: "Muda atributos." }, { nome: "Curto Circuito", efeito: "Dano elétrico." }], fonte: "[8, 9]", categoria: "Tecnológicos e Sobrenaturais" },
        { nome: "Vampiros", descricao: "Seres noturnos.", aumento_atributo: { "INT": 2, "Físico": 1 }, caracteristicas: [{ nome: "Sugar Aura", efeito: "Rouba aura." }, { nome: "Sol", efeito: "-CA." }], fonte: "[8, 9]", categoria: "Tecnológicos e Sobrenaturais" },
        { nome: "Djins", descricao: "Nen Post-Mortem.", aumento_atributo: "Escolha +2", caracteristicas: [{ nome: "Interpretação Travessa", efeito: "Ignora sorte." }], fonte: "Extra", categoria: "Tecnológicos e Sobrenaturais" },
        // Raças Incomuns
        { nome: "Bugbears", descricao: "Brutais.", aumento_atributo: { "FOR": 2, "DES": 1 }, caracteristicas: [{ nome: "Ataque Surpresa", efeito: "Dano extra." }], fonte: "Extra", categoria: "Raças Incomuns" },
        { nome: "Dahllans", descricao: "Meio-Dríades.", aumento_atributo: { "SAB": 4, "INT": -1, "PRE": -1 }, caracteristicas: [{ nome: "Herança Natural", efeito: "Visão penumbra." }], fonte: "Extra", categoria: "Raças Incomuns" },
        { nome: "Firbolgs", descricao: "Guardiões.", aumento_atributo: { "SAB": 2, "FOR": 1 }, caracteristicas: [{ nome: "Passo Oculto", efeito: "Invisibilidade." }], fonte: "Extra", categoria: "Raças Incomuns" },
        { nome: "Goblins", descricao: "Maliciosos.", aumento_atributo: "Escolha +2", caracteristicas: [{ nome: "Fúria do Pequeno", efeito: "Dano extra." }], fonte: "Extra", categoria: "Raças Incomuns" }
    ],
    antecedentes: [
        { nome: "Amigo dos Animais", descricao: "Pessoas que se importam com o equilíbrio da natureza, mas que também adoram um desafio, andam pelas florestas e pântanos buscando encontrar criaturas fantásticas e desconhecidas. Por outro lado, muitos amigos dos animais são simplesmente amados pela natureza como se fizessem parte dela.", proficiencias: "Escolha um Kit dentre os recebidos e Lidar com Animais e Natureza", equipamento: ["Qualquer arma simples", "Qualquer arma simples", "Kit de Caça e Rastreio de Criaturas ou Kit Médico"], caracteristicas: [{nome: "Habitat Natural", efeito: "Animais e Feras (inclusive hostis) normalmente o consideram outra criatura não hostil. Seus companheiros são tratados como membros aliados do seu bando, desde que não atuem de forma hostil."}, {nome: "Tarzan/Jane", efeito: "De alguma forma você se acostumou com a linguagem de animais e feras. Ao passar um minuto interagindo com uma criatura não hostil você pode identificar alguma informação que ela já tenha conhecimento sobre o ambiente ou uma outra criatura."}, {nome: "Companheiro Inabalável", efeito: "Você tem um companheiro que te concede a Ação 'Ajuda' no turno dele. Ele te entende e obedece comandos simples."}] },
        { nome: "Aristocrata", descricao: "Pessoas que entendem de riqueza, poder e privilégios. Mas não só entendem, elas desfrutam e estão acostumadas a isso. Através de algum título de nobreza, sua família exerce algum tipo de influência política significativa.", proficiencias: "História e Religião", equipamento: ["Celular ou Câmera", "Computador", "Mochila 3 (Mala)", "Qualquer arma simples"], caracteristicas: [{nome: "Posição Privilegiada", efeito: "Você é bem-vindo na alta sociedade e as pessoas assumem que você tem o direito de estar onde está. As pessoas comuns fazem todos os esforços para acomodá-lo e evitar seu desprazer."}, {nome: "Mauricinho / Patricinha", efeito: "Você recebe toda semana uma quantia correspondente aos recursos financeiros de sua família de acordo com a tabela ao rolar 1d4."}] },
        { nome: "Artista", descricao: "Pessoas com as mais variadas capacidades de entretenimento se aventuram no mundo artístico para realizar seus sonhos vivendo daquilo que amam ou buscando alcançar fama e dinheiro.", proficiencias: "Kit de Ferramenta de Ofício e escolha 3 dentre: Acrobacia, Atuação, Intuição ou Prestidigitação", equipamento: ["Mala de Roupas ou Mochila Comum/Maleta", "Câmera ou Celular", "Kit de Ferramentas de Ofício"], caracteristicas: [{nome: "Tudo no @", efeito: "Comerciantes que negociam com você reconhecem seu trabalho como artista, você tem chance (50%) de pagar suas compras com merchandising."}, {nome: "Virando a Cadeira", efeito: "Apresentar sua arte às pessoas antes de conversar ou negociar, faz com que fiquem fascinadas por você e tenham uma inclinação a concordar com sua opinião. Vantagem em testes de Carisma."}] },
        { nome: "Assassino", descricao: "Assassinos famosos como a família Zoldyck e ainda outros, desenvolvem habilidades próprias para sua profissão e, com isso, se tornam peritos naquilo que fazem. A arte de matar de forma rápida.", proficiencias: "Escolha um Kit dentre os recebidos e Acrobacia e Furtividade", equipamento: ["Adaga/Faca", "Veneno Variante: 1 frasco", "Pochete de Perna", "Kit de disfarce ou Kit de Falsificação"], caracteristicas: [{nome: "Eco do Ritmo", efeito: "Se concentrar em seu turno completo projeta um padrão hipnótico, fazendo com que todas as criaturas hostis tenham desvantagem em jogadas de ataque direcionadas a você."}, {nome: "Sumidão", efeito: "Vantagem em todos os testes de furtividade de qualquer natureza e não é descoberto ao realizar um ataque enquanto se está furtivo."}, {nome: "Máquina de Matar", efeito: "Dano dobrado (nos dados) em ataques realizados enquanto se está oculto/furtivo."}] },
        { nome: "Caçador de Feras", descricao: "Nesse mundo existem diversas criaturas desconhecidas e hostis que se reproduzem nas sombras enquanto sobrepujam habitat naturais de outras criaturas.", proficiencias: "Escolha um Kit dentre os recebidos e Natureza e Sobrevivência", equipamento: ["Espingarda Carregada ou Tazer", "Kit de Caça e Rastreio de Criaturas ou Kit Antídoto", "Qualquer arma simples ou Marcial e Rede"], caracteristicas: [{nome: "Temos que Pegar!", efeito: "Vantagem em todos os testes relacionados a rastrear feras naturais e bestas mágicas (inclusive bestas de NEN)."}, {nome: "Desbravador", efeito: "Você recebe +2 em sobrevivência e anula qualquer penalidade de sobrevivência não causadas por Hatsus."}] },
        { nome: "Cientista", descricao: "Após muito estudo e dedicação, começam a arriscar a vida também no campo experimental para comprovar suas teorias e hipóteses.", proficiencias: "Escolha 2 perícias com Kits e 3 dentre: História, Investigação, Medicina, Natureza, Prestidigitação, Religião ou Sobrevivência.", equipamento: ["Qualquer arma simples", "1 Mochila Comum/Maleta", "Kit Antídoto ou Kit Médico", "Kit de Armas ou Kit Forense ou Kit de Hacker"], caracteristicas: [{nome: "Explorar Fraqueza", efeito: "O personagem pode utilizar sua ação principal para analisar o oponente ou situação tendo vantagem no próximo ataque contra um inimigo ou teste baseado em inteligência."}, {nome: "Mestre do Planejamento", efeito: "Ao utilizar um item / kit escolhido no antecedente, você ganha um 1d6 para rolar em qualquer jogada ou teste cabível 3 vezes por dia."}] },
        { nome: "Criminoso", descricao: "Essas pessoas normalmente vivem à margem da lei, desprezando e quebrando os regulamentos da sociedade.", proficiencias: "Escolha um Kit dentre os recebidos e Enganação e Furtividade", equipamento: ["Qualquer arma simples ou Marcial", "1 Pochete", "Item do Tipo de Criminoso (Cleptomaníaco, Estelionatário, etc)"], caracteristicas: [{nome: "Cleptomaníaco", efeito: "Inicia com celular roubado e kit de ferramentas de ofício."}, {nome: "Estelionatário", efeito: "Acesso a kits de falsificação ou disfarce para golpes."}, {nome: "Político Corrupto", efeito: "Possui informações privilegiadas (Pen-Drive) para manipular poder e influência."}, {nome: "Traficante", efeito: "Inicia com recursos financeiros de vendas ilícitas e contatos de fornecedores."}] },
        { nome: "Discípulo", descricao: "Uma pessoa que é orientada por um mestre e normalmente continua seguindo suas orientações. Dependendo do mestre o discípulo pode se desenvolver em áreas diferentes a partir de suas aptidões.", proficiencias: "Kit de Ferramenta de Ofício e Escolha 3 perícias quaisquer", equipamento: ["Celular com contato ou anotações de seu mestre", "Qualquer arma simples ou Marcial", "Kit de Ferramentas de Ofício"], caracteristicas: [{nome: "Abre-te Sésamo", efeito: "Você consegue acessar alguns lugares ou pessoas e informações a partir da fama do seu mestre e da credibilidade que o nome lhe confere."}, {nome: "Mateus 28.18-20", efeito: "Seu mestre supostamente morreu ou desapareceu, porém ele lhe concedeu um ensinamento, poder, item, equipamento ou marca que te permite continuar sua história."}] },
        { nome: "Guarda Costas", descricao: "Arduamente treinados para trabalhos físicos, guarda-costas podem ser pessoas dispostas a fazer um trabalho perigoso por dinheiro.", proficiencias: "Atletismo e Intimidação", equipamento: ["Pistola", "Qualquer arma simples ou Marcial"], caracteristicas: [{nome: "Artista Marcial", efeito: "Você treinou técnicas e desenvolveu seu corpo ao máximo para o combate corpo-a-corpo. Seus golpes desarmados causam 1d6 no lugar de 1d4."}, {nome: "Horário de Trabalho", efeito: "Você consegue escolher uma pessoa para manter sua atenção de forma constante. Você tem vantagem e +2 em jogadas de percepção para encontrar essa pessoa."}] },
        { nome: "Líder", descricao: "Você é uma pessoa que procura mudar a sociedade ao seu redor jogando na arena da política, pessoas e personalidades.", proficiencias: "Escolha três entre Enganação, História, Investigação ou Persuasão", equipamento: ["1 pílula de Hemoglobina", "1 pílula de Hemoglobina variante", "Qualquer arma simples", "Qualquer outro Kit"], caracteristicas: [{nome: "Presença de Liderança", efeito: "Sua presença notável e inspiradora concede 1d4 (grau básico) que pode ser utilizado em qualquer jogada de seus aliados (cada um) até o fim do dia."}] },
        { nome: "Marinheiro", descricao: "Você navegou em um navio pelo mar durante anos, enfrentando poderosas tormentas e monstros abissais.", proficiencias: "Atletismo e Percepção", equipamento: ["Corrente Pesada ou Rede", "Qualquer arma simples ou Marcial"], caracteristicas: [{nome: "Grande Herói da Marinha", efeito: "Você não gasta passagem em navios, jatos, aviões e dirigíveis. Possui Documento de patente e Experiência de Convés."}, {nome: "Imperador do Mar", efeito: "Buscando mais poder você ouviu falar de NEN. Possui Experiência de Convés, Pistola ou Mosquete, Arma simples ou Marcial e Relógio à prova d'água."}] },
        { nome: "Mentalista", descricao: "Conhecedores do funcionamento da mente, mentalistas são profissionais que trabalham com a realidade do pensamento ou com a ilusão.", proficiencias: "Escolha um Kit dentre os recebidos e Enganação ou Persuasão e Intuição", equipamento: ["Qualquer arma simples", "Kit de Falsificação ou Kit de Ferramenta de Ofício"], caracteristicas: [{nome: "Perceptivo", efeito: "+2 em testes de Percepção."}, {nome: "Referência Bibliográfica", efeito: "Possui vantagem em todos os testes de Carisma contra humanoides com inteligência igual ou superior a Modificador 0."}] },
        { nome: "Negociante", descricao: "Indivíduos acostumados a lidar com o público e, por isso, possuem facilidade na oratória e na persuasão.", proficiencias: "Atuação, Persuasão e Prestidigitação", equipamento: ["Qualquer equipamento dentro do orçamento de 2.000 $", "1 Mala de Roupas"], caracteristicas: [{nome: "Camelô", efeito: "Quando vender qualquer item seu usado, você consegue vendê-lo com o custo oficial, desde que esteja funcional."}, {nome: "Pechincheiro", efeito: "Você consegue comprar qualquer item com desconto de 30% do valor de mercado (exceto armas de fogo e itens místicos)."}] },
        { nome: "Ninja", descricao: "Esgueirando-se na noite ou no meio da multidão, submetendo seus corpos à torturas para acostumarem-se com a dor e aplicando técnicas nunca antes vistas.", proficiencias: "Escolha um Kit dentre os recebidos e Acrobacia ou Atletismo e Furtividade", equipamento: ["Armas Ninja Variadas", "Kit de disfarce ou Kit de Falsificação", "Explosivos Ninja", "Qualquer arma simples ou Marcial"], caracteristicas: [{nome: "Furtividade Superior", efeito: "Vantagem em testes de furtividade de qualquer natureza."}, {nome: "Jutsu: Clone das Sombras", efeito: "Cria um clone sólido. 5/5 PV, mesmas características sem NEN. Pode usar ação bônus para comandar clones."}, {nome: "Jutsu: Substituição", efeito: "Reação para fuga rápida com CA +5 e chance de aparecer em até 3m de onde estava."}] },
        { nome: "Órfão", descricao: "Você cresceu nas ruas, sozinho, órfão e pobre. Você não tinha ninguém para cuidar de você ou te alimentar, então, aprendeu a se virar sozinho.", proficiencias: "Escolha 2 perícias com Kits recebidos. Recebe ainda Furtividade e Intuição ou Prestidigitação", equipamento: ["Kit de Disfarce", "Kit de Ferramentas de Ofício ou Kit de Armas", "Qualquer arma simples"], caracteristicas: [{nome: "Segredos da Cidade", efeito: "Você conhece os padrões secretos e o fluxo das cidades. Quando não em combate, você e companheiros podem viajar com o dobro da velocidade."}, {nome: "Zé-Pequeno", efeito: "Vantagem em todos os testes de Carisma quando se tratam de assuntos, pessoas e temas relacionados à máfia e ao conhecimento do submundo."}, {nome: "Insignificante", efeito: "Os inimigos tendem a te ignorar se você não fizer nada que os ameace e nem for o foco inicial de um conflito."}] },
        { nome: "Recluso", descricao: "Você viveu em reclusão – ou em uma comunidade isolada como um monastério ou completamente sozinho – por um período importante da sua vida.", proficiencias: "Escolha 1 perícia com Kit recebido e Intuição, Medicina e Religião", equipamento: ["Qualquer arma simples ou Marcial", "Kit de Armas ou Kit de Caça e Rastreio de Criaturas"], caracteristicas: [{nome: "Monge", efeito: "Vantagem em qualquer teste de constituição. Treinou técnicas corporais para o combate desarmado. Seus golpes desarmados causam 1d6 no lugar de 1d4."}, {nome: "Escravo", efeito: "Resistente a intimidação com ou sem aura. Pessoas com posição de autoridade alheias a você tem desvantagem em qualquer teste de carisma que não lhe beneficie."}] },
        { nome: "Soldado", descricao: "A guerra sempre esteve na vida de soldados. Treinando desde jovem, estudando o uso das armas e armaduras, aprendendo técnicas básicas de sobrevivência.", proficiencias: "Escolha 1 perícia com Kit recebido e Atletismo e Intimidação ou Sobrevivência", equipamento: ["Qualquer arma simples ou Marcial", "Kit de Armas ou Kit de Caça e Rastreio de Criaturas", "1 Mala de Roupas ou Mochila Comum/Maleta"], caracteristicas: [{nome: "Batedor", efeito: "Acostumado a abrir caminho para investigar planos do inimigo (Vantagem em Investigação e Furtividade quando estiver sozinho ou 20 metros separado do grupo)."}, {nome: "Médico de Combate", efeito: "Conhece procedimento que impede malefícios das pílulas de hemoglobina e suas variações e consegue aplicar em uma pessoa por dia."}, {nome: "Atirador de Elite", efeito: "Atacar alvos além da distância normal não impõe desvantagem. Ataques ignoram meia cobertura e três-quartos."}] },
        { nome: "Agente de Saúde", descricao: "Um amor pela saúde dos outros, ou ainda um compromisso com a vida (seja por promessa ou dinheiro) domina todos dessa origem.", proficiencias: "Kit Médico ou Antídoto e Medicina e Percepção", equipamento: ["Qualquer arma simples", "Kit Médico", "Kit Antídoto ou 3 pílulas de Hemoglobina variante"], caracteristicas: [{nome: "Técnica Medicinal", efeito: "Sempre que cura um personagem, você adiciona seu INTx2 no total de PV curados."}, {nome: "Primeiros Socorros", efeito: "+3 em testes para estabilizar outros personagens. Aumenta o proveito do Kit de primeiros socorros."}, {nome: "Médico Experimental", efeito: "Pode fazer qualquer antídoto com kit de primeiros socorros e algum item da natureza ao redor."}] },
        { nome: "Atleta", descricao: "Você tem um físico primoroso e bem trabalhado, você competia/compete em algum tipo de esporte, individual ou coletivo.", proficiencias: "Atletismo e Acrobacia ou Intuição ou Percepção", equipamento: ["Qualquer arma simples", "1 pílula de Hemoglobina variante: (Morfina)"], caracteristicas: [{nome: "Bolt", efeito: "Seu físico primoroso lhe permite fazer uma ação de movimento extra ou saltar em distância metade de seu deslocamento."}, {nome: "Implacável", efeito: "Se falhar em um teste de resistência, você pode rolar novamente para o teste, mas é obrigado a manter o novo resultado."}] },
        { nome: "Chef", descricao: "Um ótimo cozinheiro, com habilidades de impressionar qualquer um.", proficiencias: "Com todos os kits recebidos e Sobrevivência, Percepção e História", equipamento: ["Qualquer arma simples", "Kit de Cozinha", "Kit de Caça e Rastreio de Criaturas"], caracteristicas: [{nome: "Sabor Único", efeito: "Com os ingredientes você pode fazer qualquer um dos tipos de pratos, além de você ter um bônus de 1d6 em testes de CAR 'contra' pessoas que comeram sua comida."}, {nome: "Sabor de Casa", efeito: "Com os ingredientes certos, você pode fazer uma comida que vale por um descanso curto."}] },
        { nome: "Circense", descricao: "Você sobrevivia com base em seu corpo e suas performances, fazendo malabares, piruetas e o que mais estivesse em seu arsenal.", proficiencias: "Kit de Disfarce, Acrobacia, Atuação e Persuasão ou Enganação", equipamento: ["Qualquer arma simples", "Kit de Disfarce", "Roupa Chique"], caracteristicas: [{nome: "Performance", efeito: "Você tem +5 em acrobacia ou prestidigitação para seus números."}, {nome: "Mimetismo", efeito: "Você consegue imitar sons que já tenha escutado, incluindo vozes."}] },
        { nome: "Gamer", descricao: "Alguém que vivia em casa jogando os mais diversos jogos, talvez um famoso pro-player, talvez apenas alguém que fugia da realidade nos games.", proficiencias: "Kit de Hacker, História e Intuição", equipamento: ["Qualquer arma simples", "Dispositivo de PEM", "Computador, Celular e Pen Drive", "Kit de Hacker"], caracteristicas: [{nome: "Dormir não dá XP", efeito: "Ao invés de descansar, algumas latas de enérgico te fazem passar por um descanso normal, porém da próxima vez você precisará descansar."}, {nome: "Procrastinador", efeito: "Você é acostumado a deixar tudo para a última hora, você consegue fazer tudo na metade do tempo, mas nem sempre ficará bom."}] },
        { nome: "Investigador", descricao: "Um detetive, de renome ou não, trabalhando em busca de saber os mistérios do mundo, de casos policiais, ou daquilo que pegar mais.", proficiencias: "Kit Forense, Investigação e Atuação ou Intuição ou Percepção ou Enganação", equipamento: ["Pistola", "Kit Forense", "Ponto de rádio"], caracteristicas: [{nome: "Detetive", efeito: "O mestre sempre irá te falar uma coisa extra, sem precisar jogar investigação em toda cena de investigação."}, {nome: "Rede de Contatos", efeito: "Graças à influência da sua agência, você pode obter cinco informações por campanha sem custo."}] },
        { nome: "Piloto", descricao: "Alguém que manda muito bem no volante, um piloto de fuga, um corredor de Fórmula 1. Pra que frear se eu posso acelerar e dar um drift?", proficiencias: "Percepção, Intuição e Prestidigitação (Pilotar)", equipamento: ["Qualquer arma simples", "Moto (pode pagar a diferença para ter um carro)"], caracteristicas: [{nome: "Manobras Maníacas", efeito: "Com uma ação bônus, e desde que esteja dentro de um veículo, o jogador desvia de qualquer coisa menor que seu veículo automaticamente."}, {nome: "Piloto de Fuga", efeito: "Com uma ação normal você pressiona o acelerador como nunca, dobrando sua velocidade atual enquanto em um veículo."}, {nome: "Experiência no Volante", efeito: "Você recebe +3 em testes para pilotar."}] },
        { nome: "Religioso", descricao: "Talvez um padre, um pastor, talvez um fanático de uma religião pouco conhecida. Mas com certeza alguém a procura de mais pessoas para o seu 'culto'.", proficiencias: "Religião e História", equipamento: ["Qualquer arma simples", "Bíblia, ou qualquer outro livro sagrado"], caracteristicas: [{nome: "Pregar", efeito: "Você recebe +3 em teste de Religião para acalmar. E quando acalmar alguém, a pessoa acalmada receberá uma ação protagonista para gastar no próximo turno."}, {nome: "Orador Público", efeito: "Sempre que realizar um teste de Carisma (Persuasão) enquanto estiver falando para um grupo grande de pessoas, você adiciona o dobro do seu bônus de proficiência."}, {nome: "Benção Divina", efeito: "Após fazer uma oração a seu deus você se sente momentaneamente motivado e revigorado (seu modificador de SAB sobe um ponto)."}] },
        { nome: "Mestre de RPG", descricao: "Você viveu sua vida narrando feitos incríveis, mas cansou de contar a história dos outros e resolveu começar sua própria aventura épica.", proficiencias: "Atuação, História e Enganação", equipamento: ["Celular e Um kit de dados", "Computador", "Casaco reforçado"], caracteristicas: [{nome: "Mestre do Improviso", efeito: "Seus jogadores já botaram você em tanta enrascada que nada mais te surpreende, você se torna imune a condição 'surpreso' e tem vantagem em testes de carisma para convencer alguém de algo que você acabou de pensar."}, {nome: "Sombra do Verdadeiro Mestre", efeito: "Uma vez por missão casualmente seu personagem diz algo que vai virar verdade, você não escolhe o que será isso, tudo que seu personagem falar poderá ser escolhido pelo mestre."}] }
    ],
    inclinacoes: {
        positivas: [
            { nome: "Aliado", custo: 1, desc: "O personagem possui um velho amigo que pode lhe oferecer ajuda, informações e abrigo caso esteja próximo de sua residência." },
            { nome: "Contatos", custo: 1, desc: "Você tem um associado que lhe fornece informações úteis ou faz pequenos favores.", hasOptions: true, options: [{ label: "Informação rápida", custo: 1, desc: "Recebe uma informação sobre a dúvida em até 24 horas por $500." }, { label: "Informação de confiança", custo: 2, desc: "Recebe todas as informações disponíveis, explicando quais se podem confiar ($2000)." }, { label: "Informação barata", custo: 1, desc: "Diminui o custo da informação rápida de $500 para até $100." }] },
            { nome: "Corpo de Gigante", custo: 5, desc: "Você é enorme e por isso tem um nível a mais de vitalidade. +5 HP inicial e +3 por nível. O usuário tem que ficar com altura acima de 2,10m e não consegue utilizar armas leves e pequenas sem depender de uma técnica." },
            { nome: "Empatia com Animais", custo: 1, desc: "Você é talentoso em entender o comportamento dos animais. Superando um teste de INT = 10 você compreende o estado emocional do animal - amigável, assustado, hostil, faminto, etc." },
            { nome: "Fôlego", custo: 2, desc: "Dificilmente alguém terá sucesso te asfixiando ou afogando. Você consegue prender a respiração por 5-7 minutos fazendo esforço e 10-15 apenas nadando de forma despretensiosa ou se concentrando." },
            { nome: "Inventor", custo: 1, desc: "Modifica equipamentos ou cria novos. Selecione os benefícios:", hasOptions: true, options: [{ label: "Propriedade de Dano", custo: 1, desc: "Dão até 1d8 de dano natural de qualquer propriedade (max. 3 propriedades)." }, { label: "Alcance/Alvos", custo: 1, desc: "Atingem até 2 alvos." }, { label: "Compacto", custo: 1, desc: "Diminuem até 4 de espaço/peso." }, { label: "Defensivo", custo: 1, desc: "Aumentam até 2 de CA." }] },
            { nome: "Ligação com a Máfia", custo: 3, desc: "O personagem tem certa influência com alguma família mafiosa e poderá pedir alguns favores, mas cuidado, é bom não exagerar, pois eles normalmente pedem favores em troca." },
            { nome: "Sentidos Aguçados", custo: 1, desc: "Seus sentidos são mais desenvolvidos (+2 em testes específicos).", hasOptions: true, options: [{ label: "Audição Aguçada", custo: 1, desc: "+2 para escutar ou reparar sons incomuns (ex: engatilhar arma no escuro)." }, { label: "Paladar e Olfato", custo: 1, desc: "+2 para reparar gosto/cheiro. Bônus passivo antes de ingerir (evita veneno)." }, { label: "Tato Aguçado", custo: 1, desc: "+2 em detectar pelo toque ou Prestidigitação (ex: revistar suspeito)." }, { label: "Visão Aguçada", custo: 1, desc: "+2 em localizar visualmente, procurar armadilhas ou pegadas." }] },
            { nome: "Sorte Grande", custo: 3, desc: "Você pode re-rolar 1 dado por sessão ficando com o maior resultado." },
            { nome: "Tempo de Vida Estendido (Anomalia)", custo: 3, desc: "Independente de que raça pertença, você é uma anomalia. Seu ciclo de vida se estende em uma margem de 20 anos a mais em todos os períodos de desenvolvimento após a infância." },
            { nome: "Visão no Escuro", custo: 2, desc: "Você pode ver 9m no escuro como se fosse dia e não sofre penalidades de escuridão que não conte como bloqueio ou aplique cegueira." }
        ],
        negativas: [
            { nome: "Avareza", valor: 2, desc: "Você fica preocupado demais em conservar sua riqueza. Você deverá procurar sempre o melhor negócio. Faça um teste de autocontrole (SAB/INT ou CAR) toda vez que tiver que gastar algum dinheiro." },
            { nome: "Azar Grande", valor: 3, desc: "Você DEVE re-rolar seu primeiro acerto crítico no d20 da sessão." },
            { nome: "Desatencioso", valor: 1, desc: "Você consegue entender as emoções dos outros, mas não as suas intenções. Isto faz de você desajeitado em situações envolvendo manipulação social. Você é o clássico 'nerd' e sofre -1 para usar ou resistir a Testes de Influência." },
            { nome: "Dívida", valor: 3, desc: "Você deve um favor a alguém que te ajudou em um momento de dificuldade. Essa pessoa poderá te cobrar esse favor a qualquer momento e poderá ser qualquer coisa." },
            { nome: "Esquecido", valor: 1, desc: "Você tem dificuldade de se recordar de nomes, lugares, aparências e informações. É bem comum causar confusão por isso." },
            { nome: "Honestidade", valor: 2, desc: "Você precisa obedecer a lei sempre e dar o melhor de si para que os outros também o façam. Você assumirá também que os outros são honestos até saber o contrário." },
            { nome: "Indeciso", valor: 5, desc: "Você tem muita dificuldade para se decidir, recebendo -3 em rolagens de iniciativa. Além disso, sempre que se deparar com uma escolha, faça um teste simples de INT ou CAR CD 15." },
            { nome: "Inimigo", valor: 1, desc: "Alguém ou algo que ativamente tenta te prejudicar.", hasOptions: true, options: [{ label: "Fraco", valor: 1, desc: "Inimigo chato, objetivos estúpidos, aparece para atrapalhar (Ex: Equipe Rocket)." }, { label: "Rival", valor: 2, desc: "Inimigo mediano, mesmos objetivos que você, fará de tudo para atrapalhar inclusive lutar." }, { label: "Poderoso", valor: 5, desc: "Chefão maligno. Te caça para recrutar ou matar sem piedade." }] },
            { nome: "Inveja", valor: 1, desc: "Você tem uma reação muito ruim frente a qualquer um que pareça mais inteligente, mais atraente, poderoso ou em melhor situação do que a sua!" },
            { nome: "Perda Auditiva", valor: 1, desc: "Você não é surdo, mas perdeu uma parte da audição e sofrerá um redutor de -3 em qualquer teste de Audição." },
            { nome: "Veracidade", valor: 2, desc: "Você odeia dizer uma mentira ou o faz muito mal. Ter que mentir pode fazer literalmente você ficar enjoado ou com peso na consciência (Condição Envenenado ou -5 Sanidade)." }
        ]
    },
    skills: [
        'TR de FOR', 'TR de DES', 'TR de CON', 'TR de INT', 'TR de SAB', 'TR de PRE',
        'Acrobacia', 'Arcanismo', 'Atletismo', 'Atuação', 'Enganação',
        'Furtividade', 'História', 'Intimidação', 'Intuição', 'Investigação',
        'Lidar com Animais', 'Medicina', 'Natureza', 'Percepção', 'Persuasão',
        'Prestidigitação', 'Religião', 'Sobrevivência'
    ],
    otherSkills: [
        'Armas Marciais corpo-a-corpo',
        'Armas Marciais à distância',
        'Armas Simples corpo-a-corpo',
        'Armas Simples à distância',
        'Equipamentos de Proteção e Armaduras Médias',
        'Equipamentos de Proteção e Armaduras Pesadas',
        'Equipamentos Improvisados/Manufaturados (Bugigangas e Armas de Hatsus criativos)',
        'Científicas/Explosivas',
        'Linguas Antigas e Culturas',
        'Armas de Cerco',
        'Kits'
    ],
    pointBuyCosts: { 30:50, 29:47, 28:44, 27:41, 26:38, 25:35, 24:32, 23:29, 22:26, 21:23, 20:20, 19:17, 18:14, 17:11, 16:8, 15:6, 14:4, 13:3, 12:2, 11:1, 10:0, 9:-1, 8:-2, 7:-4, 6:-6, 5:-8, 4:-11, 3:-14, 2:-17, 1:-20 }
};

const SKILL_MAP = {
    'FOR': ['Atletismo'],
    'DES': ['Acrobacia', 'Furtividade', 'Prestidigitação'],
    'CON': [],
    'INT': ['Arcanismo', 'História', 'Investigação', 'Natureza', 'Religião'],
    'SAB': ['Lidar com Animais', 'Intuição', 'Medicina', 'Percepção', 'Sobrevivência'],
    'PRE': ['Atuação', 'Enganação', 'Intimidação', 'Persuasão']
};
