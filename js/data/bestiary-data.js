// ── BESTIÁRIO ────────────────────────────────────────────────────────────────
// Sincronizado com a Enciclopédia Hunter de Raças e Bestas Mágicas (versão de out/2026).
//
// CAMPO `id`: slug estável, criado nesta sincronização. É ELE que identifica a criatura,
// não o nome — o livro renomeou 8 criaturas (Hammerbeak → Bico de Martelo, Emperador
// Armorshell → Imperador Couraça, Hyper Puffball → Pompom Supersônico, e outras). Sem id
// estável, toda renomeação futura quebraria o que aponta para a criatura. É esse id que o
// picker da Cópia Perfeita (rm_e7) usa.
//
// `car` passou a `pre`: o atributo se chama Presença na ficha, e é assim que o livro o
// escreve (convenção de siglas: FOR/DES/CON/INT/SAB/PRE = modificador).
//
// FÓRMULA DE PV DO LIVRO: o total impresso é `N × X ÷ 2` — METADE DO MÁXIMO do dado, não
// a média. Ex.: 13d8 → 13×8÷2 = 52. Confere nas 53 fichas. Não "corrija" para a média de
// D&D ((X+1)/2): os valores ficariam todos 1 a 12 pontos acima do livro. O validador
// window.validarPVBestiario() confere isso e aponta erro de digitação.
//
// CAMPOS NOVOS (só nas fichas que o livro já converteu): tags, naLicenca, naEquipe,
// recomendado, limiar. Ausentes = o livro ainda não definiu. As tags marcadas
// "(proposto)" são provisórias e seguem como texto, sem virar controle na interface.
        window.BESTIARY_DATA = [
          // ── PANTANO NUMELE / KUKAN'YU ──────────────────────────
          {
            id:'tartaruga_cabeca_de_morango', nome:'Tartaruga Cabeça de Morango', tipo:'Besta Natural, Enorme, Neutro/Maligno, Solitário', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'170 (17d20)', desl:'9m', reacoes:null,
            for:'26 (+8)',des:'6 (-2)',con:'20 (+5)',int:'7 (-2)',sab:'14 (+2)',pre:'10 (+0)',
            pericias:'Atletismo +11, Furtividade +1', trs:'FOR +11, CON +8, SAB +5',
            imunidades:'Agarrado, Caído, Imóvel', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 12', lingua:'Bestial',
            tracos:[
              {n:'Favor da Neblina',d:'Qualquer criatura a até 1,5m que não realize um teste de Percepção ou Investigação será surpreendida por um ataque furtivo, enganada pela aparência do casco da Tartaruga Cabeça de Morango, caso ainda não tenha havido engajamento com a criatura.'},
              {n:'Criatura de Cerco',d:'O dano da Tartaruga Cabeça de Morango contra construções, estruturas e constructos é sempre considerado crítico.'}
            ],
            acoes:[
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +11 para acertar, alcance 6m, 2 alvos. Dano médio 14 (1d12+8) de dano de impacto, com seus dentes gigantes. Cada criatura atingida fica Agarrada (TR de FOR 19 para escapar). Enquanto mantiver alvos agarrados, a Tartaruga Cabeça de Morango não pode morder novos alvos. :'},
              {n:'Engolir',d:'A Tartaruga Cabeça de Morango realiza uma Mordida contra até 2 alvos Grandes ou menores que esteja agarrando. Cada alvo atingido sofre o dano da Mordida e é engolido. Enquanto engolido, o alvo permanece Agarrado e tem cobertura total contra ataques e efeitos de fora da Tartaruga. Pode agir e atacar, com desvantagem, e sofre 13 (2d12) de dano de impacto no início de cada turno da Tartaruga. : Se a Tartaruga Cabeça de Morango sofrer 35 ou mais de dano em um único turno, deve ser bem-sucedida em um TR de CON 20 ao final desse turno ou regurgita todas as criaturas engolidas, que caem Caídas em um espaço a até 3m dela. Se a Tartaruga morrer, as criaturas engolidas deixam de estar agarradas e podem escapar do corpo usando 18m de movimento, saindo Caídas.'}
            ]
          },
          {
            id:'sapopaciente', nome:'Sapopaciente', tipo:'Besta Natural, Enorme, Neutro, Solitário', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'70 (7d20)', desl:'3m', reacoes:null,
            for:'10 (+0)',des:'15 (+2)',con:'16 (+3)',int:'10 (+0)',sab:'14 (+2)',pre:'10 (+0)',
            pericias:'Acrobacia +5, Furtividade +5, Percepção +5', trs:'CON +6',
            imunidades:'Agarrado, Caído', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 15', lingua:'Bestial',
            tracos:[
              {n:'Camuflagem Subterrânea',d:'O Sapopaciente prepara uma armadilha cavando um buraco com suas patas em duas rodadas. Ao entrar no buraco, consegue abrir sua mandíbula em 180 graus, alinhando a bocarra com o terreno, e dá o bote quando alvos entram na área da armadilha. Ele pode abocanhar os detritos do terreno cavado e regurgitá-los para fora, deixando a armadilha parecida com um terreno acidentado, praticamente indistinguível de um terreno acidentado comum.'}
            ],
            acoes:[
              {n:'Bote Paciente',d:'O Sapopaciente dá o bote contra até 2 alvos Grandes ou menores que estejam em seu terreno de armadilha ou a até 1,5m de seu alcance, impondo um TR de DES 22 (pelo alcance da bocarra). Cada alvo que falhar é engolido. Enquanto engolido, o alvo fica Agarrado e tem cobertura total contra ataques e efeitos de fora do Sapopaciente. Pode agir e atacar, com desvantagem, e sofre 27 (5d10) de dano corrosivo no início de cada turno do Sapopaciente. Se o Sapopaciente sofrer 20 ou mais de dano em um único turno, deve ser bem-sucedido em um TR de CON 15 ao final desse turno ou regurgita todas as criaturas engolidas, que caem Caídas em um espaço a até 3m dele. Se o Sapopaciente morrer, as criaturas engolidas deixam de estar agarradas e podem escapar do corpo usando 6m de movimento, saindo Caídas.'}
            ]
          },
          {
            id:'macaco_com_cara_de_homem', nome:'Macaco com Cara de Homem', tipo:'Besta Mágica, Médio, Caótico, Solitário', cat:'BESTA MÁGICA',
            ca:'14 (Defesa Natural)', pv:'25 (5d10)', desl:'9m; Escalada 9m', reacoes:'4',
            for:'16 (+3)',des:'20 (+5)',con:'10 (+0)',int:'12 (+1)',sab:'14 (+2)',pre:'16 (+3)',
            pericias:'Atletismo +6, Acrobacia +8, Furtividade +8', trs:'FOR +6, PRE +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 12', lingua:'Comum',
            tags:'⚠️ Enganador — Mímico Sonoro e Fingir de Morto✅ INT 12 — não é imune a Manipulação🛡️ Reações 4 — pool do CAP. 4🟡 VUL. TR CON (10)', naLicenca:'2', naEquipe:'1', recomendado:'1 Hunter de nível 1-2, com Hatsu',
            tracos:[
              {n:'Fingir de Morto',d:'Esta criatura consegue enganar qualquer inimigo que lhe tenha causado 15 ou mais de dano, de qualquer natureza, caindo no chão de forma convincente, caso o alvo esteja a mais de 1,5m de distância. Caso esteja mais próximo, é realizado um teste de Enganação contestado por um teste de Intuição do inimigo.'},
              {n:'Mímico Sonoro',d:'A criatura reproduz a fala humana, usando-a para atrair suas vítimas.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'A criatura realiza 2 ataques por turno: 1 de Mordida e 1 de Golpe Desarmado, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +6 para acertar, alcance 1,5m, 1 alvo. Dano médio 6 (1d6+3) de dano perfurante.'},
              {n:'Golpe Desarmado',d:'Ataque Corpo-a-Corpo: +6 para acertar, alcance 1,5m, 1 alvo. Dano médio 5 (1d4+3) de dano de impacto.'}
            ]
          },
          {
            id:'corvo_ventriloquo', nome:'Corvo Ventríloquo', tipo:'Besta Natural, Pequeno, Caótico, Bando (3-5)', cat:'BESTA MÁGICA',
            ca:'12 (Defesa Natural)', pv:'16 (4d8)', desl:'Voo 9m', reacoes:'2',
            for:'2 (-4)',des:'19 (+4)',con:'10 (+0)',int:'10 (+0)',sab:'7 (-2)',pre:'14 (+2)',
            pericias:'Acrobacia +7, Furtividade +7, Enganação +5', trs:'DES +7, PRE +5',
            imunidades:'Caído', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m', lingua:'Comum',
            tags:'⚠️ Bando de 3-5 — ficha individual; pool de encontro (3): PV total esperado 48 (3 × 16) · dano total esperado 18/rodada (3 × 6). Bando completo de 5: 80 PV · 30/rodada.🎯 Ventriloquismo — atrai vítimas simulando vozes🛡️ Reações 2 — Esquiva +2 pelo traço Evasão🔴 VUL. TR FOR (2) · 🔴 VUL. TR SAB (7) · 🟡 VUL. TR CON (10) · 🟡 VUL. TR INT (10)', naLicenca:'1', naEquipe:'1', recomendado:'1 Hunter de nível 0-1, com Hatsu',
            tracos:[
              {n:'Mímico Sonoro',d:'Esta criatura consegue imitar a voz de qualquer criatura que tenha ouvido, mesmo que não compreenda seu idioma. Caso compreenda, pode simular frases inteiras com eloquência.'},
              {n:'Evasão',d:'Manobra de fuga aérea que adiciona +2 na Reação de esquiva.'},
              {n:'Rasante',d:'Manobra de ataque aéreo que entra e sai da área do alvo sem receber Ataque de Oportunidade.'}
            ],
            acoes:[
              {n:'Bicada',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 6 (1d4+4) de dano perfurante.'}
            ]
          },
          {
            id:'borboleta_hipnotica', nome:'Borboleta Hipnótica', tipo:'Besta Mágica, Miúdo, Neutro, Bando (3-5)', cat:'BESTA MÁGICA',
            ca:'12 (Defesa Natural)', pv:'4 (2d4)', desl:'Voo 9m', reacoes:null,
            for:'2 (-4)',des:'14 (+2)',con:'9 (-1)',int:'6 (-2)',sab:'15 (+2)',pre:'10 (+0)',
            pericias:'Furtividade +5, Enganação +3', trs:null,
            imunidades:'Amedrontado/Assustado, Caído, Manipulado', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m', lingua:'Bestial',
            tracos:[
              {n:'Pólen Fascinante',d:'Qualquer criatura que inicie ou termine seu turno a até 1,5m de uma Borboleta Hipnótica corre o risco de respirar o pólen expelido e cair em um transe profundo, devendo superar um TR de CON 16. Em caso de falha, recebe as condições Caído e Paralisado. Um alvo hipnotizado sai das condições ao receber 5 ou mais de dano. Criaturas Cegas são imunes às ações e efeitos da Borboleta Hipnótica.'}
            ],
            acoes:[
              {n:'Padrão de Voo',d:'Efeito em área: raio de 3m, TR de CON conforme o Pólen Fascinante. A área aumenta em 1,5m para cada 2 borboletas adjacentes no local.'}
            ]
          },
          {
            id:'fungo_selvagem_claymore', nome:'Fungo Selvagem Claymore', tipo:'Planta, Miúdo, Neutro', cat:'BESTA NATURAL',
            ca:'10 (Defesa Natural)', pv:'12 (4d6)', desl:'—', reacoes:null,
            for:'—',des:'—',con:'—',int:'—',sab:'—',pre:'—',
            pericias:null, trs:null, imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Risco Biológico',d:'Qualquer criatura que pise em um Fungo Selvagem Claymore fica sujeita à intoxicação pelas vias aéreas, pois o fungo dispersa no ar um pólen que atordoa e envenena os alvos.'}
            ],
            acoes:[
              {n:'Pólen Venenoso',d:'Efeito em área: todas as criaturas a até 1,5m realizam um TR de CON 16. Em caso de falha, ficam Envenenadas e sofrem 11 (2d8+2) de dano de veneno. Em caso de sucesso, realizam um segundo TR de CON 12: se falharem, sofrem o dano completo, sem a condição; se passarem, sofrem metade do dano.'}
            ]
          },
          // ── RESERVA FLORESTAL DE VISCA ──────────────────────────
          {
            id:'porco_carimbador', nome:'Porco Carimbador', tipo:'Besta Natural, Médio, Maligno, Bando (6+)', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural); 19 no Ponto Sensível', pv:'32 (8d8)', desl:'9m', reacoes:null,
            for:'20 (+5)',des:'10 (+0)',con:'16 (+3)',int:'12 (+1)',sab:'14 (+2)',pre:'16 (+3)',
            pericias:'Atletismo +8, Natureza +4, Percepção +5', trs:'FOR +8, CON +6',
            imunidades:null,
            resistencias:'Todo dano que não seja de aura, exceto no Ponto Sensível',
            vulnerabilidades:'Ponto atrás do focinho entre os olhos e a testa: Crítico (19) e Mortal x4.',
            sentidos:'Sentidos Aguçados (Olfato), Percepção Passiva 15', lingua:'Bestial',
            tags:'⚠️ Bando de 6+ — ficha individual; pool de encontro: PV total esperado 192 (6 × 32) · dano total esperado ~48/rodada (6 × 8). O N.A. de encontro do bando é calculado sobre o pool, nunca multiplicando o N.A. individual.🎯 Ponto Sensível (CA 19) — Crítico 19, Mortal x4🛡️ Resistência a todo dano que não seja de aura — NULA contra usuários de aura (carve-out do traço, confirmado em teste)🟡 VUL. TR DES (10)', naLicenca:'3 (individual)', naEquipe:'2 *(proposto — sem fórmula de derivação, gap §8.5)*', recomendado:'bando contra grupo de nível 2-3, com Hatsus e aura *(proposto)*',
            tracos:[
              {n:'Ponto Sensível',d:'Localizado atrás do focinho, entre os olhos e a testa. Um golpe nesse local (CA 19) recebe as propriedades Crítico (19) e Mortal x4.'}
            ],
            acoes:[
              {n:'Focinho Carimbador',d:'Ataque Corpo-a-Corpo: +8 para acertar, alcance 1,5m, 1 alvo. Dano médio 8 (1d6+5) de dano de impacto.'},
              {n:'Investida',d:'Se o Porco Carimbador se mover pelo menos 3m em linha reta em direção a um alvo logo antes de atingi-lo com seu Focinho Carimbador, o alvo deve realizar um TR de FOR 16 ou fica Caído.'}
            ]
          },
          {
            id:'urso_negro_de_grandes_chifres', nome:'Urso Negro de Grandes Chifres', tipo:'Besta Natural, Médio ou Grande, Maligno, Solitário', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'40 (4d20)', desl:'9m', reacoes:'6',
            for:'22 (+6)',des:'12 (+1)',con:'18 (+4)',int:'9 (-1)',sab:'12 (+1)',pre:'9 (-1)',
            pericias:'Atletismo +9, Sobrevivência +4', trs:'FOR +9, CON +7',
            imunidades:null,
            resistencias:'Dano cortante, perfurante e de impacto (Escudo Natural/Couro).',
            vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m', lingua:'Bestial',
            tags:'🛡️ Regeneração — recupera 14 PV por rodada🛡️ RD cortante/perfurante/impacto (couro)🛡️ Reações 6 — pool do CAP. 4🔴 VUL. TR INT (9) · 🔴 VUL. TR PRE (9)🛡️ IMUNE: Manipulação (INT 9)', naLicenca:'3', naEquipe:'2 *(proposto — sem fórmula de derivação, gap §8.5)*', recomendado:'1 Hunter de nível 2-3, com Hatsus e aura *(proposto)*',
            tracos:[
              {n:'Escudo Natural (Couro)',d:'Resistência a dano cortante, perfurante e de impacto.'},
              {n:'Regeneração',d:'Recupera 14 PV (10 + CON) por rodada.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'O Urso Negro de Grandes Chifres realiza 2 ataques por turno: 1 de Chifres e 1 de Garras, ou 2 de Garras.'},
              {n:'Chifres',d:'Ataque Corpo-a-Corpo: +9 para acertar, alcance 1,5m, 1 alvo. Dano médio 10 (1d8+6) de dano perfurante.'},
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +9 para acertar, alcance 1,5m, 1 alvo. Dano médio 9 (1d6+6) de dano cortante.'}
            ]
          },
          {
            id:'aguia_aranha', nome:'Águia-Aranha', tipo:'Besta Mágica, Grande, Neutro, Próximo de Covil', cat:'BESTA MÁGICA',
            ca:'17 (Defesa Natural)', pv:'35 (7d10)', desl:'9m; Voo 9m', reacoes:null,
            for:'14 (+2)',des:'19 (+4)',con:'11 (+0)',int:'15 (+2)',sab:'18 (+4)',pre:'8 (-1)',
            pericias:'Acrobacia +7, Furtividade +7, Intuição +7, Sobrevivência +7', trs:'DES +7, SAB +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 14', lingua:'Bestial',
            tracos:[
              {n:'Escalada Aracnídea',d:'A Águia-Aranha escala superfícies difíceis, incluindo tetos de cabeça para baixo, sem necessidade de teste.'}
            ],
            acoes:[
              {n:'Teia (Recarga 5-6)',d:'Ataque à Distância: +7 para acertar, alcance 9m/18m, 1 alvo. O alvo fica Enredado/Preso pela teia. Com uma Ação Bônus, o alvo pode realizar um teste de Força (CD 15), rompendo a teia com sucesso. A teia também pode ser atacada e destruída: CA 10; 5 PV; vulnerabilidade a fogo; imunidade a dano de impacto, veneno e psíquico.'},
              {n:'Garras de Rapina',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 11 (2d6+4) de dano cortante.'}
            ]
          },
          // ── ZABAN ──────────────────────────────────────────────
          {
            id:'kiriko', nome:'Kiriko', tipo:'Besta Mágica, Grande, Caótico/Neutro, Bando (1-3)', cat:'BESTA MÁGICA',
            ca:'15 (Defesa Natural)', pv:'25 (5d10)', desl:'15m; Voo 15m', reacoes:'3',
            for:'18 (+4)',des:'18 (+4)',con:'1 (-5)',int:'15 (+2)',sab:'16 (+3)',pre:'12 (+1)',
            pericias:'Atletismo +7, Acrobacia +7, Furtividade +7, Enganação +4, Sobrevivência +6', trs:'SAB +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 13', lingua:'Comum',
            tracos:[
              {n:'Metamorfo',d:'Essa criatura assume a forma de qualquer humanoide que tenha tocado, imitando aparência, voz e vestimentas, e captando pensamentos superficiais do original.'},
              {n:'Movimento Transflorestal',d:'Ao escalar árvores em meio à floresta, um Kiriko se desloca entre elas com saltos, como se estivesse em terra firme.'},
              {n:'Movimento Alado',d:'Kirikos podem se transformar parcialmente para criar asas, ganhando seu deslocamento de voo.'}
            ],
            acoes:[
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 7 (1d6+4) de dano cortante.'},
              {n:'Golpe Desprevenido',d:'Caso o Kiriko ataque enquanto está Furtivo/Oculto: Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 8 (1d8+4) de dano cortante. Com 18 ou mais no dado, o alvo deve realizar um TR de CON 15 ou recebe a condição Sangramento Leve, sofrendo 2d4 de dano no início de cada um de seus turnos até superar. O sangramento ainda pode ser agravado de acordo com a mecânica da condição.'}
            ]
          },
          // ── ILHA ZEVIL ─────────────────────────────────────────
          {
            id:'borboleta_hemotropica', nome:'Borboleta Hemotrópica', tipo:'Besta Natural, Miúdo, Neutro, Enxame', cat:'BESTA NATURAL',
            ca:'10 (Defesa Natural)', pv:'2 (1d4)', desl:'Voo 6m', reacoes:null,
            for:'2 (-4)',des:'10 (+0)',con:'12 (+1)',int:'6 (-2)',sab:'10 (+0)',pre:'9 (-1)',
            pericias:'Sobrevivência +3, Percepção +3', trs:'CON +4',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Olfato), Percepção Passiva 13', lingua:'Bestial',
            tracos:[
              {n:'Hemo-Nectose',d:'A criatura é atraída pelo cheiro de sangue de qualquer tipo, funcionando como um bioindicador: persegue uma criatura ferida até que a ferida seja coberta ou até que a criatura seja curada ou morta.'}
            ],
            acoes:[
              {n:'Sede de Sangue',d:'Enquanto houver uma ferida exposta, as borboletas cercam a criatura ferida e, no início do turno delas, causam 3 (1d4+1) de dano necrótico, reduzindo os PV máximos do alvo na mesma quantidade até que ele realize um descanso curto.'}
            ]
          },
          {
            id:'besta_voadora_hexapode', nome:'Besta Voadora Hexápode', tipo:'Besta Mágica, Enorme, Maligno, Solitário', cat:'BESTA MÁGICA',
            ca:'16 (Defesa Natural)', pv:'42 (7d12)', desl:'9m; Voo 12m', reacoes:'2',
            for:'24 (+7)',des:'11 (+0)',con:'16 (+3)',int:'6 (-2)',sab:'7 (-2)',pre:'16 (+3)',
            pericias:'Intimidação +6', trs:'FOR +10, CON +6',
            imunidades:'Amedrontado/Assustado, Surdo', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Bestial',
            tags:'⚠️ Perigo elevado para não-usuários de aura⚠️ Dano de equipe: 24/rodada (Mordida em 2 alvos agarrados)🎯 Grito/Risada — TR de SAB 14, área 9m, Amedrontado🎯 Engolir — se o dano superar 50% do PV total do alvo, remove-o do combate🔴 VUL. TR INT (6) · 🔴 VUL. TR SAB (7) · 🟡 VUL. TR DES (11)🛡️ IMUNE: Manipulação (INT 6)', naLicenca:'3', naEquipe:'2 *(proposto — sem fórmula de derivação, gap §8.5)*', recomendado:'1 Hunter de nível 2-3, com Hatsus e aura *(proposto)*',
            tracos:[
              {n:'Grito/Risada Aterrorizante',d:'Antes de atacar um alvo, ou após engolir um, a Besta Voadora solta uma risada ou um grito. Criaturas a até 9m que possam ouvi-la realizam um TR de SAB 14 ou ficam Amedrontadas/Assustadas até o fim do próximo turno da Besta.'}
            ],
            acoes:[
              {n:'Agarrão',d:'Ataque Corpo-a-Corpo: +10 para acertar, alcance 1,5m, 2 alvos. Os alvos ficam Agarrados.'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo contra alvos Agarrados: +10 para acertar, 2 alvos. Dano médio 12 (1d10+7) de dano perfurante. Se o dano superar 50% da vida total de um alvo, ele é engolido: permanece Agarrado dentro da Besta, podendo agir e atacar com desvantagem.'}
            ]
          },
          {
            id:'parasita_verme_sarapintado', nome:'Parasita Verme Sarapintado', tipo:'Besta Natural, Miúdo, Maligno, Enxame', cat:'BESTA NATURAL',
            ca:'11 (Defesa Natural)', pv:'4 (2d4)', desl:'1m', reacoes:null,
            for:'4 (-3)',des:'11 (+0)',con:'6 (-2)',int:'1 (-5)',sab:'12 (+1)',pre:'4 (-3)',
            pericias:'Furtividade +3, Sobrevivência +2', trs:null,
            imunidades:'Amedrontado/Assustado, Caído, Cego, Surdo', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Instinto Parasita',d:'Em qualquer situação possível, o Parasita Verme Sarapintado entra em um orifício aberto para se reproduzir dentro de uma criatura viva.'}
            ],
            acoes:[
              {n:'Envenenamento e Reprodução Passiva',d:'Após entrar em um sistema, essas criaturas só podem ser expelidas de duas formas: 1. Com a eclosão bem-sucedida dos ovos no sistema do hospedeiro, 24h após a entrada. Nesse momento, role 1d100: com 70 ou menos, é uma morte instantânea. 2. Expelidas à força com a ingestão de 30 litros de álcool, aumentando a quantidade de amônia no sistema e tornando o sistema excretor urinário inabitável para a eclosão dos ovos.'}
            ]
          },
          // ── JAPÃO / ILHA DA BALEIA ──────────────────────────────
          {
            id:'urso_raposa', nome:'Urso-Raposa', tipo:'Besta Natural, Médio, Neutro, Solitário', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural)', pv:'24 (6d8)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'15 (+2)',con:'12 (+1)',int:'10 (+0)',sab:'14 (+2)',pre:'10 (+0)',
            pericias:'Atletismo +7, Sobrevivência +5, Intimidação +3', trs:'FOR +7, SAB +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 9m, Percepção Passiva 12', lingua:'Bestial',
            tracos:[],
            acoes:[
              {n:'Ataques Múltiplos',d:'O Urso-Raposa realiza 2 ataques por turno: 1 de Mordida e 1 de Garras, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 8 (1d8+4) de dano perfurante.'},
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 7 (1d6+4) de dano cortante.'}
            ]
          },
          {
            id:'rei_do_pantano', nome:'Rei do Pântano', tipo:'Besta Natural, Grande ou Enorme, Neutro, Solitário', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural)', pv:'40 (4d20)', desl:'Natação 9m', reacoes:null,
            for:'20 (+5)',des:'12 (+1)',con:'24 (+7)',int:'6 (-2)',sab:'12 (+1)',pre:'9 (-1)',
            pericias:'Atletismo +8, Sobrevivência +4', trs:'CON +10',
            imunidades:'Sangramento (Sistema Hemostático)', resistencias:'Cortante, Perfurante (Carapaça de Quitina)', vulnerabilidades:null,
            sentidos:'Percepção às Cegas', lingua:'Bestial',
            tracos:[
              {n:'Escudo Natural/Carapaça (Quitina)',d:'Resistência a dano cortante e perfurante.'},
              {n:'Corpo Adaptável — Sistema Hemostático',d:'Essa criatura possui pouco fluxo sanguíneo em seu corpo e é imune à condição Sangramento, pela ausência de pressão sanguínea.'}
            ],
            acoes:[
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +8 para acertar, alcance 1,5m, 2 alvos (1 alvo no tamanho Grande). Dano médio 9 (1d8+5) de dano perfurante.'}
            ]
          },
          {
            id:'cobra_gigante_de_tres_cabecas', nome:'Cobra Gigante de Três Cabeças', tipo:'Besta Natural, Grande ou Enorme, Maligno, Solitário', cat:'BESTA NATURAL',
            ca:'17 (Defesa Natural)', pv:'50 (10d10)', desl:'9m; Escalada 9m; Natação 9m', reacoes:'2',
            for:'23 (+6)',des:'23 (+6)',con:'18 (+4)',int:'6 (-2)',sab:'12 (+1)',pre:'7 (-2)',
            pericias:'Furtividade +9, Acrobacia +9, Sobrevivência +4, Enganação +1', trs:'DES +9, CON +7',
            imunidades:'Sangramento', resistencias:'Cortante, Perfurante (Carapaça)', vulnerabilidades:null,
            sentidos:'Percepção às Cegas, Sentidos Aguçados (Olfato)', lingua:'Bestial',
            tags:'🛡️ RD cortante/perfurante (quitina) — sob a Regra de Não-Divisão, neutraliza a dobra de aura (×2 × 0,5 = ×1)🛡️ Imune a Sangramento (Sistema Hemostático)🎯 Constritor — TR de FOR 17, Agarrado; Esmagamento automático no alvo agarrado🛡️ Reações 2 — pool do CAP. 4; Percepção às Cegas habilita Esquiva contra atacantes fora da linha de visão🔴 VUL. TR INT (6) · 🔴 VUL. TR PRE (7)🛡️ IMUNE: Manipulação (INT 6)', naLicenca:'2', naEquipe:'2 *(proposto — sem fórmula de derivação, gap §8.5)*', recomendado:'1 Hunter de nível 1-2, com Hatsus e aura *(proposto)*',
            tracos:[
              {n:'Escudo Natural/Carapaça (Quitina)',d:'Resistência a dano cortante e perfurante.'},
              {n:'Corpo Adaptável — Sistema Hemostático',d:'Essa criatura possui pouco fluxo sanguíneo em seu corpo e é imune à condição Sangramento, pela ausência de pressão sanguínea.'},
              {n:'Reações',d:'Pool de Reações do CAP. 4. A Percepção às Cegas habilita a Esquiva contra atacantes fora da linha de visão.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'A Cobra Gigante de Três Cabeças pode atacar até três vezes em seu turno: três Botes; dois Botes e um Golpe Constritor; ou um Golpe Constritor e um Esmagamento.'},
              {n:'Bote (Mordida)',d:'Ataque Corpo-a-Corpo: +9 para acertar, alcance 3m, 2 alvos (1 alvo no tamanho Grande). Dano médio 10 (1d8+6) de dano perfurante. O alvo deve realizar um TR de CON 15 ou sofre 3 (1d6) de dano de veneno.'},
              {n:'Golpe Constritor',d:'Ataque Corpo-a-Corpo: +9 para acertar, alcance 3m, 2 alvos. Dano médio 8 (1d4+6) de dano de impacto. O alvo deve realizar um TR de FOR 17 ou fica Agarrado.'},
              {n:'Esmagamento',d:'Ataque Corpo-a-Corpo: +9 para acertar, alcance 3m, 1 alvo. Dano médio 10 (1d8+6) de dano de impacto. Um alvo Agarrado pelo Golpe Constritor não precisa ser atacado: a ação é gasta e o dano é aplicado automaticamente, uma vez por turno.'}
            ]
          },
          // ── GREED ISLAND ───────────────────────────────────────
          {
            id:'cavalo_bolha', nome:'Cavalo Bolha', tipo:'Besta de Nen, Médio, Caótico/Neutro, Solitário', cat:'BESTA DE NEN',
            ca:'15 (Defesa Natural)', pv:'15 (3d10)', desl:'9m', reacoes:null,
            for:'12 (+1)',des:'17 (+3)',con:'10 (+0)',int:'8 (-1)',sab:'8 (-1)',pre:'8 (-1)',
            pericias:'Atletismo +4', trs:'DES +6',
            imunidades:'Todo dano que não seja de aura',
            resistencias:null,
            vulnerabilidades:'Quando Agarrado, o Cavalo Bolha se desfaz.',
            sentidos:'Sentidos Aguçados (Visão, Audição)', lingua:'Bestial',
            tracos:[
              {n:'Corpo de Bolha',d:'Quando fica Agarrado, o Cavalo Bolha se desfaz.'},
              {n:'Fuga de Presa',d:'O Cavalo Bolha pode fugir ou esquivar sem gastar Reação.'}
            ],
            acoes:[
              {n:'Sopro Explosivo',d:'Ataque à Distância em área: +6 para acertar, 4,5m, atingindo todos os alvos no alcance cuja CA seja inferior ao resultado. Dano médio 5 (1d4+3) de dano explosivo. As bolhas brancas só estouram ao entrar em contato com aura, enquanto as bolhas vermelhas só estouram ao tocar qualquer coisa que não seja aura. O Mestre pode determinar a proporção das bolhas, criando um quebra-cabeça para os jogadores.'}
            ]
          },
          {
            id:'ciclope_gigante', nome:'Ciclope Gigante', tipo:'Besta de Nen, Enorme ou Colossal, Maligno, Solitário ou Bando (5+)', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'90 (9d20)', desl:'9m', reacoes:null,
            for:'26 (+8)',des:'4 (-3)',con:'28 (+9)',int:'2 (-4)',sab:'8 (-1)',pre:'6 (-2)',
            pericias:'Atletismo +11, Intimidação (usando FOR) +11', trs:'FOR +11, CON +12',
            imunidades:'Manipulado/Enfeitiçado, Dano não causado por aura.',
            resistencias:'Balístico, cortante, explosivo, impacto e perfurante, quando não causados por aura',
            vulnerabilidades:'Ataques no único olho: Crítico x4.',
            sentidos:'Visão no Escuro 18m', lingua:'Comum',
            tracos:[
              {n:'Olho Único',d:'Qualquer ataque contra seu único olho recebe a propriedade Mortal x4.'},
              {n:'Sopro Violento',d:'Qualquer criatura a até 3m do ponto onde o Gigante ataca deve realizar um TR de FOR 19. Em caso de falha, fica Empurrada/Puxada pelo vento de sua clava ou Caída, se o ataque destruir o solo, conforme o local atingido.'}
            ],
            acoes:[
              {n:'Esmagamento',d:'Ataque Corpo-a-Corpo em área: +11 para acertar, alcance 3m, 2 alvos. Dano médio 21 (3d8+8) de dano de impacto.'}
            ]
          },
          {
            id:'rato_radio_ativo', nome:'Rato Rádio-Ativo', tipo:'Besta de Nen, Miúdo, Caótico, Solitário', cat:'BESTA DE NEN',
            ca:'10 (Defesa Natural)', pv:'4 (2d4)', desl:'9m', reacoes:null,
            for:'1 (-5)',des:'15 (+2)',con:'7 (-2)',int:'26 (+8)',sab:'15 (+2)',pre:'10 (+0)',
            pericias:'Arcanismo +11, Furtividade +5, Intuição +5', trs:'DES +5, INT +11',
            imunidades:null, resistencias:null,
            vulnerabilidades:'Impacto',
            sentidos:'Visão Verdadeira', lingua:'Bestial',
            tracos:[
              {n:'Titereiro',d:'O Rato Rádio-Ativo manipula um constructo em formato de armadilha, que realiza ataques enquanto estiver sob seu controle. Veja a ficha a seguir.'}
            ],
            acoes:[
              {n:'Sem ataque próprio',d:'O Rato Rádio-Ativo não ataca. Os golpes vêm do Constructo do Rato Rádio-Ativo, que tem ficha separada e age pelo traço Titereiro.'}
            ]
          },
          // O constructo tem ficha PRÓPRIA no livro, e não ataques dentro da ficha do rato:
          // ele é alvo legítimo, com CA e PV atacáveis, e para de agir se o rato cair.
          // Enquanto os golpes moravam na ficha do rato, a mesa não tinha o que atacar.
          //
          // É a primeira (e por ora única) ficha com seção "### Reações" no livro. Em vez de
          // criar um campo novo no schema para uma criatura, a reação entra em `acoes` com o
          // sufixo "(Reação)" no nome — fica legível na ficha e no texto do Discord sem mexer
          // na interface. Se outras criaturas ganharem reações, aí vale um campo próprio.
          {
            id:'constructo_do_rato_radio_ativo', nome:'Constructo do Rato Rádio-Ativo', tipo:'Constructo, Grande, Neutro, Lacaio', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'50 (5d20)', desl:'9m', reacoes:'2',
            for:'18 (+4)',des:'11 (+0)',con:'16 (+3)',int:'1 (-5)',sab:'6 (-2)',pre:'1 (-5)',
            pericias:null, trs:'FOR +7, CON +6',
            imunidades:'Veneno, Psíquico / Cego, Encantado, Surdo, Exausto, Amedrontado, Paralisado, Petrificado, Envenenado, Abalado',
            resistencias:'Corte, Perfuração, Impacto, Fogo, Frio, Elétrico, Ácido', vulnerabilidades:null,
            sentidos:'Percepção às Cegas 18m (cego além desse alcance)', lingua:'Nenhuma. Entende as ordens do seu criador, mas não fala',
            limiar:12,
            naLicenca:'3', naEquipe:'2', recomendado:'2 Hunters de nível 3-5, com aura — o N.A. considera o par Rato + Constructo, não o constructo isolado',
            tags:'⚠️ Lacaio — não existe sozinho; o N.A. vale para o par Rato + Constructo<br>⚠️ Atrasador — 18 de dano por rodada obriga a reagir, mas derrubá-lo não resolve o encontro<br>🎯 Conexão — derrotar o Rato (4 PV, CA 10) desliga o constructo; é o caminho pretendido<br>🛡️ Limiar 12 — golpe de arma comum e dano residual não arranham; é preciso concentrar dano<br>🛡️ Resistência a todo dano físico e elemental — aura e dano concentrado passam<br>✅ INT 1 — imune à condição Manipulado; não pode ser tomado do rato<br>🟡 VUL. TR SAB (-2) · 🟡 VUL. TR INT (-5) · 🟡 VUL. TR PRE (-5)',
            tracos:[
              {n:'Limiar Mínimo de Dano (12)',d:'Compare o dano bruto com o limiar: abaixo de 12 é superficial e não reduz pontos de vida. Só depois de passar o limiar aplique as Resistências.'},
              {n:'Conexão',d:'Este constructo é controlado pelo traço Titereiro do Rato Rádio-Ativo. Se o rato for derrotado, fugir ou desmaiar, o constructo para de agir imediatamente e desaba.'},
              {n:'Sem Mente',d:'O constructo não toma decisões próprias: age somente pelas ordens do Titereiro. Nunca age na rodada em que o rato está Atordoado, Inconsciente ou em Zetsu.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'O constructo ataca 2 vezes em seu turno.'},
              {n:'Golpe de Espada (ou adaptado ao constructo)',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 9 (1d10+4) de dano cortante.'},
              {n:'Esmagar',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 9 (1d10+4) de dano de impacto. Se acertar, o alvo faz TR de FOR 14 ou fica Caído.'},
              {n:'Barreira Animada (Reação)',d:'Quando uma criatura sai do alcance do constructo, ele gasta 1 Reação para um ataque de Esmagar contra ela.'}
            ]
          },
          {
            id:'lagarto_melanino', nome:'Lagarto Melanino', tipo:'Besta de Nen, Enorme ou Colossal, Maligno, Solitário', cat:'BESTA DE NEN',
            ca:'18 (Defesa Natural)', pv:'150 (15d20)', desl:'9m', reacoes:null,
            for:'24 (+7)',des:'12 (+1)',con:'15 (+2)',int:'10 (+0)',sab:'14 (+2)',pre:'10 (+0)',
            pericias:'Percepção +5', trs:'FOR +10, CON +5',
            imunidades:null,
            resistencias:'Balístico, cortante, explosivo, impacto e perfurante, quando não causados por aura',
            vulnerabilidades:'Ataques na moleira (oculta entre as manchas, Invest./Percepção CD 25): Crítico x4.',
            sentidos:'Percepção Passiva 15', lingua:'Bestial',
            tracos:[
              {n:'Moleira Oculta',d:'Qualquer ataque contra sua moleira recebe a propriedade Mortal x4. O ponto fica escondido em uma das manchas de seu corpo e exige um teste de Investigação ou Percepção (CD 25) para ser encontrado.'},
              {n:'Tração Animal',d:'Dobra a capacidade de carga.'}
            ],
            acoes:[
              {n:'Mordida Asfixiante',d:'Ataque Corpo-a-Corpo: +10 para acertar, alcance 6m, 2 alvos. Dano médio 11 (1d8+7) de dano de impacto, com sua língua. Cada criatura atingida fica Agarrada (TR de FOR 18 para escapar) e Afogada/Asfixiada. Enquanto mantiver alvos agarrados, o Lagarto Melanino não pode morder novos alvos. :'},
              {n:'Engolir',d:'O Lagarto Melanino realiza uma Mordida contra até 2 alvos Grandes ou menores que esteja agarrando. Cada alvo atingido sofre o dano da Mordida, é engolido e o agarrão termina. Enquanto engolido, o alvo fica Agarrado e tem cobertura total contra ataques e efeitos de fora do Lagarto. Pode agir e atacar, com desvantagem, e sofre 10 (3d6) de dano de impacto no início de cada turno da criatura. Se o Lagarto sofrer 20 ou mais de dano em uma única rodada, deve ser bem-sucedido em um TR de CON 15 ao final desse turno ou regurgita todas as criaturas engolidas, que caem Caídas em um espaço a até 3m dele. Se o Lagarto Melanino morrer, as criaturas engolidas deixam de estar agarradas e podem escapar do corpo usando 18m de movimento, saindo Caídas.'}
            ]
          },
          {
            id:'pompom_supersonico', nome:'Pompom Supersônico', tipo:'Besta de Nen, Médio, Caótico/Neutro, Solitário', cat:'BESTA DE NEN',
            ca:'23 (Defesa Natural)', pv:'18 (3d12)', desl:'15m', reacoes:'10',
            for:'7 (-2)',des:'30 (+10)',con:'16 (+3)',int:'12 (+1)',sab:'18 (+4)',pre:'10 (+0)',
            pericias:'Acrobacia +13, Intuição +7, Percepção +7, Sobrevivência +7', trs:'DES +13, CON +6, SAB +7',
            imunidades:'Ataques de Oportunidade.',
            resistencias:'Impacto',
            vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Visão, Audição), Percepção Passiva 17', lingua:'Bestial',
            tracos:[
              {n:'Pseudo-estático',d:'O Pompom Supersônico é imune a Ataques de Oportunidade.'},
              {n:'Investida Supersônica',d:'Para cada 3m de movimento gasto, o Pompom Supersônico pode realizar um ataque extra, gastando uma Reação. Para cada ataque extra realizado dessa forma, a criatura se fere, perdendo 1 PV devido à velocidade do golpe.'}
            ],
            acoes:[
              {n:'Cabeçada Supersônica',d:'Ataque Corpo-a-Corpo: +13 para acertar, alcance 1,5m, 1 alvo. Dano médio 13 (1d6+10) de dano de impacto.'}
            ]
          },
          {
            id:'lobos_de_matilha', nome:'Lobos de Matilha', tipo:'Besta de Nen, Médio, Maligno, Matilha', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'25 (5d10)', desl:'9m', reacoes:'4',
            for:'15 (+2)',des:'13 (+1)',con:'14 (+2)',int:'10 (+0)',sab:'11 (+0)',pre:'10 (+0)',
            pericias:'Furtividade +4, Percepção +3, Intimidação +3', trs:'FOR +5, PRE +3',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Audição, Olfato), Percepção Passiva 13', lingua:'Comum',
            tracos:[
              {n:'Tática de Matilha',d:'O Lobo recebe vantagem em ataques contra um alvo enquanto um aliado o combate corpo a corpo (1,5m). Reciprocamente, seus aliados recebem vantagem contra esse alvo enquanto o próprio Lobo mantém combate corpo a corpo com ele.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'Membros da matilha atacam 2 vezes em seu turno: 1 de Garras e 1 de Mordida, ou 2 do mesmo tipo. :'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +5 para acertar, alcance 1,5m, 1 alvo. Dano médio 5 (1d6+2) de dano perfurante. :'},
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +5 para acertar, alcance 1,5m, 1 alvo. Dano médio 5 (1d6+2) de dano cortante.'}
            ]
          },
          {
            id:'alfa_de_matilha', nome:'Alfa de Matilha', tipo:'Besta de Nen, Médio, Maligno, Matilha', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'35 (7d10)', desl:'9m', reacoes:'8',
            for:'18 (+4)',des:'14 (+2)',con:'18 (+4)',int:'14 (+2)',sab:'12 (+1)',pre:'10 (+0)',
            pericias:'Atletismo +7, Furtividade +5, Percepção +4, Intimidação +3', trs:'FOR +7, DES +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Audição, Olfato), Percepção Passiva 14', lingua:'Comum',
            tracos:[
              {n:'Comando da Matilha',d:'Como Reação, o Alfa pode comandar que um aliado se mova em alguma direção durante o turno desse aliado, antes ou depois de ele realizar um ataque.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'O Alfa ataca 2 vezes em seu turno: 1 de Garras e 1 de Mordida, ou 2 do mesmo tipo. :'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 7 (1d6+4) de dano perfurante. :'},
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 7 (1d6+4) de dano cortante. :'},
              {n:'Investida (Bote)',d:'Se o Alfa de Matilha se mover pelo menos 6m em linha reta para realizar um ataque de Garras, o alvo deve ser bem-sucedido em um TR de FOR 15 ou fica Caído. Se o alvo cair, o Alfa pode realizar um ataque de Mordida contra ele, mesmo que já tenha mordido nesse turno.'}
            ]
          },
          {
            id:'panda_domestico', nome:'Panda Doméstico', tipo:'Besta de Nen, Médio, Heroico/Neutro, Solitário', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'24 (8d6)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'10 (+0)',con:'14 (+2)',int:'18 (+4)',sab:'15 (+2)',pre:'17 (+3)',
            pericias:'História +7, Religião +7, Intuição +5, Lidar com Animais +5, Percepção +5, Persuasão +6', trs:'INT +7, SAB +5, PRE +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 15', lingua:'Comum',
            tracos:[
              {n:'Proatividade',d:'Após uma conversa simples, o Panda Doméstico consegue buscar algo que agrade ou seja do interesse de um aliado, realizando um teste de Intuição.'}
            ],
            acoes:[
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +6 para acertar, alcance 1,5m, 1 alvo. Dano médio 8 (2d4+3) de dano perfurante.'}
            ]
          },
          {
            id:'toraemon', nome:'Toraemon', tipo:'Besta de Nen, Médio, Caótico/Neutro, Solitário', cat:'BESTA DE NEN',
            ca:'15 (Defesa Natural)', pv:'15 (3d10)', desl:'9m', reacoes:null,
            for:'12 (+1)',des:'10 (+0)',con:'17 (+3)',int:'18 (+4)',sab:'10 (+0)',pre:'16 (+3)',
            pericias:'Arcanismo +7, História +7, Intuição +3, Investigação +7, Percepção +3, Persuasão +6', trs:'INT +7, PRE +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 13', lingua:'Comum',
            tracos:[
              {n:'Bolso 4-D',d:'Toraemon consegue armazenar infinitas coisas em seu bolso frontal, desde que parte do item caiba no bolso.'}
            ],
            acoes:[
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +4 para acertar, alcance 1,5m, 1 alvo. Dano médio 4 (1d6+1) de dano cortante.'}
            ]
          },
          // ── OUTROS ─────────────────────────────────────────────
          {
            id:'passaro_di_nybdi', nome:'Pássaro di Nybdi', tipo:'Besta Natural, Enorme, Neutro, Próximo de Covil', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'30 (5d12)', desl:'9m; Voo 9m', reacoes:'2',
            for:'18 (+4)',des:'12 (+1)',con:'20 (+5)',int:'12 (+1)',sab:'14 (+2)',pre:'11 (+0)',
            pericias:'Sobrevivência +5', trs:'CON +8, SAB +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Bestial',
            tracos:[
              {n:'Tração Animal',d:'Dobra a capacidade de carga e a distância de salto.'},
              {n:'Evasão',d:'Manobra de fuga aérea que adiciona +2 na Reação de esquiva.'}
            ],
            acoes:[
              {n:'Voo Rasante Pesado',d:'Ataque Corpo-a-Corpo: +7 para acertar, +4 a cada 3m de queda (acerto máximo +10), alcance 3m, todos os alvos no espaço ocupado pela criatura. Dano médio 7 (1d6+4) de dano de impacto, +1d6 a cada 3m de queda.'}
            ]
          },
          {
            id:'tigre_acampador', nome:'Tigre Acampador', tipo:'Besta Mágica, Médio, Maligno, Matilha', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'52 (13d8)', desl:'9m', reacoes:'4',
            for:'28 (+9)',des:'19 (+4)',con:'14 (+2)',int:'10 (+0)',sab:'16 (+3)',pre:'17 (+3)',
            pericias:'Atletismo +12, Sobrevivência +6, Lidar com Animais +6, Intimidação +6', trs:'FOR +12, DES +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 13', lingua:'Bestial',
            tags:'⚠️ Matilha de 4-6 — ficha individual; pool de encontro (4): PV total esperado 208 (4 × 52) · dano total esperado 100/rodada (4 × 25). Matilha completa de 6: 312 PV · 150/rodada.🛡️ Besta Mágica — não sofre dobra de aura🛡️ Reações 4 — pool do CAP. 4 (Esquiva 1d20+DES +4)🎯 Empalado — TR de FOR 20 após o acerto da investida, fica Agarrado🟡 VUL. TR INT (10)', naLicenca:'4', naEquipe:'2 *(proposto — sem fórmula de derivação, gap §8.5)*', recomendado:'1 Hunter de nível 3-4, com Hatsus e aura *(proposto)*',
            tracos:[
              {n:'Tática de Matilha',d:'O Tigre Acampador recebe vantagem em ataques contra um alvo enquanto um aliado o combate corpo a corpo (1,5m). Reciprocamente, seus aliados recebem vantagem contra esse alvo enquanto o próprio Tigre mantém combate corpo a corpo com ele.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'O Tigre Acampador realiza 2 ataques por turno: 1 de Chifre Empalador e 1 de Garras, ou 2 de Garras.'},
              {n:'Chifre Empalador',d:'Ataque Corpo-a-Corpo: +12 para acertar, alcance 1,5m, 1 alvo. Dano médio 13 (1d8+9) de dano perfurante. Se o Tigre Acampador se mover pelo menos 3m em linha reta em direção a um alvo logo antes de atingi-lo com o Chifre Empalador, o alvo deve realizar um TR de FOR 20 após o acerto para não ser empalado. Uma criatura empalada fica Agarrada. Apenas um alvo pode estar empalado por vez.'},
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +12 para acertar, alcance 1,5m, 1 alvo. Dano médio 12 (1d6+9) de dano cortante.'}
            ]
          },
          {
            id:'piko', nome:'Piko', tipo:'Besta Natural, Médio ou Grande, Neutro, Solitário', cat:'BESTA NATURAL',
            ca:'12 (Defesa Natural)', pv:'15 (3d10)', desl:'12m', reacoes:null,
            for:'19 (+4)',des:'19 (+4)',con:'10 (+0)',int:'8 (-1)',sab:'12 (+1)',pre:'10 (+0)',
            pericias:'Atletismo +7, Acrobacia +7', trs:'DES +7',
            imunidades:'Exausto', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Compreende Comum, mas não pode falar',
            tracos:[
              {n:'Tração Animal',d:'Dobra a capacidade de carga e a distância de salto.'},
              {n:'Destreza Animal',d:'Vantagem em TR de Destreza.'}
            ],
            acoes:[
              {n:'Bicada',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 7 (1d6+4) de dano de impacto, com seu bico rombudo.'}
            ]
          },
          {
            id:'mike', nome:'Mike', tipo:'Besta Mágica, Enorme, Neutro, Solitário', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'110 (11d20)', desl:'9m', reacoes:'4',
            for:'30 (+10)',des:'19 (+4)',con:'16 (+3)',int:'6 (-2)',sab:'22 (+6)',pre:'18 (+4)',
            pericias:'Atletismo +13, Furtividade +7, Sobrevivência +9, Percepção +9, Intimidação +7', trs:'FOR +13, DES +7, SAB +9',
            imunidades:'Enfeitiçado/Manipulado Mentalmente', resistencias:'Cortante, impacto, perfurante', vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Sentidos Aguçados (Visão, Audição, Olfato), Percepção Passiva 19', lingua:'Compreende Comum, mas não pode falar',
            tags:'⚠️ Dano de equipe: 108/rodada (Patada Devastadora em 3 alvos)🛡️ Transe Subserviente — permanentemente Manipulado pelos Zoldyck; não pode ser manipulado por outros🛡️ Reações 4 — pool do CAP. 4 (Esquiva 1d20+DES +4; Bloqueio CON+FOR)🎯 Patada Devastadora — dano 36 por alvo (4d12+10); sangramento aplicável🛡️ RD cortante/impacto/perfurante (couro)🔴 VUL. TR INT (6)', naLicenca:'4', naEquipe:'2 *(proposto — sem fórmula de derivação, gap §8.5)*', recomendado:'1 Hunter de nível 4-5, com Hatsus e aura *(proposto)*',
            tracos:[
              {n:'Transe Subserviente',d:'Mike está permanentemente sob a condição Manipulado, a serviço da família Zoldyck. Por isso, não pode ser manipulado por mais ninguém. Age em obediência mecânica: memoriza e reage, sem deliberar.'},
              {n:'Tração Animal',d:'Dobra a capacidade de carga e a distância de salto.'}
            ],
            acoes:[
              {n:'Patada Devastadora',d:'Ataque Corpo-a-Corpo: +13 para acertar, alcance 3m, 3 alvos. Dano médio 36 (4d12+10) de dano cortante (patada com garras).'}
            ]
          },
          // ── PLAYTEST / OUTRAS OBRAS ─────────────────────────────
          {
            id:'pumba_fuca_suja', nome:'Pumba Fuça-Suja', tipo:'Besta Natural, Médio, Maligno, Bando (4)', cat:'PLAYTEST',
            ca:'12 (Defesa Natural)', pv:'20 (4d10)', desl:'12m', reacoes:'4',
            for:'16 (+3)',des:'12 (+1)',con:'26 (+8)',int:'5 (-3)',sab:'15 (+2)',pre:'10 (+0)',
            pericias:'Atletismo +6, Sobrevivência +5', trs:'CON +11, PRE +3',
            imunidades:'Veneno / Envenenado', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Bestial',
            tracos:[
              {n:'Implacável (Recarga após um descanso curto ou longo)',d:'Se o Pumba Fuça-Suja sofrer 10 ou menos de dano que o reduziria a 0 pontos de vida, ele é reduzido a 1 ponto de vida em vez disso.'},
              {n:'Corpo Pútrido',d:'Uma criatura que termine seu turno adjacente ao Pumba Fuça-Suja deve realizar um TR de CON 19 para suportar o cheiro podre de seu corpo. Em caso de falha, fica Envenenada até se afastar 6m da criatura.'}
            ],
            acoes:[
              {n:'Presas',d:'Ataque Corpo-a-Corpo: +6 para acertar, alcance 1,5m, 1 alvo. Dano médio 10 (2d6+3) de dano perfurante.'}
            ]
          },
          {
            id:'passaro_da_fe', nome:'Pássaro da Fé', tipo:'Besta Mágica, Pequeno, Caótico, Bando (5)', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'12 (3d8)', desl:'Voo 9m', reacoes:'3',
            for:'2 (-4)',des:'19 (+4)',con:'11 (+0)',int:'10 (+0)',sab:'18 (+4)',pre:'9 (-1)',
            pericias:'Acrobacia +7, Furtividade +7, Intuição +7', trs:'DES +7, INT +3, SAB +7',
            imunidades:'Caído, Cego', resistencias:null, vulnerabilidades:null,
            sentidos:'Ecolocalização', lingua:'Bestial',
            tracos:[
              {n:'Voo Ofuscante',d:'Qualquer inimigo em uma linha reta de até 6m pode ser alvo da luz ofuscante que precede o Rasante do Pássaro da Fé, devendo realizar um TR de CON 15. Em caso de falha, fica Cego por 1d4+2 turnos.'},
              {n:'Pseudo-estático',d:'O Pássaro da Fé é imune a Ataques de Oportunidade causados por sair da área de um alvo em seu próprio turno, caso esse alvo tenha ficado Cego.'},
              {n:'Evasão',d:'Manobra de fuga aérea que adiciona +2 na Reação de esquiva.'}
            ],
            acoes:[
              {n:'Bicada',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 6 (1d4+4) de dano perfurante.'}
            ]
          },
          {
            id:'leaozinho_da_inxia', nome:'Leãozinho da Inxia', tipo:'Besta Natural, Médio, Neutro, Bando (3-5)', cat:'PLAYTEST',
            ca:'14 (Defesa Natural)', pv:'25 (5d10)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'17 (+3)',con:'14 (+2)',int:'10 (+0)',sab:'12 (+1)',pre:'14 (+2)',
            pericias:'Atletismo +7, Furtividade +6, Sobrevivência +4', trs:'FOR +7, DES +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Olfato)', lingua:'Bestial',
            tracos:[
              {n:'Medo Reprodutor',d:'Leõezinhos da Inxia são criaturas herbívoras e, apesar de seu tamanho, normalmente não são hostis. Pelo contrário, são tão passivos que costumam ser considerados deliciosas presas e fonte de muita carne. Porém, reproduzem-se muito rápido (uma cria por dia) e logo se dividem em novos bandos. Quando se defendem o medo acelera esse processo, gerando mais um para o bando a cada 3 rodadas.'}
            ],
            acoes:[
              {n:'Mordida Defensiva',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 8 (1d8+4) de dano perfurante.'}
            ]
          },
          {
            id:'mariposa_poodle', nome:'Mariposa Poodle', tipo:'Besta Mágica, Médio, Neutro, Solitário', cat:'PLAYTEST',
            ca:'16 (Defesa Natural)', pv:'15 (3d10)', desl:'Voo 6m', reacoes:null,
            for:'1 (-5)',des:'19 (+4)',con:'6 (-2)',int:'8 (-1)',sab:'11 (+0)',pre:'9 (-1)',
            pericias:'Acrobacia +7, Furtividade +7', trs:'DES +7',
            imunidades:'Caído', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Bestial',
            tracos:[
              {n:'Beleza Pútrida',d:'Mariposas Poodle são os "urubus das frutas": alimentam-se basicamente delas e não são hostis.'}
            ],
            acoes:[
              {n:'Furtividade Simulada',d:'A Mariposa Poodle pode se ocultar fazendo seu pelo crescer e simulando uma bola de algodão.'}
            ]
          },
          {
            id:'zebralo', nome:'Zebralo', tipo:'Besta Natural, Médio, Neutro, Bando (3-5)', cat:'PLAYTEST',
            ca:'16 (Defesa Natural)', pv:'40 (8d10)', desl:'15m', reacoes:null,
            for:'22 (+6)',des:'16 (+3)',con:'15 (+2)',int:'10 (+0)',sab:'13 (+1)',pre:'10 (+0)',
            pericias:'Atletismo +9, Sobrevivência +4', trs:'FOR +9, CON +5, SAB +4',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Bestial',
            tracos:[
              {n:'Tração Animal',d:'Dobra a capacidade de carga.'}
            ],
            acoes:[
              {n:'Coice',d:'Ataque Corpo-a-Corpo: +9 para acertar, alcance 1,5m, 1 alvo. Dano médio 12 (1d12+6) de dano de impacto, Mortal x3.'}
            ]
          },
          {
            id:'thri_kreen', nome:'Thri-Kreen', tipo:'Besta Mágica, Médio, Neutro, Solitário', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'32 (8d8)', desl:'12m (salto parado de 6m)', reacoes:'4',
            for:'12 (+1)',des:'15 (+2)',con:'13 (+1)',int:'8 (-1)',sab:'12 (+1)',pre:'7 (-2)',
            pericias:'Furtividade +5, Percepção +4, Sobrevivência +4', trs:null,
            imunidades:'Sangramento',
            resistencias:null,
            vulnerabilidades:'Impacto (Concussão).',
            sentidos:'Visão no Escuro 18m, Percepção Passiva 14', lingua:'Thri-Kreen',
            tracos:[
              {n:'Corpo Adaptável — Corpo Frágil',d:'Essa criatura possui vulnerabilidade a dano de impacto.'},
              {n:'Corpo Adaptável — Sistema Hemostático',d:'Essa criatura possui pouco fluxo sanguíneo em seu corpo e é imune à condição Sangramento, pela ausência de pressão sanguínea.'},
              {n:'Corpo Aberrante — Quatro Patas Braçais',d:'A criatura possui 4 patas que usa como braços e mãos. Com isso, pode segurar duas armas de duas mãos ao mesmo tempo.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'O Thri-Kreen realiza 2 ataques por turno: 1 de Garras ou Mordida e 1 com arma, ou 2 do mesmo tipo.'},
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +4 para acertar, alcance 1,5m, 1 alvo. Dano médio 6 (2d4+1) de dano cortante.'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +4 para acertar, alcance 1,5m, 1 alvo. Dano médio 6 (2d4+1) de dano perfurante. O alvo deve realizar um TR de CON 12: em caso de falha, fica Envenenado por 1 minuto; se falhar por 5 ou mais, fica também Paralisado.'},
              {n:'Gythka',d:'Ataque Corpo-a-Corpo: +4 para acertar, alcance 1,5m, 1 alvo. Dano médio 5 (1d8+1) de dano perfurante.'},
              {n:'Chathka',d:'Ataque à Distância: +5 para acertar, alcance 9m, 1 alvo. Dano médio 5 (1d6+2) de dano cortante.'}
            ]
          },
          {
            id:'boitata_adulto', nome:'Boitatá Adulto', tipo:'Besta Mágica, Enorme, Caótico/Maligno, Solitário', cat:'PLAYTEST',
            ca:'19 (Defesa Natural)', pv:'150 (15d20)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'20 (+5)',con:'18 (+4)',int:'14 (+2)',sab:'11 (+0)',pre:'7 (-2)',
            pericias:'Acrobacia +8, Lidar com Animais +3, Intimidação +1, Percepção +3, Sobrevivência +3', trs:'FOR +6, DES +8, CON +7',
            imunidades:'Fogo', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 13', lingua:'Bestial',
            tracos:[
              {n:'Presença Perigosa (Calor)',d:'Ao entrar no alcance de 3m, a criatura deve realizar um TR de CON 18, sofrendo 1d12 de dano de fogo em caso de falha. Enquanto estiver no alcance, repete o teste no início de cada um de seus turnos. Uma criatura que passe em qualquer um desses testes fica imune a eles por um dia.'},
              {n:'Rastro de Fogo',d:'Por onde passa, deixa uma mancha de fogo no chão. Quem atravessar a área sofre 1d4 de dano de fogo; quem terminar o turno nela sofre +1d6 de dano de fogo.'}
            ],
            acoes:[
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +6 para acertar, alcance 3m, 2 alvos. Dano médio 7 (1d8+3) de dano perfurante. Cada alvo atingido deve realizar um TR de CON 20 ou sofre mais 1d12 de dano de fogo.'}
            ]
          },
          {
            id:'boitata_jovem', nome:'Boitatá Jovem', tipo:'Besta Mágica, Enorme, Caótico/Maligno, Solitário', cat:'PLAYTEST',
            ca:'19 (Defesa Natural)', pv:'60 (6d20)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'20 (+5)',con:'14 (+2)',int:'12 (+1)',sab:'11 (+0)',pre:'7 (-2)',
            pericias:'Acrobacia +8, Lidar com Animais +3, Intimidação +1, Percepção +3, Sobrevivência +3', trs:'FOR +6, DES +8, CON +5',
            imunidades:'Fogo', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 13', lingua:'Bestial',
            tracos:[
              {n:'Presença Perigosa (Calor)',d:'Ao entrar no alcance (3m): TR CON CD 18 ou recebe 1d12 fogo. Passar 1 vez = imune por um dia.'},
              {n:'Rastro de Fogo',d:'Deixa mancha de fogo. Passar: 1d4 fogo. Terminar turno: +1d6 fogo.'}
            ],
            acoes:[
              {n:'Mordida',d:'+3 para acertar, 3m, 2 alvos. Dano: 7 (1d8+3) perfurante + TR CON CD 20: falha = +1d12 fogo.'}
            ]
          },
          {
            id:'canibal_hitoku', nome:'Canibal Hitoku', tipo:'Besta Mágica, Médio, Caótico, Solitário', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'50 (10d10)', desl:'9m', reacoes:null,
            for:'14 (+2)',des:'14 (+2)',con:'18 (+4)',int:'10 (+0)',sab:'20 (+5)',pre:'16 (+3)',
            pericias:'Percepção +8, Furtividade +5, Intimidação +6', trs:'CON +7, SAB +8',
            imunidades:'Caído',
            resistencias:null,
            vulnerabilidades:'Qualquer ataque de uma criatura que não tenha sido copiada: dano dobrado.',
            sentidos:'Visão no Escuro 18m, Percepção Passiva 18', lingua:'A da criatura copiada',
            tracos:[
              {n:'Cópia Perfeita',d:'Observando um alvo por um turno, a criatura assume sua forma completa, passando a ter todos os atributos e habilidades especiais do copiado. Enquanto estiver copiando, sofre metade do dano causado pelo alvo copiado, mas recebe o dobro do dano de qualquer outra criatura. Não pode trocar de cópia até derrotar o copiado.'}
            ],
            acoes:[
              {n:'Garra (sem cópia)',d:'Ataque Corpo-a-Corpo: +5 para acertar, alcance 1,5m, 1 alvo. Dano médio 7 (1d10+2) de dano cortante.'},
              {n:'Cópia',d:'A criatura usa qualquer habilidade do alvo copiado descrita em sua ficha, incluindo Hatsu.'}
            ]
          },
          {
            id:'lefyurgo', nome:'Lefyurgo', tipo:'Aberração, Médio, Maligno, Solitário', cat:'ABERRAÇÃO',
            ca:'18 (Defesa Natural)', pv:'25 (5d10)', desl:'9m', reacoes:'8',
            for:'18 (+4)',des:'13 (+1)',con:'17 (+3)',int:'18 (+4)',sab:'18 (+4)',pre:'22 (+6)',
            pericias:'Atletismo +7, Investigação +7, Intuição +7, Percepção +7, Sobrevivência +7, Intimidação +9', trs:'FOR +7, PRE +9',
            imunidades:'Agarrado, Enredado/Preso', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Sentidos Aguçados (Visão), Percepção Passiva 17', lingua:'Comum',
            tracos:[
              {n:'Corpo Adaptável',d:'Com uma Reação, ou sem custo em seu próprio turno, os Lefyurgos conseguem transformar parte de seus corpos, deslocando membros e órgãos para outros locais ou fazendo surgir novos. Para isso, role 1d100: com 50 ou menos, recebem 1 nível de exaustão.'}
            ],
            acoes:[
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 7 (1d6+4) de dano perfurante e 5 (1d4+3) de dano necrótico.'},
              {n:'Sinergia Morfológica',d:'Após causar um total de 10 de dano necrótico em um alvo, o Lefyurgo adapta seu sistema ao sangue dele, e seus próximos ataques contra esse alvo recuperam PV iguais ao dano necrótico causado.'}
            ]
          },
          // ── MADE IN ABYSS ───────────────────────────────────────
          {
            id:'amakagame', nome:'Amakagame', tipo:'Aberração, Colossal, Neutro, Solitário', cat:'ABERRAÇÃO',
            ca:'12 (Defesa Natural)', pv:'40 (4d20)', desl:'6m', reacoes:null,
            for:'5 (-3)',des:'5 (-3)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',pre:'5 (-3)',
            pericias:'Sobrevivência +5, Percepção +5', trs:'CON +7',
            imunidades:'Corrosivo, veneno',
            resistencias:'Impacto',
            vulnerabilidades:'Cortante, fogo',
            sentidos:'Percepção Passiva 15', lingua:'Desconhecida',
            tracos:[
              {n:'Corpo Adaptável — Corpo Malemolente',d:'Possui resistência a dano de impacto, pelo corpo menos rígido, que oferece menos resistência a contatos físicos pela adaptação e "englobamento" no momento do impacto.'},
              {n:'Corpo Adaptável — Corpo Fagomorfo',d:'Qualquer criatura que termine seu turno adjacente ao Amakagame é englobada por seu corpo, atraída por uma membrana que se estende em direção a criaturas vivas, e fica Agarrada dentro dele.'},
              {n:'Digestão Passiva',d:'Uma criatura que inicie seu turno dentro do Amakagame sofre 10 (3d6) de dano corrosivo. Esse dano deteriora objetos, armaduras e equipamentos como se tivessem sido atingidos por ataques mirados. (Os dados são rolados uma vez e todos recebem o valor, sem dividir.)'}
            ],
            acoes:[
              {n:'Extensão da Membrana Faminta',d:'Ataque em área: ao se mover para o espaço de outra criatura, o Amakagame impõe um TR de CON 21. Em caso de falha, todos no local sofrem 21 (6d6) de dano corrosivo, assim como todos os seus equipamentos. Em caso de sucesso, o alvo sofre metade do dano, seus equipamentos não são afetados, e ele fica imune à Extensão da Membrana Faminta por 24 horas.'}
            ]
          },
          {
            id:'imperador_couraca', nome:'Imperador Couraça', tipo:'Besta Mágica, Médio Modificado, Caótico/Maligno, Solitário', cat:'BESTA MÁGICA',
            ca:'26 (Defesa Natural)', pv:'66 (11d12)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'1 (-5)',con:'27 (+8)',int:'10 (+0)',sab:'10 (+0)',pre:'10 (+0)',
            pericias:'Atletismo +7, Sobrevivência +3', trs:'FOR +7, CON +11',
            imunidades:'Elétrico, fogo, psíquico, veneno',
            resistencias:'Cortante, impacto, perfurante (de ataques com DES)',
            vulnerabilidades:'Balístico, perfurante (de ataques com FOR)',
            sentidos:'Sentido Sísmico', lingua:'Desconhecida',
            tracos:[
              {n:'Criatura de Cerco',d:'O dano do Imperador Couraça contra construções, estruturas e constructos é sempre considerado crítico.'},
              {n:'Tração Animal',d:'Dobra a capacidade de carga.'},
              {n:'Aparência Falsa',d:'O Imperador Couraça passa despercebido como uma rocha enquanto não realizar ações, contra Percepção Passiva 15.'},
              {n:'Fraqueza a Armas de Cerco',d:'Ataques com armas de cerco causam dano dobrado ao Imperador Couraça.'}
            ],
            acoes:[
              {n:'Investida Pesada',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 2 alvos. Dano médio 13 (2d8+4) de dano de impacto.'},
              {n:'Cauda da Muralha Oportunista',d:'Ao defender um ataque com sua carapaça pedregosa, o Imperador Couraça pode realizar um ataque de cauda como Reação, sem custo. Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 13 (2d8+4) de dano de impacto.'}
            ]
          },
          {
            id:'hidra_do_deserto', nome:'Hidra do Deserto', tipo:'Aberração, Médio Modificado, Maligno, Solitário', cat:'ABERRAÇÃO',
            ca:'18 (Defesa Natural)', pv:'84 (14d12)', desl:'9m', reacoes:'12',
            for:'17 (+3)',des:'21 (+5)',con:'15 (+2)',int:'12 (+1)',sab:'15 (+2)',pre:'10 (+0)',
            pericias:'Atletismo +6, Furtividade +8, Percepção +5', trs:'FOR +6, DES +8, CON +5',
            imunidades:'Sangramento',
            resistencias:'Cortante, Perfurante (Carapaça/Sistema Hemostático).',
            vulnerabilidades:'7 caudas sensíveis — ataques mirados com 10+ dano inutilizam a cauda.',
            sentidos:'Sentido Sísmico, Percepção Passiva 15', lingua:'Desconhecida',
            tracos:[
              {n:'Escudo Natural/Carapaça',d:'Resistência a dano cortante e perfurante.'},
              {n:'Corpo Adaptável — Sistema Hemostático',d:'Essa criatura possui pouco fluxo sanguíneo em seu corpo e é imune à condição Sangramento, pela ausência de pressão sanguínea.'},
              {n:'Caudas Sensíveis',d:'A Hidra possui 7 caudas. Ataques mirados que causem 10 ou mais de dano a uma cauda a inutilizam.'},
              {n:'Arma Natural — Ferrões',d:'Os ataques de cauda da Hidra têm alcance de 3m e a propriedade Finta enquanto ela tiver mais de duas caudas funcionais, sem precisar gastar Ação Bônus.'}
            ],
            acoes:[
              {n:'Cauda com Ferrão',d:'Ataque Corpo-a-Corpo: +6 para acertar, alcance 3m, 1 alvo. Dano médio 10 (2d6+3) de dano perfurante. A cada novo acerto no mesmo alvo, os dados de dano aumentam na seguinte progressão: 4d6; 6d6; 8d6; 10d6; 12d6; 14d6 (sempre +3).'}
            ]
          },
          {
            id:'fuzosheppu_oogasumi', nome:'Fuzosheppu/Oogasumi', tipo:'Aberração, Colossal (porém mais leve que o ar), Neutro, Solitário', cat:'ABERRAÇÃO',
            ca:'12 (Defesa Natural)', pv:'10 (1d12+4) Camada Externa / 36 (6d10+4) Núcleo', desl:'Voo 15m', reacoes:null,
            for:'5 (-3)',des:'5 (-3)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',pre:'5 (-3)',
            pericias:'Natureza +4, Sobrevivência +5', trs:'CON +7',
            imunidades:'Balístico, cortante, impacto e perfurante (camada externa) / Agarrado (camada externa), Surdo (é naturalmente surdo)',
            resistencias:null,
            vulnerabilidades:'Fogo (camada externa)',
            sentidos:'Sentido Térmico', lingua:'Desconhecida',
            tracos:[
              {n:'Corpo Adaptável — Corpo Gasoso de Núcleo Sólido e Leve',d:'Um vento capaz de mover um corpo, ou uma explosão com propriedade de dispersão, pode separar a camada externa do núcleo sólido.'},
              {n:'Licor Corrosivo',d:'Uma criatura que inicie seu turno dentro do Fuzosheppu/Oogasumi sofre 10 (3d6) de dano corrosivo. Esse dano deteriora objetos, armaduras e equipamentos como se tivessem sido atingidos por ataques mirados. (Os dados são rolados uma vez e todos recebem o valor, sem dividir.)'}
            ],
            acoes:[
              {n:'Disparo Corrosivo',d:'Ataque à Distância em área: +7 para acertar, alcance 9m, 3 alvos. Dano médio 15 (2d10+4) de dano corrosivo.'}
            ]
          },
          {
            id:'gogouge_presa_de_seda', nome:'Gogouge — Presa de Seda', tipo:'Besta Natural, Enorme, Maligno, Próximo de Covil', cat:'BESTA NATURAL',
            ca:'17 (Defesa Natural)', pv:'126 (21d12)', desl:'15m', reacoes:'6',
            for:'18 (+4)',des:'22 (+6)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',pre:'1 (-5)',
            pericias:'Atletismo +7, Intuição +5, Percepção +5, Sobrevivência +5', trs:'DES +9, CON +7, SAB +5',
            imunidades:'Corrosivo, veneno', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 15', lingua:'Desconhecida',
            tracos:[
              {n:'Disparo Peçonhento',d:'A Presa de Seda dispara um líquido corrosivo e pegajoso em suas vítimas, com o objetivo de prendê-las enquanto a gosma as corrói.'},
              {n:'Transe de Caça',d:'Enquanto estiver focada em um alvo, a Presa de Seda consegue atacá-lo duas vezes.'}
            ],
            acoes:[
              {n:'Disparo Peçonhento',d:'Ataque à Distância: +9 para acertar, alcance 9m, raio de 3m. A área se torna terreno difícil, e as criaturas atingidas devem realizar um TR de FOR 18 ou ficam Enredadas/Presas na gosma. Quem permanecer na poça sofre 3 (1d6) de dano corrosivo por turno.'},
              {n:'Garras Cortantes',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 13 (2d8+4) de dano cortante.'}
            ]
          },
          {
            id:'bico_de_martelo', nome:'Bico de Martelo', tipo:'Besta Mágica, Médio, Maligno, Solitário', cat:'BESTA MÁGICA',
            ca:'16 (Defesa Natural)', pv:'36 (6d12)', desl:'Voo 12m', reacoes:'4',
            for:'17 (+3)',des:'18 (+4)',con:'17 (+3)',int:'12 (+1)',sab:'15 (+2)',pre:'11 (+0)',
            pericias:'Acrobacia +7, Percepção +5, Sobrevivência +5', trs:'CON +6, SAB +5',
            imunidades:'Atordoado (por som ou impacto), Caído', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 15', lingua:'Bestial',
            tracos:[
              {n:'Rasante',d:'Ao se mover em voo por 3m ou mais, sua velocidade impede Ataques de Oportunidade ao sair do alcance de um alvo.'},
              {n:'Regeneração',d:'Sua arma natural o tornou resistente a golpes e, com isso, sua recuperação natural é acelerada: recupera 1d8+3 PV por turno.'}
            ],
            acoes:[
              {n:'Bico de Martelo',d:'Ataque Corpo-a-Corpo: +6 para acertar, alcance 1,5m, 1 alvo. Dano médio 9 (1d12+3) de dano de impacto.'},
              {n:'Martelo Voador',d:'Utilizando seu Rasante: Ataque Corpo-a-Corpo: +6 para acertar, alcance 1,5m, 1 alvo. Dano médio 12 (1d12+6) de dano de impacto. Ao ser atingido, um alvo de tamanho Médio ou menor deve realizar um TR de FOR 14 para não ser arremessado 6m, sofrendo 2d6 de dano de impacto pela queda e ficando Caído. Além disso, um ataque de Bico de Martelo com 20 natural impõe ao alvo um TR de CON 14; em caso de falha, ele fica Atordoado.'}
            ]
          },
          {
            id:'hanashirama', nome:'Hanashirama', tipo:'Aberração, Miúdo, Neutro, Colônia (10)', cat:'ABERRAÇÃO',
            ca:'22 (Defesa Natural)', pv:'2 (1d4)', desl:'Natação 9m', reacoes:'Ilimitadas. Essa criatura não ataca em seu turno, mas reage toda vez que é tocada ou se move',
            for:'1 (-5)',des:'12 (+1)',con:'6 (-2)',int:'9 (-1)',sab:'12 (+1)',pre:'1 (-5)',
            pericias:'Furtividade +4', trs:'DES +4, SAB +4',
            imunidades:'Envenenado',
            resistencias:null,
            vulnerabilidades:'Impacto',
            sentidos:'Percepção às Cegas', lingua:'Desconhecida',
            tracos:[
              {n:'Peçonha',d:'Aplicação de veneno e corrosão no contato ou ataque.'}
            ],
            acoes:[
              {n:'Glândulas Dissipadoras',d:'Ataque Reativo (ao ser tocada ou receber dano): espirro de peçonha em 1,5m sobre o atacante ou objeto, causando 11 (3d6) de dano corrosivo e 7 (2d6) de dano de veneno. Um alvo vivo deve realizar um TR de CON 25 para resistir ao envenenamento. Shu pode proteger um objeto contra a corrosão.'}
            ]
          },
          {
            id:'inbyos', nome:'Inbyos', tipo:'Monstruosidade, Médio, Maligno, Bando (3-5)', cat:'MONSTRUOSIDADE',
            ca:'16 (Defesa Natural)', pv:'35 (7d10)', desl:'9m (18m em Movimento Transflorestal)', reacoes:'4',
            for:'18 (+4)',des:'18 (+4)',con:'14 (+2)',int:'12 (+1)',sab:'15 (+2)',pre:'10 (+0)',
            pericias:'Atletismo +7, Furtividade +7, Acrobacia +7, Percepção +5', trs:'FOR +7, DES +7',
            imunidades:null, resistencias:null,
            vulnerabilidades:'Luz.',
            sentidos:'Percepção Passiva 15', lingua:'Desconhecida',
            tracos:[
              {n:'Movimento Transflorestal',d:'Ao escalar árvores em meio à floresta, os Inbyos se deslocam entre elas com saltos, como se estivessem em terra firme — porém com o dobro do deslocamento.'},
              {n:'Tática de Matilha',d:'O Inbyo recebe vantagem em ataques contra um alvo enquanto um aliado o combate corpo a corpo (1,5m). Reciprocamente, seus aliados recebem vantagem contra esse alvo enquanto o próprio Inbyo mantém combate corpo a corpo com ele.'},
              {n:'Sensibilidade à Luz',d:'Enquanto estiver exposta a luz intensa, a criatura sofre os efeitos de Exausto (nível 2).'}
            ],
            acoes:[
              {n:'Garras Firmes',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Com suas múltiplas garras, o Inbyo prende o alvo, aplicando a condição Agarrado contra a CA do alvo, no lugar de causar dano.'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +7 para acertar, alcance 1,5m, 1 alvo. Dano médio 8 (1d8+4) de dano perfurante.'}
            ]
          },
          {
            id:'kuongatari', nome:'Kuongatari', tipo:'Besta Natural, Miúdo, Neutro, Colônia (10)', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'4 (2d4) cada; 40 a colônia completa', desl:'6m', reacoes:null,
            for:'7 (-2)',des:'16 (+3)',con:'12 (+1)',int:'6 (-2)',sab:'10 (+0)',pre:'3 (-4)',
            pericias:'Natureza +1, Percepção +3', trs:'CON +4, SAB +3',
            imunidades:'Impacto / Envenenado, Esmagado',
            resistencias:'Cortante.',
            vulnerabilidades:null,
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Picada Carapeçonhenta',d:'Quando o alvo está cercado por 5 ou mais membros da colônia, o acerto da Picada é automático.'},
              {n:'Escudo Natural/Carapaça',d:'Resistência a dano cortante.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'O Kuongatari realiza 2 ataques (Picada e Mordida) quando não utiliza a picada em colônia no turno.'},
              {n:'Picada Carapeçonhenta',d:'Ataque Corpo-a-Corpo: +6 para acertar, alvo em que o inseto esteja pousado. Dano médio 5 (1d4+3) de dano perfurante. A picada transmite um veneno que não causa dano, mas tem efeito paralisante: o alvo deve superar um TR de CON 20 ou fica Imóvel, com os músculos enfraquecidos. Para se mover sob esse efeito, precisa superar um TR de FOR 20 no próprio turno. Para encerrar o efeito, precisa superar o TR de CON original.'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +6 para acertar, alvo em que o inseto esteja pousado. Dano médio 8 (2d4+3) de dano perfurante.'}
            ]
          },
          {
            id:'madokajacks', nome:'Madokajacks', tipo:'Besta Mágica, Grande, Maligno, Solitário ou Par', cat:'BESTA MÁGICA',
            ca:'21 (Defesa Natural); 18 nas membranas das asas', pv:'55 (11d10)', desl:'9m; Voo 15m', reacoes:'6',
            for:'20 (+5)',des:'20 (+5)',con:'15 (+2)',int:'14 (+2)',sab:'17 (+3)',pre:'10 (+0)',
            pericias:'Atletismo +8, Acrobacia +8, Intuição +6, Percepção +6', trs:'FOR +8, DES +8',
            imunidades:'Surdo',
            resistencias:null,
            vulnerabilidades:'Luz.',
            sentidos:'Percepção Passiva 16', lingua:'Desconhecida',
            tracos:[
              {n:'Evasão',d:'Manobra de fuga aérea que adiciona +2 na Reação de esquiva.'},
              {n:'Investida',d:'Manobra de ataque que depende de 6m de deslocamento para aplicar uma condição.'},
              {n:'Rasante',d:'Manobra de ataque aéreo que entra e sai da área do alvo sem receber Ataque de Oportunidade.'},
              {n:'Sensibilidade à Luz',d:'Enquanto estiver exposta a luz intensa, a criatura sofre os efeitos de Exausto (nível 2).'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'O Madokajacks realiza 1 ataque de Mordida se um alvo for derrubado pela Investida do Vendaval Rasante.'},
              {n:'Investida do Vendaval Rasante',d:'Efeito em cone de 4,5m: não causa dano. Os alvos são empurrados 6m e devem realizar um TR de FOR 16 contra a força do vendaval; em caso de falha, ficam Caídos.'},
              {n:'Mordida',d:'Contra um alvo Caído: Ataque Corpo-a-Corpo: +8 para acertar, alcance 3m, 1 alvo. Dano médio 14 (2d8+5) de dano perfurante.'}
            ]
          },
          {
            id:'mandibula_escarlate', nome:'Mandíbula Escarlate', tipo:'Besta Mágica, Colossal, Maligno, Solitário', cat:'BESTA MÁGICA',
            ca:'25 (Defesa Natural)', pv:'250 (25d20)', desl:'Voo 27m (ou planando)', reacoes:'5',
            for:'30 (+10)',des:'18 (+4)',con:'30 (+10)',int:'10 (+0)',sab:'15 (+2)',pre:'16 (+3)',
            pericias:'Atletismo +13, Intimidação +6', trs:'FOR +13, CON +13',
            imunidades:'Amedrontado/Assustado, Exausto, Surdo', resistencias:'Cortante, impacto', vulnerabilidades:null,
            sentidos:'Percepção às Cegas', lingua:'Desconhecida',
            tags:'⚠️ Dano de equipe: 120/rodada (Mordida 21 + Cauda 19 em até 3 alvos adjacentes)🛡️ Limiar Mínimo de Dano 40 — dano abaixo de 40 é superficial; peso próprio no N.A. (teto S)🛡️ RD cortante/impacto🛡️ Reações 5 — pool do CAP. 4🛡️ CA 25 — banda S (teto)🛡️ Imune a Amedrontado/Assustado, Exausto, Surdo🟡 VUL. TR INT (10)', naLicenca:'8 *(proposto — pendente de playtest dedicado)*', naEquipe:'(proposto — sem fórmula de derivação, gap §8.5)', recomendado:'1 Hunter de nível 7-8, com Hatsus e aura *(proposto)*', limiar:40,
            tracos:[
              {n:'Criatura de Cerco',d:'O dano da Mandíbula Escarlate contra construções, estruturas e constructos é sempre considerado crítico.'},
              {n:'Limiar Mínimo de Dano (40)',d:'Qualquer dano abaixo de 40 é considerado superficial e não reduz os pontos de vida da Mandíbula Escarlate.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'A Mandíbula Escarlate realiza 2 ataques por turno: 1 de Mordida e 1 de Cauda, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +13 para acertar, alcance 3m, até 3 alvos. Dano médio 21 (2d10+10) de dano cortante.'},
              {n:'Cauda',d:'Ataque Corpo-a-Corpo: +13 para acertar, alcance 3m, até 3 alvos. Dano médio 19 (2d8+10) de dano de impacto.'},
              {n:'Ataque de Cerco',d:'Ao perseguir um alvo menor, a Mandíbula Escarlate golpeia muros, paredes ou árvores para que desabem sobre ele. Ataque Corpo-a-Corpo: +13 para acertar, contra construções, constructos e ambientes naturais. Dano médio 21 (2d10+10) de dano de impacto.'},
              {n:'Desabamento',d:'Se a estrutura for destruída, ela cede sobre a área. O local passa a ser terreno difícil.'},
              {n:'Esmagamento',d:'Todas as criaturas sob a estrutura e em até 3m realizam um TR de DES 21. Em caso de falha, sofrem 28 (4d8+10) de dano de impacto e ficam Caídas; em caso de sucesso, sofrem metade do dano e não caem.'}
            ]
          },
          {
            id:'nakikabane_lamentador_de_cadaver', nome:'Nakikabane — Lamentador de Cadáver', tipo:'Besta Mágica, Médio Modificado, Caótico/Maligno, Próximo de Covil', cat:'BESTA MÁGICA',
            ca:'17 (Defesa Natural)', pv:'72 (12d12)', desl:'9m; Voo 21m', reacoes:'6',
            for:'14 (+2)',des:'18 (+4)',con:'9 (-1)',int:'12 (+1)',sab:'18 (+4)',pre:'7 (-2)',
            pericias:'Atletismo +5, Acrobacia +7, Intuição +7', trs:'FOR +5, DES +7, SAB +7',
            imunidades:'Amedrontado/Assustado', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 14', lingua:'Desconhecida',
            tracos:[
              {n:'Mímico Sonoro',d:'O Lamentador de Cadáver engana seus alvos simulando o choro de pessoas feridas. Assim que alguém se aproxima para ajudar, a criatura ataca com seu olhar e parte para cima do novo alvo. Criaturas que já viram essa criatura e sobreviveram normalmente são imunes a esse efeito, enquanto as que nunca se depararam com ela normalmente não têm chance de duvidar.'},
              {n:'Emboscador',d:'Ao atingir um alvo Desprevenido, adiciona um dado de dano da arma com resultado máximo.'},
              {n:'Olhar Aterrorizante',d:'Um olhar que provoca medo em seus alvos, paralisando-os e facilitando seu ataque.'}
            ],
            acoes:[
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +5 para acertar, alcance 1,5m, 1 alvo. Dano médio 11 (2d8+2) de dano perfurante.'},
              {n:'Garras',d:'Ataque Corpo-a-Corpo: +5 para acertar (Crítico 19), alcance 1,5m, 1 alvo. Dano médio 12 (3d6+2) de dano cortante.'},
              {n:'Olhar Aterrorizante',d:'Efeito à distância: alvos dentro do campo de visão, a até 18m, devem realizar um TR de SAB 15. Em caso de falha, ficam Amedrontados/Assustados e perdem 1 de Sanidade. O teste pode ser refeito ao fim de cada turno dos alvos afetados.'}
            ]
          },
          {
            id:'dragao_turbinidio_ryuusazai', nome:'Dragão Turbinídio — Ryuusazai', tipo:'Besta Mágica, Colossal, Maligno, Solitário', cat:'BESTA MÁGICA',
            ca:'23 (Defesa Natural)', pv:'190 (19d20)', desl:'18m', reacoes:null,
            for:'30 (+10)',des:'17 (+3)',con:'30 (+10)',int:'10 (+0)',sab:'26 (+8)',pre:'10 (+0)',
            pericias:'Atletismo +13, Percepção +11', trs:'FOR +13, SAB +11',
            imunidades:'Amedrontado/Assustado, Atordoado, Queimado, Sangramento', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 21', lingua:'Desconhecida',
            limiar:50,
            tracos:[
              {n:'Criatura de Cerco',d:'O dano do Dragão Turbinídio contra construções, estruturas e constructos é sempre considerado crítico.'},
              {n:'Limiar Mínimo de Dano (50)',d:'Qualquer dano abaixo de 50 é considerado superficial e não reduz os pontos de vida do Dragão Turbinídio.'},
              {n:'Cuspe Pútrido',d:'Essa criatura consegue expelir um líquido pútrido que causa dano necrótico em seus alvos.'}
            ],
            acoes:[
              {n:'Mordida',d:'Ataque Corpo-a-Corpo: +13 para acertar, alcance 6m, 2 alvos. Dano médio 23 (3d8+10) de dano perfurante.'},
              {n:'Pisão/Patada',d:'Ataque Corpo-a-Corpo: +13 para acertar, alcance 6m, 1 alvo. Dano médio 23 (3d8+10) de dano de impacto. O local pisado se torna terreno difícil.'},
              {n:'Cuspe Pútrido (Recarga 5-6)',d:'Ataque à Distância: +13 para acertar, alcance 18m, 1 alvo. Dano médio 29 (3d12+10) de dano necrótico.'}
            ]
          },
          {
            id:'tamaugachi', nome:'Tamaugachi', tipo:'Monstruosidade, Médio Modificado, Maligno, Solitário', cat:'MONSTRUOSIDADE',
            ca:'18 (Defesa Natural)', pv:'84 (14d12)', desl:'12m', reacoes:'17',
            for:'28 (+9)',des:'24 (+7)',con:'30 (+10)',int:'7 (-2)',sab:'30 (+10)',pre:'4 (-3)',
            pericias:'Atletismo +12, Acrobacia +10, Natureza +1, Percepção +13', trs:'CON +13, SAB +13',
            imunidades:'Atordoado, Cego, Envenenado, Surdo', resistencias:null,
            vulnerabilidades:'Intimidação com REN.',
            sentidos:'Percepção às Cegas, Percepção Passiva 23', lingua:'Desconhecida',
            tracos:[
              {n:'Arma Natural e Corpo Adaptável — Espinhos',d:'O Tamaugachi possui espinhos venenosos no corpo, que pode fazer crescer em qualquer direção, em até 1,5m, enquanto estiverem conectados ao seu corpo.'},
              {n:'Sensibilidade Energética',d:'A criatura percebe o fluxo de aura de seres vivos, prevendo ataques e intenções: ataques e ações de combate que usem aura contra ela sofrem -5. Em contrapartida, ao ser intimidada com Ren, recebe dano psíquico dobrado. Zetsu anula o efeito.'}
            ],
            acoes:[
              {n:'Ponta Venenosa',d:'Ataque Corpo-a-Corpo: +12 para acertar, alcance 1,5m, todos os alvos adjacentes sem Zetsu. Dano médio 20 (2d10+9) de dano perfurante. Os locais atingidos precisam ser nomeados. O alvo perfurado deve realizar um TR de CON 21. Em caso de falha, o local perfurado sofre um veneno localizado que causa 26 (3d10+10) de dano de veneno e incapacita o uso daquele membro, que começa a inchar e se deformar. Um novo teste deve ser realizado ao fim do turno do alvo envenenado.'},
              {n:'Defesa Venenosa',d:'Como Reação, o Tamaugachi pode fazer crescer seus espinhos para retribuir um ataque recebido. O atacante deve realizar um TR de DES 18 para evitar os espinhos; essa manobra reduz em 50% o dano causado à criatura. Em caso de falha, o dano total é recebido pelo Tamaugachi, mas o atacante é perfurado em diversas partes do corpo e deve realizar um TR de CON 21; em caso de falha, fica Paralisado pelo veneno.'}
            ]
          }
        ];

// Confere a fórmula de PV do livro (N × X ÷ 2 + bônus) em todas as fichas.
// Chame no console: window.validarPVBestiario()
// ── Consulta por id ──────────────────────────────────────────────────────────
// O id foi adicionado justamente para a Cópia Perfeita (rm_e7) poder guardar uma
// referência estável à criatura. Nome não serve: renomear no livro quebraria o
// vínculo de todo Hatsu salvo que aponta para ela.
window.criaturaPorId = function (id) {
    if (!id) return null;
    return (window.BESTIARY_DATA || []).filter(function (m) { return m.id === id; })[0] || null;
};

// Criaturas agrupadas por categoria, para montar o <select> do picker.
window.bestiarioPorCategoria = function () {
    const out = {};
    (window.BESTIARY_DATA || []).forEach(function (m) {
        (out[m.cat || 'OUTROS'] = out[m.cat || 'OUTROS'] || []).push(m);
    });
    Object.keys(out).forEach(function (k) {
        out[k].sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt-BR'); });
    });
    return out;
};

window.validarPVBestiario = function () {
    const ruins = [];
    (window.BESTIARY_DATA || []).forEach(function (m) {
        const s = String(m.pv || '');
        const mt = s.match(/^\s*(\d+)/);
        const md = s.match(/\((\d+)d(\d+)\s*([+-]\s*\d+)?\)/);
        if (!mt || !md) return;
        const esperado = (parseInt(md[1]) * parseInt(md[2])) / 2
            + (md[3] ? parseInt(md[3].replace(/\s/g, '')) : 0);
        if (parseInt(mt[1]) !== esperado) {
            ruins.push({ id: m.id, nome: m.nome, pv: m.pv, esperado: esperado });
        }
    });
    if (!ruins.length) console.log('✓ PV: todas as ' + (window.BESTIARY_DATA || []).length + ' fichas fecham com N × X ÷ 2');
    else console.warn('✗ PV fora da fórmula:', ruins);
    return ruins;
};

// ── Alias "car" → "pre", para a mesa online ──────────────────────────────────
// A mesa (mesa/mesa.html) lê o sexto atributo das criaturas pela chave "car":
//
//     const BEST_ATR = [['for','FOR'], …, ['sab','SAB'], ['car','CAR']];
//
// mas o campo aqui sempre se chamou "pre" (Presença). Nenhuma das criaturas tem
// "car", então a célula CAR do painel do narrador aparecia vazia e o botão "Teste
// de CAR" rolava +0 para TODAS elas — bestMod(undefined) devolve 0.
//
// A mesa já sabe que CAR é PRE (ela pinta o botão com ATR_COR['PRE']); só a chave
// de leitura ficou para trás. O conserto definitivo é lá, mas a mesa é mantida
// à parte, então o espelho vai aqui: é aditivo, não mexe em "pre" e some sozinho
// no dia em que a mesa passar a ler a chave certa.
(function () {
    (window.BESTIARY_DATA || []).forEach(function (m) {
        if (m && m.car === undefined && m.pre !== undefined) m.car = m.pre;
    });
})();
