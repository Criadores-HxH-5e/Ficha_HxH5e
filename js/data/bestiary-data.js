        window.BESTIARY_DATA = [
          // ── PANTANO NUMELE / KUKAN'YU ──────────────────────────
          {
            nome:'Tartaruga Cabeça de Morango', tipo:'Besta Enorme, Neutro/Maligno', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'170 (10d12+5 por nível)', desl:'9m', reacoes:null,
            for:'26 (+8)',des:'6 (-2)',con:'20 (+5)',int:'7 (-2)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'Atletismo +11, Furtividade +1', trs:'For +11, Con +8, Sab +5',
            imunidades:'Agarrado, Derrubado, Impedido', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 12', lingua:'Nenhuma',
            tracos:[
              {n:'Favor da Neblina',d:'Criaturas a 1,5m sem teste de Percepção/Investigação são surpreendidas pelo Ataque Furtivo — confundindo o casco florido com pessoas na névoa.'},
              {n:'Monstro de Cerco',d:'Causa o dobro do dano a objetos e estruturas.'}
            ],
            acoes:[
              {n:'Mordida',d:'+11 para atingir, alcance 6m, 1 alvo. Dano: 14 (1d12+8) impacto. Alvo fica Agarrado (CD 20 FOR) e Impedido até escapar.'},
              {n:'Engolir',d:'Mordida contra alvo Grande ou menor Agarrado. Se acertar: engolido (cego, impedido, cobertura total), sofre 12 (2d12) esmagamento/turno. Se receber 35+ dano num turno: TR CON CD 20 ou regurgita.'}
            ]
          },
          {
            nome:'Sapopaciente', tipo:'Besta Enorme, Neutro', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'70 (5d12+2)', desl:'3m', reacoes:null,
            for:'10 (+0)',des:'15 (+2)',con:'16 (+3)',int:'10 (+0)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'Acrobacia +5, Furtividade +5, Percepção +5', trs:'Con +6',
            imunidades:'Agarrado, Derrubado', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 12', lingua:'Nenhuma',
            tracos:[
              {n:'Camuflagem Subterrânea',d:'Cava um buraco em 2 rodadas, abre a mandíbula em 180Â° alinhada ao terreno e dá um bote quando alvos entram na armadilha. Pode regurgitar detritos para disfarçar o terreno.'}
            ],
            acoes:[
              {n:'Bote Paciente',d:'Bote contra alvo Grande ou menor na armadilha ou a 1,5m: TR DES CD 22. Se atingir, engolido (cego, impedido, cobertura total), sofre 25 (5d10) ácido/turno. Se receber 20+ dano num turno: TR CON CD 15 ou regurgita.'}
            ]
          },
          {
            nome:'Macaco com Cara de Homem', tipo:'Besta Mágica Média, Caótico', cat:'BESTA MÁGICA',
            ca:'14 (Defesa Natural)', pv:'26 (3d10)', desl:'9m + 9m Escalada', reacoes:'4',
            for:'16 (+3)',des:'20 (+5)',con:'10 (+0)',int:'12 (+1)',sab:'14 (+2)',car:'16 (+3)',
            pericias:'Atletismo +6, Acrobacia +8, Furtividade +8', trs:'For +6, Car +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 14', lingua:'Comum',
            tracos:[
              {n:'Fingir de Morto',d:'Engana inimigos que causaram 15+ dano (a mais de 1,5m) ao cair convincentemente. Se mais próximo: teste de Enganação vs Intuição.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques: Mordida + Golpe desarmado, ou 2 Mordidas, ou 2 Golpes.'},
              {n:'Mordida',d:'+3 para acertar, 1,5m, 1 alvo. Dano: 6 (1d6+3) perfurante.'},
              {n:'Golpe Desarmado',d:'+3 para acertar, 1,5m, 1 alvo. Dano: 5 (1d4+3) impacto.'}
            ]
          },
          {
            nome:'Corvo Ventríloquo', tipo:'Besta Pequena, Caótico — Bando de 3', cat:'BESTA MÁGICA',
            ca:'12 (Defesa Natural)', pv:'17 (2d12+5)', desl:'9m de Voo', reacoes:'2',
            for:'2 (-4)',des:'19 (+5)',con:'10 (+0)',int:'10 (+0)',sab:'7 (-2)',car:'14 (+2)',
            pericias:'Acrobacia +8, Furtividade +8, Enganação +5', trs:'Des +8, Car +5',
            imunidades:'Caído', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m', lingua:'Comum',
            tracos:[
              {n:'Ventriloquismo Mímico',d:'Simula a voz de qualquer criatura que tenha ouvido. Se compreende o idioma, forma sentenças com eloquência.'},
              {n:'Evasão',d:'Manobra de fuga aérea: +2 na Reação de esquiva.'},
              {n:'Rasante',d:'Manobra de ataque aéreo: entra e sai da área sem receber AdO.'}
            ],
            acoes:[
              {n:'Bicada',d:'+5 para acertar, 1,5m, 1 alvo. Dano: 5 (1d4+5) perfurante.'}
            ]
          },
          {
            nome:'Borboleta Hipnótica', tipo:'Besta Mágica Miúda (enxame), Neutro — Bando de 3-5', cat:'BESTA MÁGICA',
            ca:'12 (Defesa Natural)', pv:'5 (1d4+3)', desl:'9m de Voo', reacoes:null,
            for:'2 (-4)',des:'14 (+2)',con:'9 (-1)',int:'6 (-2)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Furtividade +3, Enganação +6', trs:null,
            imunidades:'Caído, Amedrontado, Enfeitiçado', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m', lingua:'Nenhuma',
            tracos:[
              {n:'Pólem Fascinante',d:'Criatura que inicia/termina turno a 1,5m: TR CON CD 16 ou recebe Caído + Paralisado. Sai ao receber 5+ dano. Criaturas Cegas são imunes.'}
            ],
            acoes:[
              {n:'Padrão de Voo',d:'Efeito em área, 3m em círculo: TR CON CD 16. Área aumenta 1,5m para cada 2 borboletas adjacentes.'}
            ]
          },
          {
            nome:'Fungo Selvagem Claymore', tipo:'Planta Miúda, Neutro', cat:'BESTA NATURAL',
            ca:'10 (Defesa Natural)', pv:'12', desl:'—', reacoes:null,
            for:'—',des:'—',con:'—',int:'—',sab:'—',car:'—',
            pericias:null, trs:null, imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Risco Biológico',d:'Ao ser pisado, dispersa pólem venenoso no ar que atordoa e envenena alvos próximos.'}
            ],
            acoes:[
              {n:'Pólem Venenoso',d:'Efeito em área: TR CON CD 16, alcance 1,5m. Falha: envenenamento automático + 10 (2d8+2) veneno. Sucesso: novo TR CON CD 12 — falha: mesmo dano; sucesso: metade.'}
            ]
          },
          // ── RESERVA FLORESTAL DE VISCA ──────────────────────────
          {
            nome:'Porco Carimbador', tipo:'Besta Média, Maligno — Bandos de 6+', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural) / 19 (Ponto sensível)', pv:'31 (3d8+3 por nível)', desl:'9m', reacoes:null,
            for:'20 (+5)',des:'10 (+0)',con:'16 (+3)',int:'12 (+1)',sab:'14 (+2)',car:'16 (+3)',
            pericias:'Atletismo +8, Natureza +5, Percepção +5', trs:'For +8, Con +6',
            imunidades:null,
            resistencias:'Qualquer dano que não seja de aura fora do ponto sensível.',
            vulnerabilidades:'Ponto atrás do focinho entre os olhos e a testa: Crítico (19) e Mortal x4.',
            sentidos:'Faro Aguçado, Percepção Passiva 15', lingua:'Nenhuma',
            tracos:[],
            acoes:[
              {n:'Fucinho Carimbador',d:'+5 para acertar, 1,5m, 1 alvo. Dano: 8 (1d6+5).'},
              {n:'Investida',d:'Se mover 3m+ em linha reta antes de atingir: TR FOR CD 18 ou alvo cai no chão.'}
            ]
          },
          {
            nome:'Urso Negro de Grandes Chifres', tipo:'Besta Média/Grande, Maligno', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'39 (4d10+4 por nível)', desl:'9m', reacoes:'6',
            for:'22 (+6)',des:'12 (+1)',con:'18 (+4)',int:'9 (-1)',sab:'12 (+1)',car:'9 (-1)',
            pericias:'Atletismo +9, Sobrevivência +4', trs:'For +9, Con +7',
            imunidades:null,
            resistencias:'Dano cortante, perfurante e de impacto (Escudo Natural/Couro).',
            vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m', lingua:'Nenhuma',
            tracos:[
              {n:'Regeneração',d:'Recupera 10+4 (CON) de PV por rodada.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques: Chifres + Garras, ou 2 Garras.'},
              {n:'Chifres',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 8 (1d8+4).'},
              {n:'Garras',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 7 (1d6+4).'}
            ]
          },
          {
            nome:'Águia-Aranha', tipo:'Besta Mágica Grande, Neutro', cat:'BESTA MÁGICA',
            ca:'17 (Defesa Natural)', pv:'34 (4d12+1)', desl:'9m + 9m Voo', reacoes:null,
            for:'14 (+2)',des:'19 (+4)',con:'11 (+1)',int:'15 (+2)',sab:'18 (+4)',car:'8 (-1)',
            pericias:'Acrobacia +7, Furtividade +7, Intuição +7, Sobrevivência +7', trs:'Des +7, Sab +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 17', lingua:'Nenhuma',
            tracos:[
              {n:'Escalada Aracnídea',d:'Pode escalar superfícies difíceis, incluindo tetos, sem testes.'}
            ],
            acoes:[
              {n:'Teia (Recarrega 5-6)',d:'Ataque à distância com DES, alcance 9m/18m. Alvo fica Impedido. A Ação Bônus permite TR FOR CD 12 para romper. CA 10; 5 PV; vulner. fogo; imune concussão/veneno/psíquico.'},
              {n:'Garras de Rapina',d:'+5 para acertar, 1,5m, 1 alvo. Dano: 10 (2d6+4) cortante.'}
            ]
          },
          // ── ZABAN ──────────────────────────────────────────────
          {
            nome:'Kiriko', tipo:'Besta Mágica Média, Caótico/Neutro', cat:'BESTA MÁGICA',
            ca:'15 (Defesa Natural)', pv:'25 (3d8+1)', desl:'15m + 15m Voo', reacoes:'3',
            for:'18 (+4)',des:'18 (+4)',con:'1 (-5)',int:'15 (+2)',sab:'16 (+3)',car:'12 (+1)',
            pericias:'Atletismo +7, Acrobacia +7, Furtividade +7, Enganação +3, Sobrevivência +6', trs:'Sab +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 16', lingua:'Comum',
            tracos:[
              {n:'Metamorfo',d:'Transforma-se em qualquer humanoide que tenha tocado, imitando aparência, pensamentos superficiais, voz e roupas.'},
              {n:'Movimento Transflorestal',d:'Move-se entre árvores com saltos como se em terra firme.'},
              {n:'Movimento Alado',d:'Pode criar asas parciais, ganhando deslocamento aéreo de 15m.'}
            ],
            acoes:[
              {n:'Garras',d:'+4 para acertar, 1,5m. Dano: 5 (1d6+2) cortante.'},
              {n:'Golpe Desprevendo',d:'Em furtividade: +7 para acertar. Dano: 5 (1d8+4) cortante. Crítico 18+: risco de sangramento (TR CON CD 10 ou 1d8 sangramento por 1d4 turnos).'}
            ]
          },
          // ── ILHA ZEVIL ─────────────────────────────────────────
          {
            nome:'Borboleta Hemotrópica', tipo:'Besta Miúda (enxame), Neutra', cat:'BESTA NATURAL',
            ca:'10 (Defesa Natural)', pv:'1 (1d4-2)', desl:'6m de Voo', reacoes:null,
            for:'2 (-4)',des:'10 (+0)',con:'12 (+1)',int:'6 (-2)',sab:'10 (+0)',car:'9 (-1)',
            pericias:'Sobrevivência +3, Percepção +3', trs:'Con +4',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Olfato)', lingua:'Nenhuma',
            tracos:[
              {n:'Hemo-Nectose',d:'Atraída pelo cheiro de sangue. Persegue criatura ferida até que a ferida seja coberta, curada ou a criatura morra.'}
            ],
            acoes:[
              {n:'Sede de Sangue',d:'Enquanto houver ferida exposta: alimenta-se de 1d4+1 por turno e reduz o PV máximo do alvo até descanso curto.'}
            ]
          },
          {
            nome:'Besta Voadora Hexápode', tipo:'Besta Mágica Enorme, Maligno', cat:'BESTA MÁGICA',
            ca:'16 (Defesa Natural)', pv:'45 (4d12+5)', desl:'9m', reacoes:'2',
            for:'24 (+7)',des:'11 (+0)',con:'16 (+3)',int:'6 (-2)',sab:'7 (-1)',car:'16 (+3)',
            pericias:'Intimidação +6', trs:'For +10, Con +6',
            imunidades:'Amedrontado, Surdo', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Grito Aterrorizante',d:'Antes de atacar ou após Engolir: realiza grito/risada para amedrontar alvos do lado de fora.'}
            ],
            acoes:[
              {n:'Agarrão',d:'+10 para acertar, 1,5m, 2 alvos. Condição: Agarrado.'},
              {n:'Mordida',d:'Contra alvo Agarrado: +10 para acertar. Dano: 12 (1d10+7). Se dano superar 50% do PV total: alvo é Engolido (Impedido).'}
            ]
          },
          {
            nome:'Parasita Verme Sarapintado', tipo:'Besta Miúda Comum, Maligno — Enxame', cat:'BESTA NATURAL',
            ca:'11 (Defesa Natural)', pv:'5 (1d8+3)', desl:'1m', reacoes:null,
            for:'4 (-3)',des:'11 (+0)',con:'6 (-2)',int:'1 (-5)',sab:'12 (+1)',car:'4 (-3)',
            pericias:'Furtividade +3, Sobrevivência +2', trs:null,
            imunidades:'Amedrontado, Surdo, Cego, Caído', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Instinto Parasita',d:'Entra em orifícios abertos para se reproduzir dentro de uma criatura viva sempre que possível.'}
            ],
            acoes:[
              {n:'Envenenamento e Reprodução Passiva',d:'Após entrar no sistema: (1) Eclosão dos ovos em 24h — 70% de chance de morte (1d100). (2) Pode ser expelido com ingestão de 30 litros de álcool.'}
            ]
          },
          // ── JAPÃO / ILHA DA BALEIA ──────────────────────────────
          {
            nome:'Urso-Raposa', tipo:'Besta Média, Neutro', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural)', pv:'24 (3d8+1)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'15 (+2)',con:'12 (+1)',int:'10 (+0)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'Atletismo +7, Sobrevivência +5, Intimidação +3', trs:'For +7, Sab +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 9m, Percepção Passiva 14', lingua:'Nenhuma',
            tracos:[],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques: Mordida + Garras, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'+6 para acertar, 1,5m. Dano: 8 (1d8+4) perfurante.'},
              {n:'Garras',d:'+6 para acertar, 1,5m. Dano: 7 (1d6+4) cortante.'}
            ]
          },
          {
            nome:'Rei do Pântano', tipo:'Besta Grande/Enorme, Neutro', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural)', pv:'39 (3d12+6)', desl:'9m de Nado', reacoes:null,
            for:'20 (+5)',des:'12 (+1)',con:'24 (+7)',int:'6 (-2)',sab:'12 (+1)',car:'9 (+0)',
            pericias:'Atletismo +8, Sobrevivência +4', trs:'Con +10',
            imunidades:'Sangramento (Sistema Hemostático)', resistencias:'Cortante, Perfurante (Carapaça de Quitina)', vulnerabilidades:null,
            sentidos:'Visão às Cegas', lingua:'Nenhuma',
            tracos:[
              {n:'Corpo Adaptável - Carapaça de Quitina',d:'Resistente a dano cortante e perfurante.'},
              {n:'Corpo Adaptável - Sistema Hemostático',d:'Pouco fluxo sanguíneo; imune à condição de Sangramento.'}
            ],
            acoes:[
              {n:'Mordida',d:'+8 para atingir, 1,5m, 2 alvos. Dano: 10 (1d8+5) perfurante.'}
            ]
          },
          {
            nome:'Cobra Gigante de Três Cabeças', tipo:'Besta Grande/Enorme, Mau', cat:'BESTA NATURAL',
            ca:'17 (Defesa Natural)', pv:'50 (7d10+4)', desl:'9m Terrestre, Escalada e Nado', reacoes:null,
            for:'23 (+6)',des:'23 (+6)',con:'18 (+4)',int:'6 (-2)',sab:'12 (+1)',car:'7 (-2)',
            pericias:'Furtividade +9, Acrobacia +9, Sobrevivência +4, Enganação +1', trs:'Des +9, Con +7',
            imunidades:'Sangramento', resistencias:'Cortante, Perfurante (Carapaça)', vulnerabilidades:null,
            sentidos:'Visão às Cegas, Sentidos Aguçados (Olfato)', lingua:'Nenhuma',
            tracos:[],
            acoes:[
              {n:'Ataques Múltiplos',d:'Até 3 ataques: 3 Botes, 2 Botes + 1 Constritor, ou 1 Constritor + 1 Esmagamento.'},
              {n:'Bote (Mordida)',d:'+6 para atingir, 3m, 2 alvos. Dano: 10 (1d8+5) perfurante + TR CON CD 12 ou 1d6 veneno.'},
              {n:'Golpe Constritor',d:'+9 para atingir, 3m, 2 alvos. Dano: 8 (1d4+6) impacto + TR FOR CD 15 ou Impedido.'},
              {n:'Esmagamento',d:'+9 para atingir, 3m, 1 alvo. Dano: 10 (1d8+5) impacto. Alvo Agarrado/Impedido não precisa ser atacado — dano 1x/turno.'}
            ]
          },
          // ── GREED ISLAND ───────────────────────────────────────
          {
            nome:'Cavalo Bolha (Bubble Horse)', tipo:'Besta de NEN, Médio, Caótico/Neutro', cat:'BESTA DE NEN',
            ca:'15 (Defesa Natural)', pv:'15 (2d8+3)', desl:'9m', reacoes:null,
            for:'12 (+1)',des:'17 (+3)',con:'10 (+0)',int:'8 (-2)',sab:'8 (-2)',car:'8 (-2)',
            pericias:'Atletismo +4', trs:'Des +6',
            imunidades:'Manipulado/Enfeitiçado, Dano não causado por aura.',
            resistencias:null,
            vulnerabilidades:'Quando Agarrado, o Cavalo Bolha se desfaz.',
            sentidos:'Sentidos Aguçados (Visão e Audição)', lingua:'Nenhuma',
            tracos:[
              {n:'Fuga de Presa',d:'Pode Fugir ou Esquivar como Reação sem custo.'}
            ],
            acoes:[
              {n:'Sopro Explosivo',d:'+3 para acertar, 4,5m atingindo alvos com CA inferior ao acerto. Dano: 5 (1d4+3). Bolhas brancas estouram com aura; vermelhas com qualquer contato não-aura.'}
            ]
          },
          {
            nome:'Ciclope Gigante (Primeiro Gigante)', tipo:'Besta Mágica/Besta de NEN, Enorme/Imenso, Maligno', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'86 (6d20)', desl:'Terrestre padrão', reacoes:null,
            for:'26 (+8)',des:'4 (-3)',con:'28 (+9)',int:'2 (-4)',sab:'8 (+0)',car:'6 (-2)',
            pericias:'Atletismo +11, Intimidação (com FOR +11)', trs:'For +11, Con +12',
            imunidades:'Manipulado/Enfeitiçado, Dano não causado por aura.',
            resistencias:'Balístico, Cortante, Impacto, Explosivo ou Perfurante sem aura.',
            vulnerabilidades:'Ataques no único olho: Crítico x4.',
            sentidos:'Visão no Escuro 18m', lingua:'Comum',
            tracos:[
              {n:'Sopro Violento',d:'Criatura a 3m de um ataque: TR FOR ou DES CD 12 para não ser empurrada pelo vento da clava ou não cair com o ataque que destrói o solo.'}
            ],
            acoes:[
              {n:'Esmagamento',d:'+11 para acertar em área (3m), 2 alvos. Dano: 20 (3d8+8) impacto.'}
            ]
          },
          {
            nome:'Rato Rádio-Ativo', tipo:'Besta Mágica/Besta de NEN, Miúdo, Caótico', cat:'BESTA DE NEN',
            ca:'10 (Defesa Natural)', pv:'5 (1d4+1)', desl:'Terrestre padrão', reacoes:null,
            for:'1 (-5)',des:'15 (+2)',con:'7 (-2)',int:'26 (+8)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Arcanismo +11, Furtividade +5, Intuição +5', trs:'Des +5, Int +11',
            imunidades:null, resistencias:null,
            vulnerabilidades:'Golpes de Impacto.',
            sentidos:'Visão Verdadeira', lingua:'Nenhuma',
            tracos:[
              {n:'Titereiro',d:'Manipula um constructo (CA 12; 150 PV; 9m; Imune a ataques sem aura; Resist. a ataques com aura) que ataca enquanto sob controle.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos (Constructo)',d:'2 ataques por turno.'},
              {n:'Golpe de Espada',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 7 (1d6+3) cortante.'},
              {n:'Golpe Desarmado',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 7 (1d6+3) impacto.'}
            ]
          },
          {
            nome:'Lagarto Melanino', tipo:'Besta Mágica/Besta de NEN, Enorme/Imenso, Maligno', cat:'BESTA DE NEN',
            ca:'18 (Defesa Natural)', pv:'148 (7d20+12)', desl:'9m', reacoes:null,
            for:'24 (+7)',des:'12 (+1)',con:'15 (+2)',int:'10 (+0)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'Percepção +5', trs:'For +10, Con +5',
            imunidades:null,
            resistencias:'Balístico, Cortante, Impacto, Explosivo, Perfurante sem aura.',
            vulnerabilidades:'Ataques na moleira (oculta entre as manchas, Invest./Percepção CD 25): Crítico x4.',
            sentidos:'Percepção Passiva 15', lingua:'Nenhuma',
            tracos:[{n:'Tração Animal',d:'Capacidade de Carga dobrada.'}],
            acoes:[
              {n:'Mordida Asfixiante',d:'+10 para atingir, 6m, 1 alvo. Dano: 11 (1d8+7) esmagamento (língua). Alvo fica Agarrado (CD 20 FOR) e Impedido.'},
              {n:'Engolir',d:'Mordida contra alvo Grande ou menor Agarrado. Se acertar: engolido (cego, impedido, cobertura total), sofre 9 (3d6) esmagamento/turno. Se receber 20+ dano num turno: TR CON CD 15 ou regurgita.'}
            ]
          },
          {
            nome:'Hyper Puffball', tipo:'Besta Mágica/Besta de NEN, Médio, Caótico/Neutro', cat:'BESTA DE NEN',
            ca:'23 (Armadura Natural)', pv:'18 (3d8+2)', desl:'15m', reacoes:'10',
            for:'7 (-2)',des:'30 (+10)',con:'16 (+3)',int:'12 (+1)',sab:'18 (+3)',car:'10 (+0)',
            pericias:'Acrobacia +13, Intuição +6, Percepção +6, Sobrevivência +6', trs:'Des +13, Con +6, Sab +6',
            imunidades:'Ataques de Oportunidade.',
            resistencias:'Impacto.',
            vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Visão e Audição)', lingua:'Nenhuma',
            tracos:[
              {n:'Investida Supersônica',d:'Para cada 3m de movimento gasto pode realizar 1 ataque extra gastando 1 Reação. Imune a AdO ao sair de alcance no próprio turno. Cada ataque extra faz perder 1 PV.'}
            ],
            acoes:[
              {n:'Cabeçada PowerPuff',d:'+13 para acertar, 1,5m, 1 alvo. Dano: 13 (1d6+10) impacto.'}
            ]
          },
          {
            nome:'Lobos de Matilha', tipo:'Besta Mágica/Besta de NEN, Médio, Maligno — Grupo de 3+', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'26 (4d8)', desl:'9m', reacoes:'4',
            for:'15 (+2)',des:'13 (+1)',con:'14 (+2)',int:'10 (+0)',sab:'11 (+0)',car:'10 (+0)',
            pericias:'Furtividade +4, Percepção +3, Intimidação +3', trs:'For +5, Car +3',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Audição e Olfato)', lingua:'Comum',
            tracos:[
              {n:'Tática de Matilha',d:'Aliado lutando contra o mesmo inimigo a 1,5m (no campo de visão do lobo) recebe vantagem nos ataques.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques: Garras + Mordida, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'+2 para acertar, 1,5m. Dano: 5 (1d6+2) perfurante.'},
              {n:'Garras',d:'+2 para acertar, 1,5m. Dano: 7 (1d6+2) cortante.'}
            ]
          },
          {
            nome:'Alfa de Matilha', tipo:'Besta Mágica/Besta de NEN, Médio, Maligno', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'35 (5d8+4)', desl:'9m', reacoes:'8',
            for:'18 (+4)',des:'14 (+2)',con:'18 (+4)',int:'14 (+2)',sab:'12 (+1)',car:'10 (+0)',
            pericias:'Atletismo +7, Furtividade +5, Percepção +4, Intimidação +3', trs:'For +5, Des +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos Aguçados (Audição e Olfato)', lingua:'Comum',
            tracos:[
              {n:'Comando da Matilha',d:'Como Reação, comanda um aliado para se mover em alguma direção durante o turno do aliado, antes ou depois de atacar.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques: Garras + Mordida, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'+4 para acertar, 1,5m. Dano: 7 (1d6+4) perfurante.'},
              {n:'Garras',d:'+4 para acertar, 1,5m. Dano: 10 (1d6+4) cortante.'},
              {n:'Investida (Bote)',d:'Mover 6m+ em linha reta antes das Garras: TR FOR CD 15 ou alvo cai. Alvo caído: pode fazer Mordida adicional no mesmo turno.'}
            ]
          },
          {
            nome:'Panda Doméstico', tipo:'Besta Mágica/Besta de NEN, Médio, Heróico/Neutro', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'26 (4d6+2 por nível)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'10 (+0)',con:'14 (+2)',int:'18 (+4)',sab:'15 (+2)',car:'17 (+3)',
            pericias:'História +7, Religião +7, Intuição +5, Lidar com Animais +5, Percepção +5, Persuasão +6', trs:'Int +7, Sab +5, Car +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Comum',
            tracos:[
              {n:'Proatividade',d:'Pode buscar algo de interesse de um aliado realizando um teste de Intuição após conversa simples.'}
            ],
            acoes:[
              {n:'Mordida',d:'+3 para acertar, 1,5m. Dano: 7 (2d4+3).'}
            ]
          },
          {
            nome:'Toraemon', tipo:'Besta Mágica/Besta de NEN, Médio, Caótico/Neutro', cat:'BESTA DE NEN',
            ca:'15 (Defesa Natural)', pv:'15 (2d8+3)', desl:'Terrestre padrão', reacoes:null,
            for:'12 (+1)',des:'10 (+0)',con:'17 (+3)',int:'18 (+4)',sab:'10 (+0)',car:'16 (+3)',
            pericias:'Arcanismo +7, História +7, Intuição +7, Investigação +7, Percepção +3, Persuasão +6', trs:'Int +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 13', lingua:'Comum',
            tracos:[
              {n:'Bolso 4-D',d:'Armazena itens infinitos no bolso frontal, desde que parte do item caiba nele.'}
            ],
            acoes:[
              {n:'Garras',d:'+3 para acertar, 1,5m. Dano: 5 (1d6+3) cortante.'}
            ]
          },
          // ── OUTROS ─────────────────────────────────────────────
          {
            nome:'Pássaro di Nybdi', tipo:'Besta Enorme, Neutro', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'30 (3d12+5)', desl:'9m + 9m Voo', reacoes:'2',
            for:'18 (+4)',des:'12 (+1)',con:'20 (+5)',int:'12 (+1)',sab:'14 (+2)',car:'11 (+0)',
            pericias:'Sobrevivência +5', trs:'Con +8, Sab +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhum',
            tracos:[
              {n:'Tração Animal',d:'Capacidade de Carga/Salto dobrada.'},
              {n:'Evasão',d:'Manobra de fuga aérea: +2 na Reação de esquiva.'}
            ],
            acoes:[
              {n:'Heavy Dive',d:'+4 para acertar (+4 para cada 3m em queda), 3m, todos no alcance. Dano: 5 (1d6+2) + 2 graus por 3m de queda.'}
            ]
          },
          {
            nome:'Tigre Acampador', tipo:'Besta Média, Maligno', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'52 (10d8+2)', desl:'9m', reacoes:'4',
            for:'28 (+9)',des:'19 (+5)',con:'14 (+2)',int:'10 (+0)',sab:'16 (+3)',car:'17 (+3)',
            pericias:'Atletismo +12, Sobrevivência +6, Lidar com Animais +6, Intimidação +6', trs:'For +12, Des +8',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m, Percepção Passiva 16', lingua:'Nenhum',
            tracos:[
              {n:'Tática de Matilha',d:'Vantagem nas jogadas de ataque contra uma criatura se pelo menos 1 aliado estiver a 1,5m dela e não incapacitado.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques: Chifre + Garras, ou 2 Garras.'},
              {n:'Chifre Empalador',d:'+9 para acertar, 1,5m. Dano: 15 (1d8+9). Se mover 3m+ antes: TR FOR CD 19 ou empalado (Agarrado/Preso/Enredado — apenas 1 alvo por vez).'},
              {n:'Garras',d:'+9 para acertar, 1,5m. Dano: 12 (1d6+9).'}
            ]
          },
          {
            nome:'Piko', tipo:'Besta Média/Grande, Neutra', cat:'BESTA NATURAL',
            ca:'12 (Defesa Natural)', pv:'15 (1d4+5)', desl:'12m', reacoes:null,
            for:'19 (+4)',des:'19 (+4)',con:'10 (+0)',int:'8 (-1)',sab:'12 (+1)',car:'10 (+0)',
            pericias:'Atletismo +7, Acrobacia +7', trs:'Des +7',
            imunidades:'Exaustão', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Compreende Comum, mas não fala',
            tracos:[
              {n:'Tração Animal',d:'Capacidade de Carga/Salto dobrada.'},
              {n:'Destreza Animal',d:'Vantagem em TRs de Destreza.'}
            ],
            acoes:[
              {n:'Bicada',d:'+4 para acertar, 1,5m. Dano: 7 (1d6+4).'}
            ]
          },
          {
            nome:'Mike', tipo:'Besta Enorme, Neutro', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'112 (10d12+3)', desl:'9m', reacoes:'4',
            for:'30 (+10)',des:'19 (+4)',con:'16 (+3)',int:'6 (-2)',sab:'22 (+6)',car:'18 (+4)',
            pericias:'Atletismo +13, Furtividade +7, Sobrevivência +9, Percepção +9, Intimidação +7', trs:'For +13, Des +7, Sab +9',
            imunidades:'Enfeitiçado/Manipulado Mentalmente', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro 18m', lingua:'Entende Comum, mas não fala',
            tracos:[
              {n:'Transe Subserviente',d:'Imune a manipulações mentais.'},
              {n:'Sentidos Aguçados',d:'Vantagem em Percepção/Investigação baseados em Visão, Audição e Olfato.'},
              {n:'Tração Animal',d:'Capacidade de Carga/Salto dobrada.'}
            ],
            acoes:[
              {n:'Patada Devastadora',d:'+13 para acertar, 3m, 3 alvos dentro do alcance. Dano: 22 (2d12+10) cortante.'}
            ]
          },
          // ── PLAYTEST / OUTRAS OBRAS ─────────────────────────────
          {
            nome:'Pumba Fuça-Suja', tipo:'Besta Comum Média, Maligno — Bando de 4', cat:'PLAYTEST',
            ca:'12 (Defesa Natural)', pv:'22 (3d12+2)', desl:'12m', reacoes:'4',
            for:'16 (+4)',des:'12 (+1)',con:'26 (+8)',int:'5 (-3)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Atletismo, Sobrevivência', trs:'Con, Car',
            imunidades:'Veneno e Envenenado', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Implacável (Recarrega após Descanso)',d:'Se sofrer 10 de dano ou menos que o reduziria a 0 PV, fica com 1 PV.'},
              {n:'Corpo Pútrido',d:'Criatura que finaliza turno adjacente: TR CON CD 18 ou fica Envenenada até se afastar 6m+.'}
            ],
            acoes:[
              {n:'Presas',d:'+5 para atingir, 1,5m, 1 alvo. Dano: 10 (2d6+3) cortante.'}
            ]
          },
          {
            nome:'Pássaro da Fé', tipo:'Besta Pequena, Caótico — Bando de 5', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'12 (1d12+5)', desl:'9m de Voo', reacoes:'3',
            for:'2 (-4)',des:'19 (+4)',con:'11 (+0)',int:'10 (+0)',sab:'18 (+4)',car:'9 (+0)',
            pericias:'Acrobacia +8, Furtividade +8, Intuição +7', trs:'Int +3, Sab +7, Des +8',
            imunidades:'Caído, Cego', resistencias:null, vulnerabilidades:null,
            sentidos:'Ecolocalização', lingua:'Nenhuma',
            tracos:[
              {n:'Voo Ofuscante',d:'Alvos em linha reta de até 6m: TR CON CD 15 ou ficam Cegos por 1d4+2 turnos.'},
              {n:'Voo Pseudo-Estático',d:'Imune a AdO ao sair do alcance de um alvo no próprio turno, se o alvo ficou Cego após a parada para atacar.'}
            ],
            acoes:[
              {n:'Bicada',d:'+5 para acertar, 1,5m. Dano: 5 (1d4+5) perfurante.'},
              {n:'Evasão',d:'Manobra de fuga aérea: +2 na Reação de esquiva.'}
            ]
          },
          {
            nome:'Leãozinho da Inxia', tipo:'Besta Comum Média, Neutra', cat:'PLAYTEST',
            ca:'14 (Defesa Natural)', pv:'25 (3d10+4)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'17 (+3)',con:'14 (+2)',int:'10 (+0)',sab:'12 (+1)',car:'14 (+2)',
            pericias:'Atletismo +7, Furtividade +6, Esquiva +6, Sobrevivência +4', trs:'For +7, Des +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Olfato', lingua:'Nenhuma',
            tracos:[
              {n:'Presas Perigosas',d:'Herbívoro e normalmente passivo. Se defende com força surpreendente para seu porte. Reproduz-se rapidamente.'}
            ],
            acoes:[
              {n:'Mordida Defensiva',d:'+4 para acertar, 1,5m. Dano: 8 (1d8+4) perfurante.'}
            ]
          },
          {
            nome:'Mariposa Poodle', tipo:'Besta Mágica Média, Neutra', cat:'PLAYTEST',
            ca:'16 (Defesa Natural)', pv:'15 (2d6+3)', desl:'6m de Voo', reacoes:null,
            for:'1 (-5)',des:'19 (+4)',con:'6 (-2)',int:'8 (-1)',sab:'11 (+0)',car:'9 (-1)',
            pericias:'Acrobacia +7, Furtividade +7', trs:'Des +7',
            imunidades:'Caído', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Beleza Pútrida',d:'Alimentam-se de frutas podres. Não são hostis.'}
            ],
            acoes:[
              {n:'Furtividade Simulada',d:'Pode se ocultar fazendo seu pelo crescer e simulando uma bola de algodão.'}
            ]
          },
          {
            nome:'Zebralo', tipo:'Besta Comum Média, Neutra', cat:'PLAYTEST',
            ca:'16 (Defesa Natural)', pv:'40 (5dx)', desl:'15m', reacoes:null,
            for:'22 (+6)',des:'16 (+3)',con:'15 (+2)',int:'10 (+0)',sab:'13 (+1)',car:'10 (+0)',
            pericias:'Atletismo +9, Sobrevivência +4', trs:'For +9, Con +5, Sab +4',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[{n:'Tração Animal',d:'Capacidade de Carga dobrada.'}],
            acoes:[
              {n:'Coice',d:'+9 para acertar, 1,5m. Dano: 12 (1d12+6) impacto, Mortal x3.'}
            ]
          },
          {
            nome:'Thri-Kreen', tipo:'Besta Mágica Média, Neutra — Montarias Desérticas', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'33 (6d8+6)', desl:'12m (Salto Parado 6m)', reacoes:'4',
            for:'12 (+1)',des:'15 (+2)',con:'13 (+1)',int:'8 (-1)',sab:'12 (+1)',car:'7 (-2)',
            pericias:'Furtividade +5, Percepção +4, Sobrevivência +4', trs:null,
            imunidades:'Sangramento',
            resistencias:null,
            vulnerabilidades:'Impacto (Concussão).',
            sentidos:'Visão no Escuro', lingua:'Thri-Kreen',
            tracos:[
              {n:'Corpo Frágil',d:'Vulnerabilidade a dano de impacto.'},
              {n:'Sistema Hemostático',d:'Imune à condição Sangramento.'},
              {n:'4 Patas Braquiais',d:'Pode segurar duas armas de duas mãos ao mesmo tempo.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques: Garras/Mordida + Arma, ou 2 do mesmo tipo.'},
              {n:'Garras',d:'+3 para acertar, 1,5m. Dano: 6 (2d4+1) cortante.'},
              {n:'Mordida',d:'+3 para acertar, 1,5m. Dano: 6 (2d4+1) perfurante + TR CON CD 11: falha = Envenenado 1min; falha por 5+ = Paralisado.'},
              {n:'Gythka',d:'+3 para acertar, 1,5m. Dano: 6 (1d8+1) perfurante.'},
              {n:'Chathka',d:'+4 para acertar, 9m. Dano: 6 (1d6+2) cortante.'}
            ]
          },
          {
            nome:'Boitatá Adulto', tipo:'Besta Mágica Enorme, Caótico/Maligno', cat:'PLAYTEST',
            ca:'19 (Armadura Natural)', pv:'150 (5d20×3)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'20 (+5)',con:'18 (+4)',int:'14 (+2)',sab:'11 (+0)',car:'7 (-2)',
            pericias:'Acrobacia +8, Lidar com Animais +3, Intimidação +1, Percepção +3', trs:'For +3, Des +8, Con +7',
            imunidades:'Fogo', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 13', lingua:'Nenhuma',
            tracos:[
              {n:'Presença Perigosa (Calor)',d:'Ao entrar no alcance (3m): TR CON CD 18 ou recebe 1d12 fogo. No início de cada turno dos alvos enquanto no alcance: repete o teste. Passar 1 vez = imune por um dia.'},
              {n:'Rastro de Fogo',d:'Deixa mancha de fogo no chão. Passar pelo rastro: 1d4 fogo. Terminar turno no rastro: +1d6 fogo.'}
            ],
            acoes:[
              {n:'Mordida',d:'+3 para acertar, 3m, 2 alvos. Dano: 7 (1d8+3) perfurante + TR CON CD 20: falha = +1d12 fogo.'}
            ]
          },
          {
            nome:'Boitatá Jovem', tipo:'Besta Mágica Enorme, Caótico/Maligno', cat:'PLAYTEST',
            ca:'19 (Armadura Natural)', pv:'60 (3d20×2)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'20 (+5)',con:'14 (+2)',int:'12 (+2)',sab:'11 (+0)',car:'7 (-2)',
            pericias:'Acrobacia +8, Lidar com Animais +3, Intimidação +1, Percepção +3', trs:'For +3, Des +8, Con +7',
            imunidades:'Fogo', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 13', lingua:'Nenhuma',
            tracos:[
              {n:'Presença Perigosa (Calor)',d:'Ao entrar no alcance (3m): TR CON CD 18 ou recebe 1d12 fogo. Passar 1 vez = imune por um dia.'},
              {n:'Rastro de Fogo',d:'Deixa mancha de fogo. Passar: 1d4 fogo. Terminar turno: +1d6 fogo.'}
            ],
            acoes:[
              {n:'Mordida',d:'+3 para acertar, 3m, 2 alvos. Dano: 7 (1d8+3) perfurante + TR CON CD 20: falha = +1d12 fogo.'}
            ]
          },
          {
            nome:'Canibal Hitoku', tipo:'Besta Mágica Média, Caótico — Rank C+', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'50 (5d12)', desl:'9m', reacoes:null,
            for:'14 (+2)',des:'14 (+2)',con:'18 (+4)',int:'10 (+0)',sab:'20 (+5)',car:'16 (+3)',
            pericias:'Percepção +7, Furtividade +4, Intimidação +5', trs:'Con +6, Sab +7',
            imunidades:'Derrubado',
            resistencias:null,
            vulnerabilidades:'Qualquer ataque de uma criatura que não tenha sido copiada: dano dobrado.',
            sentidos:'Visão no Escuro 18m', lingua:'A do copiado',
            tracos:[
              {n:'Cópia Perfeita',d:'Observa alvo por 1 turno e assume sua forma completa (atributos, habilidades, metade do dano). Não pode trocar de cópia até derrotar o copiado.'}
            ],
            acoes:[
              {n:'Garra (sem cópia)',d:'+2 para acertar, 1,5m. Dano: 1d10+2 cortante.'},
              {n:'Cópia',d:'Usa qualquer habilidade da ficha do inimigo copiado, incluindo hatsu.'}
            ]
          },
          {
            nome:'Lefyurgo', tipo:'Aberração Média, Maligno', cat:'ABERRAÇÃO',
            ca:'18 (Defesa Natural)', pv:'26 (3d10+1)', desl:'9m', reacoes:'8',
            for:'18 (+4)',des:'13 (+1)',con:'17 (+3)',int:'18 (+4)',sab:'18 (+4)',car:'22 (+6)',
            pericias:'+7 Atletismo, Investigação, Sobrevivência, Intuição, Percepção; +9 Intimidação', trs:'For +7, Car +7',
            imunidades:'Agarrado/Preso/Enredado, Impedido', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro, Percepção Passiva 17', lingua:'Comum',
            tracos:[
              {n:'Corpo Adaptável',d:'Como Reação ou ação livre: transforma membros e órgãos para outros locais ou cria novos. Role 1d100: 50% de chance de receber 1 nível de Exaustão.'},
              {n:'Sentidos Aguçados',d:'Vantagem em Percepção/Investigação baseados em Visão.'}
            ],
            acoes:[
              {n:'Mordida',d:'+6 para acertar, 1,5m. Dano: 7 (1d6+4) perfurante + 5 (1d4+3) necrótico.'},
              {n:'Sinergia Morfológica',d:'Após 10 de dano Necrótico total no mesmo alvo: adapta sistema ao sangue desse alvo; próximos ataques recuperam PV = dano Necrótico causado.'}
            ]
          },
          // ── MADE IN ABYSS ───────────────────────────────────────
          {
            nome:'Amakagame', tipo:'Aberração Imenso/Colossal, Neutro', cat:'ABERRAÇÃO',
            ca:'12 (Defesa Natural)', pv:'36 (6d10+4)', desl:'6m', reacoes:null,
            for:'5 (-3)',des:'5 (-3)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',car:'5 (-3)',
            pericias:'Sobrevivência +5, Percepção +5', trs:'Con +7',
            imunidades:'Veneno, Ácido',
            resistencias:'Impacto (Concussão).',
            vulnerabilidades:'Fogo, Cortante.',
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Corpo Malemolente',d:'Resistência a impacto pelo corpo menos rígido que engolfa contatos físicos.'},
              {n:'Corpo Fagomorfo',d:'Criatura que termina turno adjacente é englobada por sua membrana (atração que se estende a criaturas vivas).'},
              {n:'Digestão Passiva',d:'Criatura dentro do Amakagame: 3d6 ácido/turno. Deteriora objetos, armaduras e equipamentos (não dividido).'}
            ],
            acoes:[
              {n:'Extensão da Membrana Faminta',d:'Ao mover-se para o espaço de outra criatura: TR CON CD 21. Falha: 6d6 ácido (alvo + todos no local + equipamentos). Sucesso: metade (só usuário, não equipamentos). Imune por 24h após sucesso.'}
            ]
          },
          {
            nome:'Emperador Armorshell', tipo:'Besta Mágica Médio-Grande, Caótico/Maligno', cat:'BESTA MÁGICA',
            ca:'26 (Defesa Natural)', pv:'64 (5d12+8)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'1 (-5)',con:'27 (+8)',int:'10 (+0)',sab:'10 (+0)',car:'10 (+0)',
            pericias:'Atletismo +7, Sobrevivência +3', trs:'For +7, Con +11',
            imunidades:'Veneno, Fogo, Eletricidade, Psíquico',
            resistencias:'Impacto, Cortante, Perfurante (precisão DES).',
            vulnerabilidades:'Perfurante (impacto FOR), Balístico, Armas de Cerco.',
            sentidos:'Sísmico', lingua:'Desconhecida',
            tracos:[
              {n:'Criatura de Cerco',d:'Dano crítico em construções e Constructos.'},
              {n:'Tração Animal',d:'Capacidade de Carga dobrada.'},
              {n:'Aparência Falsa',d:'Pode passar despercebido como rocha contra Percepção Passiva < 15.'}
            ],
            acoes:[
              {n:'Investida Pesada',d:'+7 para acertar, 1,5m, 2 alvos. Dano: 12 (2d8+4).'},
              {n:'Cauda da Muralha Oportunista (Reação)',d:'Ao defender ataque com carapaça: realiza ataque de cauda livre. +7 para acertar, 1,5m, 1 alvo. Dano: 12 (2d8+4).'}
            ]
          },
          {
            nome:'Hidra do Deserto', tipo:'Aberração Médio/Médio Modificado, Maligno', cat:'ABERRAÇÃO',
            ca:'18 (Defesa Natural)', pv:'86 (8d8+21)', desl:'9m', reacoes:'12',
            for:'17 (+3)',des:'21 (+5)',con:'15 (+2)',int:'12 (+1)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Atletismo +6, Furtividade +8, Percepção +5', trs:'For +6, Des +8, Con +5',
            imunidades:'Sangramento',
            resistencias:'Cortante, Perfurante (Carapaça/Sistema Hemostático).',
            vulnerabilidades:'7 caudas sensíveis — ataques mirados com 10+ dano inutilizam a cauda.',
            sentidos:'Sísmico', lingua:'Desconhecida',
            tracos:[
              {n:'Arma Natural: Ferrões',d:'Ataque CaC com alcance (3m) e Finta (enquanto tiver 2+ caudas funcionais, sem gastar ação bônus).'}
            ],
            acoes:[
              {n:'Cauda com Ferrão',d:'+6 para acertar, 3m, 1 alvo. Dano: 6 (2d6). Cada ferrão seguinte no mesmo alvo aumenta progressivamente: 4d6→6d6→8d6→10d6→12d6→14d6.'}
            ]
          },
          {
            nome:'Fuzosheppu / Oogasumi', tipo:'Aberração Imenso/Colossal (mais leve que o ar), Neutro', cat:'ABERRAÇÃO',
            ca:'12 (Defesa Natural)', pv:'10 (1d12+4) Camada Externa / 36 (6d10+4) Núcleo', desl:'15m de Voo', reacoes:null,
            for:'5 (-3)',des:'5 (-3)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',car:'5 (-3)',
            pericias:'Natureza +4, Sobrevivência +5', trs:'Con +7',
            imunidades:'Agarrado/Cortante/Impacto/Perfurante/Balístico (camada externa)',
            resistencias:null,
            vulnerabilidades:'Fogo e Vento — separa a camada externa do núcleo.',
            sentidos:'Sentido Térmico', lingua:'Desconhecida',
            tracos:[
              {n:'Corpo Gasoso de Núcleo Sólido',d:'Vento/explosão de dispersão pode separar a camada externa do núcleo sólido.'},
              {n:'Licor Corrosivo',d:'Criatura dentro: 3d6 ácido/turno, deteriora equipamentos.'}
            ],
            acoes:[
              {n:'Disparo Corrosivo',d:'+4 para acertar, 9m, 3 alvos. Dano: 15 (2d10+5) ácido/corrosivo.'}
            ]
          },
          {
            nome:'Gogouge — Silkfang', tipo:'Besta Natural Enorme, Maligno — Próximo de Covil', cat:'BESTA NATURAL',
            ca:'17 (Defesa Natural)', pv:'127 (7d20+8)', desl:'16m', reacoes:'6',
            for:'18 (+4)',des:'22 (+6)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',car:'1 (+5)',
            pericias:'Atletismo +7, Intuição +5, Percepção +5, Sobrevivência +5', trs:'Des +9, Con +7, Sab +5',
            imunidades:'Veneno, Ácido', resistencias:null, vulnerabilidades:null,
            sentidos:'Visão no Escuro', lingua:'Desconhecida',
            tracos:[
              {n:'Disparo Peçonhento',d:'Dispara líquido ácido e pegajoso para limitar movimentos. TR FOR CD 18.'},
              {n:'Transe de Caça',d:'Enquanto focada em 1 alvo: pode atacá-lo duas vezes.'}
            ],
            acoes:[
              {n:'Disparo Peçonhento',d:'+8 para acertar, 9m, raio 3m (terreno difícil). Dano: 3 (1d6) ácido por turno que permanece na poça.'},
              {n:'Garras Cortantes',d:'+6 para acertar, 1 alvo. Dano: 12 (2d8+4) cortante.'}
            ]
          },
          {
            nome:'Hammerbeak (Bico de Martelo)', tipo:'Besta Mágica Média, Maligno', cat:'BESTA MÁGICA',
            ca:'16 (Defesa Natural)', pv:'38 (5d8+3)', desl:'12m de Voo', reacoes:'4',
            for:'17 (+3)',des:'18 (+4)',con:'17 (+3)',int:'12 (+1)',sab:'15 (+2)',car:'11 (+0)',
            pericias:'+7 Esquiva e Esquiva Acrobática; +5 Percepção e Sobrevivência', trs:'Con +7, Sab +5',
            imunidades:'Caído, Atordoado por som ou impacto', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção Passiva 17', lingua:'Bestial',
            tracos:[
              {n:'Arma Natural: Bico de Martelo',d:'Ataque CaC com FOR: 1d12+FOR dano de impacto.'},
              {n:'Rasante',d:'Mover 3m+ em voo: imune a AdO ao sair do alcance.'},
              {n:'Regeneração',d:'Recupera 1d8+3 PV por turno.'}
            ],
            acoes:[
              {n:'Bico de Martelo',d:'+6 para acertar, 1,5m. Dano: 9 (1d12+3) impacto.'},
              {n:'Martelo Voador (Rasante)',d:'+6 para acertar, 1,5m. Dano: 12 (1d12+6) impacto. Alvo Médio ou menor: TR FOR CD 16 ou arremessado 6m + 1d6 queda + Caído. Natural 20: TR CON CD 16 ou Atordoado.'}
            ]
          },
          {
            nome:'Hanashirama', tipo:'Aberração Miúda, Neutra — Colônia de 10', cat:'ABERRAÇÃO',
            ca:'22 (Defesa Natural)', pv:'2 (1d4-2)', desl:'9m de Nado', reacoes:'Ilimitadas (ao ser tocada ou mover)',
            for:'1 (-5)',des:'12 (+0)',con:'6 (-2)',int:'9 (-1)',sab:'12 (+1)',car:'1 (-5)',
            pericias:'Furtividade +3', trs:'Des +3, Sab +4',
            imunidades:'Envenenado',
            resistencias:null,
            vulnerabilidades:'Esmagamento.',
            sentidos:'Percepção às Cegas', lingua:'Desconhecida',
            tracos:[
              {n:'Peçonha',d:'Aplica Veneno/Corrosão no contato ou ataque.'}
            ],
            acoes:[
              {n:'Glândulas Discipadora (Reação)',d:'Ao ser tocada ou receber dano: 1,5m de jato de peçonha em 5d6 Veneno/Corrosão no atacante + TR CON CD 25 ou Envenenado. SHU protege objetos contra corrosão.'}
            ]
          },
          {
            nome:'Inbyos', tipo:'Monstruosidade Média, Mau — Bando de 3-5', cat:'MONSTRUOSIDADE',
            ca:'16 (Defesa Natural)', pv:'34 (6d6+2)', desl:'9m (18m Transflorestal)', reacoes:'4',
            for:'18 (+4)',des:'18 (+4)',con:'14 (+2)',int:'12 (+1)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Atletismo +7, Furtividade +7, Acrobacia +7, Percepção +5', trs:'For +7, Des +7',
            imunidades:null, resistencias:null,
            vulnerabilidades:'Luz.',
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Movimento Transflorestal',d:'Move-se entre árvores com saltos como em terra firme, com o dobro do deslocamento.'},
              {n:'Tática de Matilha',d:'Aliado a 1,5m de um inimigo do Inbyos (no campo de visão): recebe vantagem nos ataques.'}
            ],
            acoes:[
              {n:'Garras Firmes (IMOBILIZADOR)',d:'+7 para acertar, 1,5m. Com múltiplas garras: aplica condição Imobilizado.'},
              {n:'Mordida',d:'+7 para acertar, 1,5m. Dano: 8 (1d8+4).'}
            ]
          },
          {
            nome:'Kuongatari', tipo:'Besta Natural Miúdo, Neutro — Colônia de 10', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'5 (1d6+1) cada / 50 (colônia completa)', desl:'6m', reacoes:null,
            for:'7 (-2)',des:'16 (+3)',con:'12 (+1)',int:'6 (-2)',sab:'10 (+0)',car:'3 (-4)',
            pericias:'Natureza +3, Percepção +3', trs:'Con +4, Sab +3',
            imunidades:'Envenenado, Esmagamento, Impacto',
            resistencias:'Cortante.',
            vulnerabilidades:null,
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Arma Natural: Picada Carapeçonhenta',d:'Ataque CaC com FOR. Quando alvo cercado por 5+ da colônia: acerto automático.'}
            ],
            acoes:[
              {n:'Ataques Múltiplos',d:'2 ataques (Picada + Mordida) quando NÃO usa picada em colônia no turno.'},
              {n:'Picada Carapeçonhenta',d:'+1 para acertar, alvo "pousado". Dano: 3 (1d4+1) perfurante + Veneno paralisante: TR CON CD 20 ou Imobilizado. Para mover após efeito: TR FOR CD 20. Para curar: superar TR original.'},
              {n:'Mordida',d:'+1 para acertar, alvo pousado. Dano: 5 (2d4+1) perfurante.'}
            ]
          },
          {
            nome:'Madokajacks', tipo:'Besta Mágica Grande, Mau — Sozinho ou em Par', cat:'BESTA MÁGICA',
            ca:'21 (Defesa Natural) / 18 (Membrana das asas)', pv:'56 (5d12+3)', desl:'15m Voo / 9m Terrestre', reacoes:'6',
            for:'20 (+5)',des:'20 (+5)',con:'15 (+2)',int:'14 (+2)',sab:'17 (+3)',car:'10 (+0)',
            pericias:'Atletismo +8, Acrobacia +8, Intuição +5, Percepção +6', trs:'For +8, Des +8',
            imunidades:'Surdo',
            resistencias:null,
            vulnerabilidades:'Luz.',
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Evasão',d:'Manobra de fuga aérea: +2 na Reação de esquiva.'},
              {n:'Investida',d:'Requer 6m de deslocamento para aplicar condição.'},
              {n:'Rasante',d:'Ataque aéreo sem receber AdO.'}
            ],
            acoes:[
              {n:'Investida do Vendaval Rasante',d:'+8 para acertar, cone 4,5m. Sem dano — alvos empurrados 6m + TR FOR CD 18 ou Caídos.'},
              {n:'Mordida (contra Caídos)',d:'+8 para acertar, 3m, 2 alvos. Dano: 12x (2d8+5).'}
            ]
          },
          {
            nome:'Mandíbula Escarlate', tipo:'Besta Mágica Imenso/Colossal, Mau — Sozinho', cat:'BESTA MÁGICA',
            ca:'25 (Defesa Natural)', pv:'255 (8d20+10)', desl:'27m de Voo (planando)', reacoes:null,
            for:'30 (+10)',des:'18 (+4)',con:'30 (+10)',int:'10 (+0)',sab:'15 (+2)',car:'16 (+4)',
            pericias:'Atletismo +13, Intimidação +7', trs:'For +13, Con +13',
            imunidades:'Surdo, Assustado/Intimidado, Exausto', resistencias:null, vulnerabilidades:null,
            sentidos:'Percepção às Cegas', lingua:'Desconhecida',
            tracos:[
              {n:'Criatura de Cerco',d:'Dano crítico em construções e Constructos.'},
              {n:'Limiar de Dano',d:'Qualquer dano abaixo de 40 é insignificante contra esta criatura.'}
            ],
            acoes:[
              {n:'Mordida',d:'+13 para acertar, 3m, até 3 alvos. Dano: 20 (2d10+10) perfurante+cortante.'},
              {n:'Cauda',d:'+13 para acertar, 3m, até 3 alvos. Dano: 16 (2d6+10) impacto.'},
              {n:'Ataque de Cerco',d:'+13 para acertar construções/Constructos/ambientes naturais. Dano: 20 (2d10+10) impacto.'}
            ]
          },
          {
            nome:'Nakikabane (Corpse Weeper / Lamentador de Cadáver)', tipo:'Besta Mágica Médio Modificado, Caótico/Mal — Próximo de Colônias', cat:'BESTA MÁGICA',
            ca:'17 (Defesa Natural)', pv:'74 (10d10+24)', desl:'9m Terrestre / 21m Voo', reacoes:'6',
            for:'14 (+2)',des:'18 (+4)',con:'9 (-1)',int:'12 (+1)',sab:'18 (+4)',car:'7 (-2)',
            pericias:'Atletismo +5, Acrobacia +7, Intuição +7', trs:'For +5, Des +7, Sab +7',
            imunidades:'Assustado', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Mímico Sonoro',d:'Engana alvos simulando choro de feridos. Criaturas que nunca viram essa criatura não têm chance de duvidar. Criaturas sobreviventes são imunes.'},
              {n:'Emboscador',d:'Estratégia de emboscada concede dado máximo de dano adicional contra desavisados.'},
              {n:'Olhar Aterrorizante',d:'Olhar que provoca medo, paralisando alvos para facilitar o ataque.'}
            ],
            acoes:[
              {n:'Mordida',d:'+5 para acertar, 1,5m. Dano: 10 (2d8+2) perfurante.'},
              {n:'Garras',d:'+5 para acertar (Crítico 19), 1,5m. Dano: 10 (3d6+2) cortante.'},
              {n:'Olhar Aterrorizante',d:'Alvos no campo de visão em 18m: TR Sab CD 16 ou Amedrontados. Pode refazer o teste no fim do próprio turno.'}
            ]
          },
          {
            nome:'Dragão Turbinódio — Ryuusazai', tipo:'Besta Mágica Imenso/Colossal, Mau — Sozinho', cat:'BESTA MÁGICA',
            ca:'23 (Defesa Natural)', pv:'187 (9d20+30)', desl:'18m Terrestre', reacoes:null,
            for:'30 (+10)',des:'17 (+3)',con:'30 (+10)',int:'10 (+0)',sab:'26 (+8)',car:'10 (+0)',
            pericias:'Atletismo +13, Percepção +11', trs:'For +13, Sab +11',
            imunidades:'Assustado, Sangrando, Queimando, Atordoado', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Limiar de Dano',d:'Dano abaixo de 50 é insignificante.'},
              {n:'Cuspe Ácido',d:'Expele líquido ácido com dano corrosivo e necrótico. Recarrega 5-6 (1d6) no fim do turno.'}
            ],
            acoes:[
              {n:'Mordida',d:'+13 para acertar, 6m, 1 alvo. Dano: 22 (3d8+10) perfurante.'},
              {n:'Pisão/Patada',d:'+13 para acertar, 6m, 1 alvo. Dano: 22 (3d8+10) impacto+esmagamento. Local pisado vira terreno difícil.'},
              {n:'Cuspe Ácido',d:'+6 para acertar, 18m, 1 alvo. Dano: 30 (3d12+10).'}
            ]
          },
          {
            nome:'Tamaugachi', tipo:'Monstruosidade Médio Modificado, Mau — Sozinho', cat:'MONSTRUOSIDADE',
            ca:'18 (Defesa Natural)', pv:'86 (7d12+8)', desl:'12m', reacoes:'17',
            for:'28 (+9)',des:'24 (+7)',con:'30 (+10)',int:'7 (-2)',sab:'30 (+10)',car:'4 (-3)',
            pericias:'Atletismo +12, Acrobacia +10, Natureza +13, Percepção +13', trs:'Con +13, Sab +13',
            imunidades:'Cego, Surdo, Atordoado, Envenenado', resistencias:null,
            vulnerabilidades:'Intimidação com REN.',
            sentidos:'Visão às Cegas', lingua:'Desconhecida',
            tracos:[
              {n:'Arma Natural + Corpo Adaptado',d:'Espinhos venenosos que pode manipular para crescer em qualquer direção em até 1m, enquanto conectados ao corpo.'},
              {n:'Sensibilidade Energética',d:'Vê fluxo de aura: usuários de NEN sem ZETSU atacam em desvantagem. Intimidação com REN: vantagem para o atacante. Prevê movimentos, possibilitando ataques rápidos e reativos.'}
            ],
            acoes:[
              {n:'Ponta Venenoso',d:'+12 para acertar, 1,5m, todos os alvos adjacentes sem Zetsu. Dano: 19 (2d10+9) perfurante. Alvo perfurado: TR CON CD 25 ou local sofre 3d10+10 veneno + incapacita aquele membro (incha e se deforma). Novo teste ao fim do turno.'},
              {n:'Defesa Venenosa (Reação)',d:'Ao receber ataque: crescer espinhos. Atacante: TR DES CD 20. Reduz dano recebido em 50%. Se atacante falhar: ele pode ser perfurado em diversas partes + TR CON CD 25 ou Paralisado.'}
            ]
          }
        ];
