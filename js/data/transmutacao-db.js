window.TRANSMUTACAO_DB = {
    elemental: [
        { id:'acido', nome:'Ácido', icon:'🧪', cor:'#84cc16',
          efeito:'Propriedade corrosiva. Alvos ficam Expostos.',
          progressao:[
            { nivel:1, nome:'Ácido', desc:'Aura corrosiva — alvos ficam Expostos e matéria sólida/orgânica é danificada.' },
            { nivel:3, nome:'Corrosão de Proteção', desc:'Cada acerto reduz a CA do alvo em −1 (máx. −5).' },
            { nivel:5, nome:'Queimadura Química', desc:'Aura ácida queima o alvo com dano ácido. Condição: Queimado.' },
            { nivel:6, nome:'Dissolução Proximal', desc:'Derrete o solo ao redor. Inimigos que terminam o turno no espaço (agarrados ou não) recebem +1 grau/passo de dano ao serem atingidos.' },
            { nivel:8, nome:'Diabo Verde', desc:'Ao atingir arma/item, reduz 1 grau/passo do dado de dano até ser reparado.' },
            { nivel:10, nome:'Deterioração Corrosiva', desc:'Dano \"necrótico\" — reduz do total máximo de vida, não da vida atual.' },
          ]},
        { id:'agua', nome:'Água/Líquido', icon:'💧', cor:'#38bdf8',
          efeito:'Alvo fica Molhado (vulnerável a elétrico), desvantagem vs gelo.',
          progressao:[
            { nivel:1, nome:'Água/Líquido', desc:'Molha o que toca — alvo Molhado (vulnerável a dano Elétrico, desvantagem vs TRs de Gelo).' },
            { nivel:1, nome:'Jato Poderoso', desc:'Golpes aplicam jato que pode deixar o alvo Caído.' },
            { nivel:1, nome:'Encharcar', desc:'Encharca alvos e equipamentos — −1 em resultados de reações do alvo.' },
            { nivel:1, nome:'Manto de Fluidez', desc:'Usuário fica escorregadio — +2 em testes de acrobacia para escapar de agarrões.' },
            { nivel:3, nome:'Lâmina de Pressão', desc:'Fios/lâminas de alta velocidade — ignora 2 de RD.' },
            { nivel:6, nome:'Absorção Hidráulica', desc:'Densidade líquida amortece — +2 de Redução de Dano.' },
            { nivel:10, nome:'Refração de Água', desc:'Distorce luz. Inimigos à distância recebem −5 em Acertos; corpo-a-corpo podem ficar Ofuscados (−2).' },
          ]},
        { id:'vento', nome:'Ar/Vento/Gases', icon:'🌪️', cor:'#a3e635',
          efeito:'Voo, redução de dano de queda 50%, ou ignora RD físico em 3.',
          progressao:[
            { nivel:1, nome:'Ar/Vento/Gases', desc:'Escolha: a) voo independente do peso de carga, b) redução de queda 50%, ou c) pressão interna — ignora RD físico em 3.' },
            { nivel:3, nome:'Ar Rarefeito', desc:'Dificulta respiração. Alvo sofre −1 em CON e fica Asfixiado ao ser golpeado na cabeça.' },
            { nivel:3, nome:'Reagente Coringa', desc:'Mistura com outro elemento: +1 grau de dano, TR ou Alcance/Área.' },
            { nivel:3, nome:'Turbulência de Aura', desc:'Correntes caóticas. Alvo −1 em ataques à distância OU alvos em área recebem Resistente a danos físicos externos.' },
            { nivel:5, nome:'Vácuo de Comunicação', desc:'Fina camada ruidosa impede som/ar do alvo — perde a capacidade de falar (ser ouvido) ou ouvir.' },
            { nivel:5, nome:'Impacto de Vendaval', desc:'Alvo empurrado 3m. Em caso de colisão, adiciona o maior dado de dano 1×.' },
          ]},
        { id:'eletricidade', nome:'Eletricidade', icon:'⚡', cor:'#fbbf24',
          efeito:'Aura assume propriedade elétrica. Condições: Atordoado e Eletrocutado.',
          progressao:[
            { nivel:1, nome:'Eletricidade', desc:'Aura elétrica. Condições aplicáveis: Atordoado e Eletrocutado.' },
            { nivel:1, nome:'Desfibrilador', desc:'Choque em alvo inconsciente o faz recobrar consciência com 1 PV.' },
            { nivel:3, nome:'Neuro-Espasmo', desc:'+1,5m de deslocamento OU +1 em Resultados de Reações.' },
            { nivel:3, nome:'Curto Circuito', desc:'Alvo sofre −1 em DES OU −1,5m de deslocamento OU −1 em Reações.' },
            { nivel:6, nome:'Estática Constritora', desc:'Inimigos com armas de metal recebem Desorientado e Desprevenido por uma rodada após cada ataque.' },
            { nivel:6, nome:'Sobrecarga Sináptica', desc:'Após 3 acertos desta aura, alvo recebe Exaustão 1.' },
          ]},
        { id:'fogo', nome:'Fogo', icon:'🔥', cor:'#f97316',
          efeito:'Aura com propriedade de fogo/combustão. Condições: Queimado/Queimando.',
          progressao:[
            { nivel:1, nome:'Fogo', desc:'Aura assume propriedade de fogo/combustão — dano correspondente. Condições: Queimado/Queimando.' },
            { nivel:3, nome:'Desidratação Crítica', desc:'Calor seco consome o fôlego. Alvo −1 em CON enquanto estiver a 1,5m do usuário.' },
            { nivel:3, nome:'Cauterização de Tecido', desc:'Aura sela ferimentos — estanca Sangramento (causa 1d4 dano de fogo no processo).' },
            { nivel:3, nome:'Piromaníaco', desc:'Inimigos que terminam o turno no espaço do usuário (agarrados ou não) recebem +1 grau/passo de dano ao serem atingidos.' },
            { nivel:5, nome:'Incendiário', desc:'Equipamentos atingidos com golpes mirados pegam fogo — 1d10 por turno (tecidos/materiais não-aura).' },
            { nivel:8, nome:'Chamas Azuis', desc:'Queima sem dor física — causa dano psíquico ao ver o corpo pegar fogo.' },
            { nivel:10, nome:'Onda de Insolação', desc:'TR de CON ou alvo recebe Exaustão 2.' },
          ]},
        { id:'gelo', nome:'Frio/Gelo', icon:'❄️', cor:'#7dd3fc',
          efeito:'Aura gélida causa dano de frio. Condição: Lento.',
          progressao:[
            { nivel:1, nome:'Frio/Gelo', desc:'Aura gélida — dano de frio nos alvos. Condição: Lento.' },
            { nivel:3, nome:'Rigidez Articular', desc:'Frio extremo — alvo −1 em DES e Reações.' },
            { nivel:3, nome:'Jogos de Inverno', desc:'Camada de gelo no chão — terreno difícil, provoca queda ao se mover.' },
            { nivel:6, nome:'Manto de Cisne', desc:'a) +2 CA, −2 DES (armadura de gelo) OU b) +5 RD contra qualquer propriedade (placas leves).' },
            { nivel:10, nome:'Fadiga Crionergética', desc:'Após qualquer dano de frio, alvo perde 1 reação por rodada.' },
          ]},
        { id:'terra', nome:'Terra/Areia', icon:'🪨', cor:'#a78bfa',
          efeito:'+1 grau/passo de dano e RD contra golpes físicos.',
          progressao:[
            { nivel:1, nome:'Densidade Granular', desc:'Peso e maleabilidade da terra/areia. +1 grau/passo de dano e RD contra golpes físicos.' },
            { nivel:3, nome:'Abrasão de Areia', desc:'Granulada e áspera — micro-cortes causam Sangramento.' },
            { nivel:3, nome:'Areia Movediça', desc:'Prende um alvo em densa camada de terra/areia ou soterra-o em níveis mais altos. Progressão: Agarrado → Imóvel (+ dano de Esmagamento, +5) → Paralisado.' },
            { nivel:6, nome:'Jogo Sujo', desc:'Poeirenta e sufocante — golpes podem deixar alvos Cegos se olhos desprotegidos.' },
            { nivel:10, nome:'Centro de Gravidade', desc:'Usuário imune a empurrões, Caído e penalidades de terreno difícil.' },
          ]},
        { id:'veneno', nome:'Veneno', icon:'☠️', cor:'#86efac',
          efeito:'Propriedades químicas ou naturais de veneno. Condição: Envenenado.',
          progressao:[
            { nivel:1, nome:'Veneno', desc:'Propriedades de veneno — dano correspondente e Envenenamento.' },
            { nivel:3, nome:'Toxina Botulínica', desc:'Relaxamento muscular — −1 em Força (escalável em novas escolhas) OU progressivamente Imóvel → Paralisado.' },
            { nivel:5, nome:'Neurotoxina Motora', desc:'Ataca sistema nervoso — −2 em DES imediato. Condição: Lento.' },
            { nivel:5, nome:'Degradação Orgânica', desc:'Consome vitalidade — −2 em CON enquanto ativo.' },
            { nivel:6, nome:'Doença Terminal', desc:'Colapso físico acelerado — aplica diretamente Exaustão 3.' },
            { nivel:8, nome:'Toxina Relaxante/Depressora', desc:'Progressivamente: Lento → Fragilizado → Inconsciente.' },
            { nivel:8, nome:'Toxina Estimulante', desc:'+1 (bruto, sem limite máximo) em INT ou SAB OU +1 Reação (total).' },
            { nivel:10, nome:'Delírio Tóxico', desc:'Alucinações — −3 em Sanidade e pode ficar Confuso.' },
          ]},
    ],
    versatil: [
        { id:'borracha', nome:'Borracha/Elasticidade', icon:'🪵', cor:'#fb923c',
          efeito:'Aura com propriedades de borracha/goma — resistente a elétrico.',
          progressao:[
            { nivel:1, nome:'Fita Isolante', desc:'Resistência a dano elétrico a quem toca a aura.' },
            { nivel:4, nome:'Amortecimento Cinético', desc:'a) RD 10 contra danos físicos. OU b) Devolve ataque físico direto ao agressor (+bônus do usuário).' },
            { nivel:7, nome:'Contração Súbita', desc:'Puxão violento — TR de FOR; falha: 1d6 por 3m deslocado em impacto e pode ficar Caído.' },
            { nivel:10, nome:'Gomu Gomu', desc:'Imune a dano elétrico. Limiar Mínimo de Dano Físico = 20 (danos 1-19 não contam).' },
          ]},
        { id:'decibeis', nome:'Decibéis/Volume', icon:'🔊', cor:'#fbbf24',
          efeito:'Absorve ou amplifica ondas sonoras. Usuário/alvo completamente silencioso.',
          progressao:[
            { nivel:1, nome:'Abafamento Acústico', desc:'Usuário/alvo silencioso — −2 em percepção auditiva. Condição: Furtivo (sonoramente).' },
            { nivel:3, nome:'Mesa de Som', desc:'Aumenta ou reduz volume de alvos afetados pelo Hatsu.' },
            { nivel:4, nome:'Pulso de Ressonância', desc:'Ruído de alta frequência — Desorientado imediato + pode quebrar objetos frágeis (PV ≤ 10).' },
            { nivel:7, nome:'Vibração Perfurante', desc:'Pressão física — dano ignora RD físico e −2 em CON por danos internos.' },
            { nivel:10, nome:'Grito de Ruína', desc:'Volume ensurdecedor — alvo fica Surdo e −10 na Sanidade.' },
          ]},
        { id:'dinamo', nome:'Dinamo/Conversor', icon:'⚙️', cor:'#a78bfa',
          efeito:'Converte características de combate entre si.',
          progressao:[
            { nivel:1, nome:'Vida a Todo Custo', desc:'Converte para 10 PV: 30% Aura OU 7 CA OU 5 Reações OU 4 Atributos.' },
            { nivel:4, nome:'Domínio de Conversão (PV)', desc:'20 PV → 5% Aura; 15 PV → 1 CA; 10 PV → 1 Atributo ou Reação.' },
            { nivel:4, nome:'Domínio de Conversão (CA)', desc:'4 CA → 5% Aura; 4 CA → 1 Reação.' },
            { nivel:4, nome:'Domínio de Conversão (Atributo)', desc:'4 Atributos → 10% Aura; 2 Atributos → 2 Reações.' },
            { nivel:7, nome:'Masoquista', desc:'Converte dano recebido: 20 dano → 1 Atrib./CA/Reação OU 3 RD do tipo OU 5% Aura.' },
            { nivel:10, nome:'Energia Renovável', desc:'Reduz custo na metade OU dobra o efeito das conversões.' },
          ]},
        { id:'scanner', nome:'Scanner', icon:'🔭', cor:'#38bdf8',
          efeito:'Identifica CA, RDs e detalhes de alvos após contato.',
          progressao:[
            { nivel:1, nome:'Leitura Avançada', desc:'Identifica CA e RDs após atingir OU descobre nome, altura, peso e detalhes simples. Condição: Exposto.' },
            { nivel:1, nome:'Varredura Visual', desc:'Identifica reações de alvos ou mechanisms — +5 para destrancar/hackear/usar mecanismos.' },
            { nivel:4, nome:'Eco-Localização e Bio-Leitura', desc:'Anula bônus e condições de furtividade no alcance/área. Condição: Exposto.' },
            { nivel:7, nome:'Raio-X de Precisão', desc:'Avalia quantidade de aura OU Limiar Mínimo de Dano de objeto/alvo.' },
            { nivel:10, nome:'Aura Exposta', desc:'Vê alcance/área máximos de Hatsu OU duração suportável OU imunidade a ilusões e uso de IN.' },
          ]},
        { id:'antiad', nome:'Antiaderência', icon:'🧼', cor:'#e2e8f0',
          efeito:'Ausência total de atrito. +2 em Esquiva e −2 em tentativas de Agarrar.',
          progressao:[
            { nivel:1, nome:'Fricção Zero', desc:'Ausência de atrito — +2 em Esquiva, tentativas de Agarrar/Imobilizar têm −2.' },
            { nivel:1, nome:'Menó Deslizante', desc:'Pés do alvo deslizam — +3m de deslocamento (usuário) OU terreno difícil e escorregadio (alvo), TR DES ou Caído.' },
            { nivel:4, nome:'Malemolência', desc:'Força "desliza" ao ser atingido por danos físicos — RD = 5 + Nível do Usuário.' },
            { nivel:10, nome:'Inércia Absoluta', desc:'Alvo não consegue firmar os pés — TR FOR ou Imóvel. 2 rodadas: Exaustão 2 pelo desgaste.' },
          ]},
        { id:'reflexao', nome:'Reflexão/Refração', icon:'🪞', cor:'#c084fc',
          efeito:'Reflete luz perfeitamente. +2 em Esquiva e condição Ofuscado ao atacante.',
          progressao:[
            { nivel:1, nome:'Refração Ilusória', desc:'Distorce posição real/imagem como miragem — +2 em Esquiva e Ofuscado ao atacante.' },
            { nivel:4, nome:'Reversão Cinética', desc:'Reflete 25% do dano físico recebido de volta ao agressor — −2 em FOR no contragolpe.' },
            { nivel:4, nome:'Vultos de Aura', desc:'Cópias residuais ao mover — alvo faz percepção ou usuário fica Furtivo/Oculto.' },
            { nivel:7, nome:'Espelho Prismático', desc:'Direciona luz ao alvo — TR CON ou Cego.' },
            { nivel:7, nome:'Pesadelo Lúcido', desc:'Imagem invertida do alvo causa confusão. Condição: Confuso.' },
            { nivel:10, nome:'Reflexo Perturbador', desc:'Miragem indistinguível da reality — TR SAB ou −10 de Sanidade.' },
          ]},
        { id:'ferrugem', nome:'Ferrugem', icon:'🔨', cor:'#b45309',
          efeito:'Partículas metálicas corroídas atacam sentidos do alvo.',
          progressao:[
            { nivel:4, nome:'Poeira de Ferro', desc:'Partículas de metal corroído — alvo pode ficar Asfixiado ou Cego.' },
            { nivel:7, nome:'Degradação de Ferro Sanguíneo', desc:'Ferrugem no sangue — −2 em CON e Vulnerável a danos Cortantes e Perfurantes.' },
            { nivel:10, nome:'Corrosão Estrutural', desc:'Decompõe metais molecularmente — armas/equipamentos ficam Vulneráveis passivamente.' },
          ]},
        { id:'intang', nome:'Intangibilidade', icon:'👻', cor:'#818cf8',
          efeito:'Natureza etérea — pode tornar parte do corpo ou objeto pequeno intangível.',
          progressao:[
            { nivel:1, nome:'Fluidez Molecular', desc:'Torna objeto pequeno ou parte do corpo intangível. Imune a danos físicos nessa parte.' },
            { nivel:4, nome:'Dois Corpos Não Ocupam...', desc:'Desfaz intangibilidade durante ataque — dano interno ignorando RD física ao expelir a parte.' },
            { nivel:7, nome:'Ghost', desc:'Todo o corpo intangível — atravessa superfícies. Imune a danos físicos e incapaz de causar dano físico.' },
            { nivel:10, nome:'Exílio Dimensional', desc:'Projeta intangibilidade no alvo — incapaz de tocar ou respirar. −15 Sanidade/rodada. Interrompível com ação livre.' },
          ]},
        { id:'magnetismo', nome:'Magnetismo', icon:'🧲', cor:'#f472b6',
          efeito:'Campo magnético trava armaduras metálicas. −2 em DES e FOR.',
          progressao:[
            { nivel:4, nome:'Cárcere de Ferro', desc:'Trava armaduras/equipamentos metálicos — −2 em DES e FOR.' },
            { nivel:7, nome:'Mutante Ômega', desc:'Objetos magnetizados (tamanho médio) manipulados por telecinese.' },
            { nivel:10, nome:'Colapso Magnético', desc:'Campo intenso interfere em impulsos elétricos cerebrais — Exaustão 1 e −5 Sanidade.' },
          ]},
        { id:'peso', nome:'Peso/Gravidade', icon:'⚖️', cor:'#94a3b8',
          efeito:'Densidade súbita no ponto de contato. ±1,5m de deslocamento.',
          progressao:[
            { nivel:1, nome:'G~10m/s²', desc:'Penalidade ou bônus de 1,5m no deslocamento OU objetos ganham/perdem 1 de peso. Condição: Lento.' },
            { nivel:4, nome:'Pressão Esmagadora', desc:'Campo de gravidade aumentada — −2 em FOR e TR para não cair. Condição: Caído.' },
            { nivel:7, nome:'Excalibur', desc:'Aumenta peso de objeto para uso com 2 mãos + TR de Força para manuseá-lo.' },
            { nivel:10, nome:'Gravidade G-Force', desc:'Pressão interna dificulta circulação/respiração — Exaustão 2 e −5 em CON.' },
          ]},
        { id:'luz', nome:'Luz/Transparência/Escuridão', icon:'💡', cor:'#fde68a',
          efeito:'Descarga súbita de luz. TR CON ou Desorientado e Desprevenido.',
          progressao:[
            { nivel:4, nome:'Flash Estroboscópico', desc:'Descarga de luz intensa — TR CON ou Desorientado e Desprevenido.' },
            { nivel:7, nome:'Vazio Obscuro', desc:'Escuridão absoluta em área — imune a golpes mirados. Concede Furtividade/Oculto, Invisível ou Ofuscado.' },
          ]},
        { id:'vibracao', nome:'Vibração', icon:'📳', cor:'#34d399',
          efeito:'Vibração desestabiliza equilíbrio. −1 em DES e Lento.',
          progressao:[
            { nivel:1, nome:'Oscilação de Contato (Gura-Gura)', desc:'Frequência que desestabiliza equilíbrio — −1 DES e Lento. Em área: terreno difícil.' },
            { nivel:4, nome:'Ruptura de Proteção', desc:'Frequência de ressonância — ataques ignoram RD de armaduras e de aura.' },
            { nivel:7, nome:'Choque de Órgãos', desc:'Vibração penetra corpo — −2 em CON e condição Enjoado por sangramento interno.' },
          ]},
        { id:'cura', nome:'Cura/Recuperação', icon:'💚', cor:'#4ade80',
          efeito:'Adesão biológica — fecha ferimentos e interrompe sangramentos.',
          progressao:[
            { nivel:1, nome:'Sutura Bio-Elástica', desc:'Fecha ferimentos imediatamente — interrompe Sangramentos e +2 em CON para estabilização.' },
            { nivel:4, nome:'Filtro Antitoxina', desc:'Neutraliza nocividade química/natural/aura — remove Envenenado ou Sangramento.' },
            { nivel:7, nome:'Harmonia Vital', desc:'Frequência de restauração — remove Exaustão 3 e recupera +5 de Sanidade.' },
            { nivel:10, nome:'Medicina de Varvard', desc:'Recupera desmembramentos feitos em até 1 semana.' },
          ]},
    ]
};

window.calcularPHBase = function(level) {
    const lvl = parseInt(level) || 1;
    if (lvl >= 12) return 25;  // 6+2+2+2+2+3+3+3+1 (aprox)
    if (lvl >= 11) return 22;
    if (lvl >= 10) return 19;
    if (lvl >= 9)  return 16;
    if (lvl >= 8)  return 13;
    if (lvl >= 7)  return 10;
    if (lvl >= 6)  return 7;
    if (lvl >= 5)  return 14; // nível 5 = 6+2+2+2+2 = 14
    if (lvl >= 4)  return 12;
    if (lvl >= 3)  return 10;
    if (lvl >= 2)  return 8;
    return 6; // nível 1
};

// ==========================================
//  HATSU_DB — todos os dados direto do manual
// ==========================================