        window.BESTIARY_DATA = [
          // â”€â”€ PANTANO NUMELE / KUKAN'YU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Tartaruga CabeÃ§a de Morango', tipo:'Besta Enorme, Neutro/Maligno', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'170 (10d12+5 por nÃ­vel)', desl:'9m', reacoes:null,
            for:'26 (+8)',des:'6 (-2)',con:'20 (+5)',int:'7 (-2)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'Atletismo +11, Furtividade +1', trs:'For +11, Con +8, Sab +5',
            imunidades:'Agarrado, Derrubado, Impedido', resistencias:null, vulnerabilidades:null,
            sentidos:'PercepÃ§Ã£o Passiva 12', lingua:'Nenhuma',
            tracos:[
              {n:'Favor da Neblina',d:'Criaturas a 1,5m sem teste de PercepÃ§Ã£o/InvestigaÃ§Ã£o sÃ£o surpreendidas pelo Ataque Furtivo â€” confundindo o casco florido com pessoas na nÃ©voa.'},
              {n:'Monstro de Cerco',d:'Causa o dobro do dano a objetos e estruturas.'}
            ],
            acoes:[
              {n:'Mordida',d:'+11 para atingir, alcance 6m, 1 alvo. Dano: 14 (1d12+8) impacto. Alvo fica Agarrado (CD 20 FOR) e Impedido atÃ© escapar.'},
              {n:'Engolir',d:'Mordida contra alvo Grande ou menor Agarrado. Se acertar: engolido (cego, impedido, cobertura total), sofre 12 (2d12) esmagamento/turno. Se receber 35+ dano num turno: TR CON CD 20 ou regurgita.'}
            ]
          },
          {
            nome:'Sapopaciente', tipo:'Besta Enorme, Neutro', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'70 (5d12+2)', desl:'3m', reacoes:null,
            for:'10 (+0)',des:'15 (+2)',con:'16 (+3)',int:'10 (+0)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'Acrobacia +5, Furtividade +5, PercepÃ§Ã£o +5', trs:'Con +6',
            imunidades:'Agarrado, Derrubado', resistencias:null, vulnerabilidades:null,
            sentidos:'PercepÃ§Ã£o Passiva 12', lingua:'Nenhuma',
            tracos:[
              {n:'Camuflagem SubterrÃ¢nea',d:'Cava um buraco em 2 rodadas, abre a mandÃ­bula em 180Â° alinhada ao terreno e dÃ¡ um bote quando alvos entram na armadilha. Pode regurgitar detritos para disfarÃ§ar o terreno.'}
            ],
            acoes:[
              {n:'Bote Paciente',d:'Bote contra alvo Grande ou menor na armadilha ou a 1,5m: TR DES CD 22. Se atingir, engolido (cego, impedido, cobertura total), sofre 25 (5d10) Ã¡cido/turno. Se receber 20+ dano num turno: TR CON CD 15 ou regurgita.'}
            ]
          },
          {
            nome:'Macaco com Cara de Homem', tipo:'Besta MÃ¡gica MÃ©dia, CaÃ³tico', cat:'BESTA MÃGICA',
            ca:'14 (Defesa Natural)', pv:'26 (3d10)', desl:'9m + 9m Escalada', reacoes:'4',
            for:'16 (+3)',des:'20 (+5)',con:'10 (+0)',int:'12 (+1)',sab:'14 (+2)',car:'16 (+3)',
            pericias:'Atletismo +6, Acrobacia +8, Furtividade +8', trs:'For +6, Car +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m, PercepÃ§Ã£o Passiva 14', lingua:'Comum',
            tracos:[
              {n:'Fingir de Morto',d:'Engana inimigos que causaram 15+ dano (a mais de 1,5m) ao cair convincentemente. Se mais prÃ³ximo: teste de EnganaÃ§Ã£o vs IntuiÃ§Ã£o.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques: Mordida + Golpe desarmado, ou 2 Mordidas, ou 2 Golpes.'},
              {n:'Mordida',d:'+3 para acertar, 1,5m, 1 alvo. Dano: 6 (1d6+3) perfurante.'},
              {n:'Golpe Desarmado',d:'+3 para acertar, 1,5m, 1 alvo. Dano: 5 (1d4+3) impacto.'}
            ]
          },
          {
            nome:'Corvo VentrÃ­loquo', tipo:'Besta Pequena, CaÃ³tico â€” Bando de 3', cat:'BESTA MÃGICA',
            ca:'12 (Defesa Natural)', pv:'17 (2d12+5)', desl:'9m de Voo', reacoes:'2',
            for:'2 (-4)',des:'19 (+5)',con:'10 (+0)',int:'10 (+0)',sab:'7 (-2)',car:'14 (+2)',
            pericias:'Acrobacia +8, Furtividade +8, EnganaÃ§Ã£o +5', trs:'Des +8, Car +5',
            imunidades:'CaÃ­do', resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m', lingua:'Comum',
            tracos:[
              {n:'Ventriloquismo MÃ­mico',d:'Simula a voz de qualquer criatura que tenha ouvido. Se compreende o idioma, forma sentenÃ§as com eloquÃªncia.'},
              {n:'EvasÃ£o',d:'Manobra de fuga aÃ©rea: +2 na ReaÃ§Ã£o de esquiva.'},
              {n:'Rasante',d:'Manobra de ataque aÃ©reo: entra e sai da Ã¡rea sem receber AdO.'}
            ],
            acoes:[
              {n:'Bicada',d:'+5 para acertar, 1,5m, 1 alvo. Dano: 5 (1d4+5) perfurante.'}
            ]
          },
          {
            nome:'Borboleta HipnÃ³tica', tipo:'Besta MÃ¡gica MiÃºda (enxame), Neutro â€” Bando de 3-5', cat:'BESTA MÃGICA',
            ca:'12 (Defesa Natural)', pv:'5 (1d4+3)', desl:'9m de Voo', reacoes:null,
            for:'2 (-4)',des:'14 (+2)',con:'9 (-1)',int:'6 (-2)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Furtividade +3, EnganaÃ§Ã£o +6', trs:null,
            imunidades:'CaÃ­do, Amedrontado, EnfeitiÃ§ado', resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m', lingua:'Nenhuma',
            tracos:[
              {n:'PÃ³lem Fascinante',d:'Criatura que inicia/termina turno a 1,5m: TR CON CD 16 ou recebe CaÃ­do + Paralisado. Sai ao receber 5+ dano. Criaturas Cegas sÃ£o imunes.'}
            ],
            acoes:[
              {n:'PadrÃ£o de Voo',d:'Efeito em Ã¡rea, 3m em cÃ­rculo: TR CON CD 16. Ãrea aumenta 1,5m para cada 2 borboletas adjacentes.'}
            ]
          },
          {
            nome:'Fungo Selvagem Claymore', tipo:'Planta MiÃºda, Neutro', cat:'BESTA NATURAL',
            ca:'10 (Defesa Natural)', pv:'12', desl:'â€”', reacoes:null,
            for:'â€”',des:'â€”',con:'â€”',int:'â€”',sab:'â€”',car:'â€”',
            pericias:null, trs:null, imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Risco BiolÃ³gico',d:'Ao ser pisado, dispersa pÃ³lem venenoso no ar que atordoa e envenena alvos prÃ³ximos.'}
            ],
            acoes:[
              {n:'PÃ³lem Venenoso',d:'Efeito em Ã¡rea: TR CON CD 16, alcance 1,5m. Falha: envenenamento automÃ¡tico + 10 (2d8+2) veneno. Sucesso: novo TR CON CD 12 â€” falha: mesmo dano; sucesso: metade.'}
            ]
          },
          // â”€â”€ RESERVA FLORESTAL DE VISCA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Porco Carimbador', tipo:'Besta MÃ©dia, Maligno â€” Bandos de 6+', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural) / 19 (Ponto sensÃ­vel)', pv:'31 (3d8+3 por nÃ­vel)', desl:'9m', reacoes:null,
            for:'20 (+5)',des:'10 (+0)',con:'16 (+3)',int:'12 (+1)',sab:'14 (+2)',car:'16 (+3)',
            pericias:'Atletismo +8, Natureza +5, PercepÃ§Ã£o +5', trs:'For +8, Con +6',
            imunidades:null,
            resistencias:'Qualquer dano que nÃ£o seja de aura fora do ponto sensÃ­vel.',
            vulnerabilidades:'Ponto atrÃ¡s do focinho entre os olhos e a testa: CrÃ­tico (19) e Mortal x4.',
            sentidos:'Faro AguÃ§ado, PercepÃ§Ã£o Passiva 15', lingua:'Nenhuma',
            tracos:[],
            acoes:[
              {n:'Fucinho Carimbador',d:'+5 para acertar, 1,5m, 1 alvo. Dano: 8 (1d6+5).'},
              {n:'Investida',d:'Se mover 3m+ em linha reta antes de atingir: TR FOR CD 18 ou alvo cai no chÃ£o.'}
            ]
          },
          {
            nome:'Urso Negro de Grandes Chifres', tipo:'Besta MÃ©dia/Grande, Maligno', cat:'BESTA NATURAL',
            ca:'18 (Defesa Natural)', pv:'39 (4d10+4 por nÃ­vel)', desl:'9m', reacoes:'6',
            for:'22 (+6)',des:'12 (+1)',con:'18 (+4)',int:'9 (-1)',sab:'12 (+1)',car:'9 (-1)',
            pericias:'Atletismo +9, SobrevivÃªncia +4', trs:'For +9, Con +7',
            imunidades:null,
            resistencias:'Dano cortante, perfurante e de impacto (Escudo Natural/Couro).',
            vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m', lingua:'Nenhuma',
            tracos:[
              {n:'RegeneraÃ§Ã£o',d:'Recupera 10+4 (CON) de PV por rodada.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques: Chifres + Garras, ou 2 Garras.'},
              {n:'Chifres',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 8 (1d8+4).'},
              {n:'Garras',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 7 (1d6+4).'}
            ]
          },
          {
            nome:'Ãguia-Aranha', tipo:'Besta MÃ¡gica Grande, Neutro', cat:'BESTA MÃGICA',
            ca:'17 (Defesa Natural)', pv:'34 (4d12+1)', desl:'9m + 9m Voo', reacoes:null,
            for:'14 (+2)',des:'19 (+4)',con:'11 (+1)',int:'15 (+2)',sab:'18 (+4)',car:'8 (-1)',
            pericias:'Acrobacia +7, Furtividade +7, IntuiÃ§Ã£o +7, SobrevivÃªncia +7', trs:'Des +7, Sab +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m, PercepÃ§Ã£o Passiva 17', lingua:'Nenhuma',
            tracos:[
              {n:'Escalada AracnÃ­dea',d:'Pode escalar superfÃ­cies difÃ­ceis, incluindo tetos, sem testes.'}
            ],
            acoes:[
              {n:'Teia (Recarrega 5-6)',d:'Ataque Ã  distÃ¢ncia com DES, alcance 9m/18m. Alvo fica Impedido. A AÃ§Ã£o BÃ´nus permite TR FOR CD 12 para romper. CA 10; 5 PV; vulner. fogo; imune concussÃ£o/veneno/psÃ­quico.'},
              {n:'Garras de Rapina',d:'+5 para acertar, 1,5m, 1 alvo. Dano: 10 (2d6+4) cortante.'}
            ]
          },
          // â”€â”€ ZABAN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Kiriko', tipo:'Besta MÃ¡gica MÃ©dia, CaÃ³tico/Neutro', cat:'BESTA MÃGICA',
            ca:'15 (Defesa Natural)', pv:'25 (3d8+1)', desl:'15m + 15m Voo', reacoes:'3',
            for:'18 (+4)',des:'18 (+4)',con:'1 (-5)',int:'15 (+2)',sab:'16 (+3)',car:'12 (+1)',
            pericias:'Atletismo +7, Acrobacia +7, Furtividade +7, EnganaÃ§Ã£o +3, SobrevivÃªncia +6', trs:'Sab +6',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m, PercepÃ§Ã£o Passiva 16', lingua:'Comum',
            tracos:[
              {n:'Metamorfo',d:'Transforma-se em qualquer humanoide que tenha tocado, imitando aparÃªncia, pensamentos superficiais, voz e roupas.'},
              {n:'Movimento Transflorestal',d:'Move-se entre Ã¡rvores com saltos como se em terra firme.'},
              {n:'Movimento Alado',d:'Pode criar asas parciais, ganhando deslocamento aÃ©reo de 15m.'}
            ],
            acoes:[
              {n:'Garras',d:'+4 para acertar, 1,5m. Dano: 5 (1d6+2) cortante.'},
              {n:'Golpe Desprevendo',d:'Em furtividade: +7 para acertar. Dano: 5 (1d8+4) cortante. CrÃ­tico 18+: risco de sangramento (TR CON CD 10 ou 1d8 sangramento por 1d4 turnos).'}
            ]
          },
          // â”€â”€ ILHA ZEVIL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Borboleta HemotrÃ³pica', tipo:'Besta MiÃºda (enxame), Neutra', cat:'BESTA NATURAL',
            ca:'10 (Defesa Natural)', pv:'1 (1d4-2)', desl:'6m de Voo', reacoes:null,
            for:'2 (-4)',des:'10 (+0)',con:'12 (+1)',int:'6 (-2)',sab:'10 (+0)',car:'9 (-1)',
            pericias:'SobrevivÃªncia +3, PercepÃ§Ã£o +3', trs:'Con +4',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos AguÃ§ados (Olfato)', lingua:'Nenhuma',
            tracos:[
              {n:'Hemo-Nectose',d:'AtraÃ­da pelo cheiro de sangue. Persegue criatura ferida atÃ© que a ferida seja coberta, curada ou a criatura morra.'}
            ],
            acoes:[
              {n:'Sede de Sangue',d:'Enquanto houver ferida exposta: alimenta-se de 1d4+1 por turno e reduz o PV mÃ¡ximo do alvo atÃ© descanso curto.'}
            ]
          },
          {
            nome:'Besta Voadora HexÃ¡pode', tipo:'Besta MÃ¡gica Enorme, Maligno', cat:'BESTA MÃGICA',
            ca:'16 (Defesa Natural)', pv:'45 (4d12+5)', desl:'9m', reacoes:'2',
            for:'24 (+7)',des:'11 (+0)',con:'16 (+3)',int:'6 (-2)',sab:'7 (-1)',car:'16 (+3)',
            pericias:'IntimidaÃ§Ã£o +6', trs:'For +10, Con +6',
            imunidades:'Amedrontado, Surdo', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Grito Aterrorizante',d:'Antes de atacar ou apÃ³s Engolir: realiza grito/risada para amedrontar alvos do lado de fora.'}
            ],
            acoes:[
              {n:'AgarrÃ£o',d:'+10 para acertar, 1,5m, 2 alvos. CondiÃ§Ã£o: Agarrado.'},
              {n:'Mordida',d:'Contra alvo Agarrado: +10 para acertar. Dano: 12 (1d10+7). Se dano superar 50% do PV total: alvo Ã© Engolido (Impedido).'}
            ]
          },
          {
            nome:'Parasita Verme Sarapintado', tipo:'Besta MiÃºda Comum, Maligno â€” Enxame', cat:'BESTA NATURAL',
            ca:'11 (Defesa Natural)', pv:'5 (1d8+3)', desl:'1m', reacoes:null,
            for:'4 (-3)',des:'11 (+0)',con:'6 (-2)',int:'1 (-5)',sab:'12 (+1)',car:'4 (-3)',
            pericias:'Furtividade +3, SobrevivÃªncia +2', trs:null,
            imunidades:'Amedrontado, Surdo, Cego, CaÃ­do', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Instinto Parasita',d:'Entra em orifÃ­cios abertos para se reproduzir dentro de uma criatura viva sempre que possÃ­vel.'}
            ],
            acoes:[
              {n:'Envenenamento e ReproduÃ§Ã£o Passiva',d:'ApÃ³s entrar no sistema: (1) EclosÃ£o dos ovos em 24h â€” 70% de chance de morte (1d100). (2) Pode ser expelido com ingestÃ£o de 30 litros de Ã¡lcool.'}
            ]
          },
          // â”€â”€ JAPÃƒO / ILHA DA BALEIA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Urso-Raposa', tipo:'Besta MÃ©dia, Neutro', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural)', pv:'24 (3d8+1)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'15 (+2)',con:'12 (+1)',int:'10 (+0)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'Atletismo +7, SobrevivÃªncia +5, IntimidaÃ§Ã£o +3', trs:'For +7, Sab +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 9m, PercepÃ§Ã£o Passiva 14', lingua:'Nenhuma',
            tracos:[],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques: Mordida + Garras, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'+6 para acertar, 1,5m. Dano: 8 (1d8+4) perfurante.'},
              {n:'Garras',d:'+6 para acertar, 1,5m. Dano: 7 (1d6+4) cortante.'}
            ]
          },
          {
            nome:'Rei do PÃ¢ntano', tipo:'Besta Grande/Enorme, Neutro', cat:'BESTA NATURAL',
            ca:'16 (Defesa Natural)', pv:'39 (3d12+6)', desl:'9m de Nado', reacoes:null,
            for:'20 (+5)',des:'12 (+1)',con:'24 (+7)',int:'6 (-2)',sab:'12 (+1)',car:'9 (+0)',
            pericias:'Atletismo +8, SobrevivÃªncia +4', trs:'Con +10',
            imunidades:'Sangramento (Sistema HemostÃ¡tico)', resistencias:'Cortante, Perfurante (CarapaÃ§a de Quitina)', vulnerabilidades:null,
            sentidos:'VisÃ£o Ã s Cegas', lingua:'Nenhuma',
            tracos:[
              {n:'Corpo AdaptÃ¡vel - CarapaÃ§a de Quitina',d:'Resistente a dano cortante e perfurante.'},
              {n:'Corpo AdaptÃ¡vel - Sistema HemostÃ¡tico',d:'Pouco fluxo sanguÃ­neo; imune Ã  condiÃ§Ã£o de Sangramento.'}
            ],
            acoes:[
              {n:'Mordida',d:'+8 para atingir, 1,5m, 2 alvos. Dano: 10 (1d8+5) perfurante.'}
            ]
          },
          {
            nome:'Cobra Gigante de TrÃªs CabeÃ§as', tipo:'Besta Grande/Enorme, Mau', cat:'BESTA NATURAL',
            ca:'17 (Defesa Natural)', pv:'50 (7d10+4)', desl:'9m Terrestre, Escalada e Nado', reacoes:null,
            for:'23 (+6)',des:'23 (+6)',con:'18 (+4)',int:'6 (-2)',sab:'12 (+1)',car:'7 (-2)',
            pericias:'Furtividade +9, Acrobacia +9, SobrevivÃªncia +4, EnganaÃ§Ã£o +1', trs:'Des +9, Con +7',
            imunidades:'Sangramento', resistencias:'Cortante, Perfurante (CarapaÃ§a)', vulnerabilidades:null,
            sentidos:'VisÃ£o Ã s Cegas, Sentidos AguÃ§ados (Olfato)', lingua:'Nenhuma',
            tracos:[],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'AtÃ© 3 ataques: 3 Botes, 2 Botes + 1 Constritor, ou 1 Constritor + 1 Esmagamento.'},
              {n:'Bote (Mordida)',d:'+6 para atingir, 3m, 2 alvos. Dano: 10 (1d8+5) perfurante + TR CON CD 12 ou 1d6 veneno.'},
              {n:'Golpe Constritor',d:'+9 para atingir, 3m, 2 alvos. Dano: 8 (1d4+6) impacto + TR FOR CD 15 ou Impedido.'},
              {n:'Esmagamento',d:'+9 para atingir, 3m, 1 alvo. Dano: 10 (1d8+5) impacto. Alvo Agarrado/Impedido nÃ£o precisa ser atacado â€” dano 1x/turno.'}
            ]
          },
          // â”€â”€ GREED ISLAND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Cavalo Bolha (Bubble Horse)', tipo:'Besta de NEN, MÃ©dio, CaÃ³tico/Neutro', cat:'BESTA DE NEN',
            ca:'15 (Defesa Natural)', pv:'15 (2d8+3)', desl:'9m', reacoes:null,
            for:'12 (+1)',des:'17 (+3)',con:'10 (+0)',int:'8 (-2)',sab:'8 (-2)',car:'8 (-2)',
            pericias:'Atletismo +4', trs:'Des +6',
            imunidades:'Manipulado/EnfeitiÃ§ado, Dano nÃ£o causado por aura.',
            resistencias:null,
            vulnerabilidades:'Quando Agarrado, o Cavalo Bolha se desfaz.',
            sentidos:'Sentidos AguÃ§ados (VisÃ£o e AudiÃ§Ã£o)', lingua:'Nenhuma',
            tracos:[
              {n:'Fuga de Presa',d:'Pode Fugir ou Esquivar como ReaÃ§Ã£o sem custo.'}
            ],
            acoes:[
              {n:'Sopro Explosivo',d:'+3 para acertar, 4,5m atingindo alvos com CA inferior ao acerto. Dano: 5 (1d4+3). Bolhas brancas estouram com aura; vermelhas com qualquer contato nÃ£o-aura.'}
            ]
          },
          {
            nome:'Ciclope Gigante (Primeiro Gigante)', tipo:'Besta MÃ¡gica/Besta de NEN, Enorme/Imenso, Maligno', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'86 (6d20)', desl:'Terrestre padrÃ£o', reacoes:null,
            for:'26 (+8)',des:'4 (-3)',con:'28 (+9)',int:'2 (-4)',sab:'8 (+0)',car:'6 (-2)',
            pericias:'Atletismo +11, IntimidaÃ§Ã£o (com FOR +11)', trs:'For +11, Con +12',
            imunidades:'Manipulado/EnfeitiÃ§ado, Dano nÃ£o causado por aura.',
            resistencias:'BalÃ­stico, Cortante, Impacto, Explosivo ou Perfurante sem aura.',
            vulnerabilidades:'Ataques no Ãºnico olho: CrÃ­tico x4.',
            sentidos:'VisÃ£o no Escuro 18m', lingua:'Comum',
            tracos:[
              {n:'Sopro Violento',d:'Criatura a 3m de um ataque: TR FOR ou DES CD 12 para nÃ£o ser empurrada pelo vento da clava ou nÃ£o cair com o ataque que destrÃ³i o solo.'}
            ],
            acoes:[
              {n:'Esmagamento',d:'+11 para acertar em Ã¡rea (3m), 2 alvos. Dano: 20 (3d8+8) impacto.'}
            ]
          },
          {
            nome:'Rato RÃ¡dio-Ativo', tipo:'Besta MÃ¡gica/Besta de NEN, MiÃºdo, CaÃ³tico', cat:'BESTA DE NEN',
            ca:'10 (Defesa Natural)', pv:'5 (1d4+1)', desl:'Terrestre padrÃ£o', reacoes:null,
            for:'1 (-5)',des:'15 (+2)',con:'7 (-2)',int:'26 (+8)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Arcanismo +11, Furtividade +5, IntuiÃ§Ã£o +5', trs:'Des +5, Int +11',
            imunidades:null, resistencias:null,
            vulnerabilidades:'Golpes de Impacto.',
            sentidos:'VisÃ£o Verdadeira', lingua:'Nenhuma',
            tracos:[
              {n:'Titereiro',d:'Manipula um constructo (CA 12; 150 PV; 9m; Imune a ataques sem aura; Resist. a ataques com aura) que ataca enquanto sob controle.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos (Constructo)',d:'2 ataques por turno.'},
              {n:'Golpe de Espada',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 7 (1d6+3) cortante.'},
              {n:'Golpe Desarmado',d:'+6 para acertar, 1,5m, 1 alvo. Dano: 7 (1d6+3) impacto.'}
            ]
          },
          {
            nome:'Lagarto Melanino', tipo:'Besta MÃ¡gica/Besta de NEN, Enorme/Imenso, Maligno', cat:'BESTA DE NEN',
            ca:'18 (Defesa Natural)', pv:'148 (7d20+12)', desl:'9m', reacoes:null,
            for:'24 (+7)',des:'12 (+1)',con:'15 (+2)',int:'10 (+0)',sab:'14 (+2)',car:'10 (+0)',
            pericias:'PercepÃ§Ã£o +5', trs:'For +10, Con +5',
            imunidades:null,
            resistencias:'BalÃ­stico, Cortante, Impacto, Explosivo, Perfurante sem aura.',
            vulnerabilidades:'Ataques na moleira (oculta entre as manchas, Invest./PercepÃ§Ã£o CD 25): CrÃ­tico x4.',
            sentidos:'PercepÃ§Ã£o Passiva 15', lingua:'Nenhuma',
            tracos:[{n:'TraÃ§Ã£o Animal',d:'Capacidade de Carga dobrada.'}],
            acoes:[
              {n:'Mordida Asfixiante',d:'+10 para atingir, 6m, 1 alvo. Dano: 11 (1d8+7) esmagamento (lÃ­ngua). Alvo fica Agarrado (CD 20 FOR) e Impedido.'},
              {n:'Engolir',d:'Mordida contra alvo Grande ou menor Agarrado. Se acertar: engolido (cego, impedido, cobertura total), sofre 9 (3d6) esmagamento/turno. Se receber 20+ dano num turno: TR CON CD 15 ou regurgita.'}
            ]
          },
          {
            nome:'Hyper Puffball', tipo:'Besta MÃ¡gica/Besta de NEN, MÃ©dio, CaÃ³tico/Neutro', cat:'BESTA DE NEN',
            ca:'23 (Armadura Natural)', pv:'18 (3d8+2)', desl:'15m', reacoes:'10',
            for:'7 (-2)',des:'30 (+10)',con:'16 (+3)',int:'12 (+1)',sab:'18 (+3)',car:'10 (+0)',
            pericias:'Acrobacia +13, IntuiÃ§Ã£o +6, PercepÃ§Ã£o +6, SobrevivÃªncia +6', trs:'Des +13, Con +6, Sab +6',
            imunidades:'Ataques de Oportunidade.',
            resistencias:'Impacto.',
            vulnerabilidades:null,
            sentidos:'Sentidos AguÃ§ados (VisÃ£o e AudiÃ§Ã£o)', lingua:'Nenhuma',
            tracos:[
              {n:'Investida SupersÃ´nica',d:'Para cada 3m de movimento gasto pode realizar 1 ataque extra gastando 1 ReaÃ§Ã£o. Imune a AdO ao sair de alcance no prÃ³prio turno. Cada ataque extra faz perder 1 PV.'}
            ],
            acoes:[
              {n:'CabeÃ§ada PowerPuff',d:'+13 para acertar, 1,5m, 1 alvo. Dano: 13 (1d6+10) impacto.'}
            ]
          },
          {
            nome:'Lobos de Matilha', tipo:'Besta MÃ¡gica/Besta de NEN, MÃ©dio, Maligno â€” Grupo de 3+', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'26 (4d8)', desl:'9m', reacoes:'4',
            for:'15 (+2)',des:'13 (+1)',con:'14 (+2)',int:'10 (+0)',sab:'11 (+0)',car:'10 (+0)',
            pericias:'Furtividade +4, PercepÃ§Ã£o +3, IntimidaÃ§Ã£o +3', trs:'For +5, Car +3',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos AguÃ§ados (AudiÃ§Ã£o e Olfato)', lingua:'Comum',
            tracos:[
              {n:'TÃ¡tica de Matilha',d:'Aliado lutando contra o mesmo inimigo a 1,5m (no campo de visÃ£o do lobo) recebe vantagem nos ataques.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques: Garras + Mordida, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'+2 para acertar, 1,5m. Dano: 5 (1d6+2) perfurante.'},
              {n:'Garras',d:'+2 para acertar, 1,5m. Dano: 7 (1d6+2) cortante.'}
            ]
          },
          {
            nome:'Alfa de Matilha', tipo:'Besta MÃ¡gica/Besta de NEN, MÃ©dio, Maligno', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'35 (5d8+4)', desl:'9m', reacoes:'8',
            for:'18 (+4)',des:'14 (+2)',con:'18 (+4)',int:'14 (+2)',sab:'12 (+1)',car:'10 (+0)',
            pericias:'Atletismo +7, Furtividade +5, PercepÃ§Ã£o +4, IntimidaÃ§Ã£o +3', trs:'For +5, Des +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Sentidos AguÃ§ados (AudiÃ§Ã£o e Olfato)', lingua:'Comum',
            tracos:[
              {n:'Comando da Matilha',d:'Como ReaÃ§Ã£o, comanda um aliado para se mover em alguma direÃ§Ã£o durante o turno do aliado, antes ou depois de atacar.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques: Garras + Mordida, ou 2 do mesmo tipo.'},
              {n:'Mordida',d:'+4 para acertar, 1,5m. Dano: 7 (1d6+4) perfurante.'},
              {n:'Garras',d:'+4 para acertar, 1,5m. Dano: 10 (1d6+4) cortante.'},
              {n:'Investida (Bote)',d:'Mover 6m+ em linha reta antes das Garras: TR FOR CD 15 ou alvo cai. Alvo caÃ­do: pode fazer Mordida adicional no mesmo turno.'}
            ]
          },
          {
            nome:'Panda DomÃ©stico', tipo:'Besta MÃ¡gica/Besta de NEN, MÃ©dio, HerÃ³ico/Neutro', cat:'BESTA DE NEN',
            ca:'12 (Defesa Natural)', pv:'26 (4d6+2 por nÃ­vel)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'10 (+0)',con:'14 (+2)',int:'18 (+4)',sab:'15 (+2)',car:'17 (+3)',
            pericias:'HistÃ³ria +7, ReligiÃ£o +7, IntuiÃ§Ã£o +5, Lidar com Animais +5, PercepÃ§Ã£o +5, PersuasÃ£o +6', trs:'Int +7, Sab +5, Car +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Comum',
            tracos:[
              {n:'Proatividade',d:'Pode buscar algo de interesse de um aliado realizando um teste de IntuiÃ§Ã£o apÃ³s conversa simples.'}
            ],
            acoes:[
              {n:'Mordida',d:'+3 para acertar, 1,5m. Dano: 7 (2d4+3).'}
            ]
          },
          {
            nome:'Toraemon', tipo:'Besta MÃ¡gica/Besta de NEN, MÃ©dio, CaÃ³tico/Neutro', cat:'BESTA DE NEN',
            ca:'15 (Defesa Natural)', pv:'15 (2d8+3)', desl:'Terrestre padrÃ£o', reacoes:null,
            for:'12 (+1)',des:'10 (+0)',con:'17 (+3)',int:'18 (+4)',sab:'10 (+0)',car:'16 (+3)',
            pericias:'Arcanismo +7, HistÃ³ria +7, IntuiÃ§Ã£o +7, InvestigaÃ§Ã£o +7, PercepÃ§Ã£o +3, PersuasÃ£o +6', trs:'Int +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'PercepÃ§Ã£o Passiva 13', lingua:'Comum',
            tracos:[
              {n:'Bolso 4-D',d:'Armazena itens infinitos no bolso frontal, desde que parte do item caiba nele.'}
            ],
            acoes:[
              {n:'Garras',d:'+3 para acertar, 1,5m. Dano: 5 (1d6+3) cortante.'}
            ]
          },
          // â”€â”€ OUTROS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'PÃ¡ssaro di Nybdi', tipo:'Besta Enorme, Neutro', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'30 (3d12+5)', desl:'9m + 9m Voo', reacoes:'2',
            for:'18 (+4)',des:'12 (+1)',con:'20 (+5)',int:'12 (+1)',sab:'14 (+2)',car:'11 (+0)',
            pericias:'SobrevivÃªncia +5', trs:'Con +8, Sab +5',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhum',
            tracos:[
              {n:'TraÃ§Ã£o Animal',d:'Capacidade de Carga/Salto dobrada.'},
              {n:'EvasÃ£o',d:'Manobra de fuga aÃ©rea: +2 na ReaÃ§Ã£o de esquiva.'}
            ],
            acoes:[
              {n:'Heavy Dive',d:'+4 para acertar (+4 para cada 3m em queda), 3m, todos no alcance. Dano: 5 (1d6+2) + 2 graus por 3m de queda.'}
            ]
          },
          {
            nome:'Tigre Acampador', tipo:'Besta MÃ©dia, Maligno', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'52 (10d8+2)', desl:'9m', reacoes:'4',
            for:'28 (+9)',des:'19 (+5)',con:'14 (+2)',int:'10 (+0)',sab:'16 (+3)',car:'17 (+3)',
            pericias:'Atletismo +12, SobrevivÃªncia +6, Lidar com Animais +6, IntimidaÃ§Ã£o +6', trs:'For +12, Des +8',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m, PercepÃ§Ã£o Passiva 16', lingua:'Nenhum',
            tracos:[
              {n:'TÃ¡tica de Matilha',d:'Vantagem nas jogadas de ataque contra uma criatura se pelo menos 1 aliado estiver a 1,5m dela e nÃ£o incapacitado.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques: Chifre + Garras, ou 2 Garras.'},
              {n:'Chifre Empalador',d:'+9 para acertar, 1,5m. Dano: 15 (1d8+9). Se mover 3m+ antes: TR FOR CD 19 ou empalado (Agarrado/Preso/Enredado â€” apenas 1 alvo por vez).'},
              {n:'Garras',d:'+9 para acertar, 1,5m. Dano: 12 (1d6+9).'}
            ]
          },
          {
            nome:'Piko', tipo:'Besta MÃ©dia/Grande, Neutra', cat:'BESTA NATURAL',
            ca:'12 (Defesa Natural)', pv:'15 (1d4+5)', desl:'12m', reacoes:null,
            for:'19 (+4)',des:'19 (+4)',con:'10 (+0)',int:'8 (-1)',sab:'12 (+1)',car:'10 (+0)',
            pericias:'Atletismo +7, Acrobacia +7', trs:'Des +7',
            imunidades:'ExaustÃ£o', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Compreende Comum, mas nÃ£o fala',
            tracos:[
              {n:'TraÃ§Ã£o Animal',d:'Capacidade de Carga/Salto dobrada.'},
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
            pericias:'Atletismo +13, Furtividade +7, SobrevivÃªncia +9, PercepÃ§Ã£o +9, IntimidaÃ§Ã£o +7', trs:'For +13, Des +7, Sab +9',
            imunidades:'EnfeitiÃ§ado/Manipulado Mentalmente', resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro 18m', lingua:'Entende Comum, mas nÃ£o fala',
            tracos:[
              {n:'Transe Subserviente',d:'Imune a manipulaÃ§Ãµes mentais.'},
              {n:'Sentidos AguÃ§ados',d:'Vantagem em PercepÃ§Ã£o/InvestigaÃ§Ã£o baseados em VisÃ£o, AudiÃ§Ã£o e Olfato.'},
              {n:'TraÃ§Ã£o Animal',d:'Capacidade de Carga/Salto dobrada.'}
            ],
            acoes:[
              {n:'Patada Devastadora',d:'+13 para acertar, 3m, 3 alvos dentro do alcance. Dano: 22 (2d12+10) cortante.'}
            ]
          },
          // â”€â”€ PLAYTEST / OUTRAS OBRAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Pumba FuÃ§a-Suja', tipo:'Besta Comum MÃ©dia, Maligno â€” Bando de 4', cat:'PLAYTEST',
            ca:'12 (Defesa Natural)', pv:'22 (3d12+2)', desl:'12m', reacoes:'4',
            for:'16 (+4)',des:'12 (+1)',con:'26 (+8)',int:'5 (-3)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Atletismo, SobrevivÃªncia', trs:'Con, Car',
            imunidades:'Veneno e Envenenado', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'ImplacÃ¡vel (Recarrega apÃ³s Descanso)',d:'Se sofrer 10 de dano ou menos que o reduziria a 0 PV, fica com 1 PV.'},
              {n:'Corpo PÃºtrido',d:'Criatura que finaliza turno adjacente: TR CON CD 18 ou fica Envenenada atÃ© se afastar 6m+.'}
            ],
            acoes:[
              {n:'Presas',d:'+5 para atingir, 1,5m, 1 alvo. Dano: 10 (2d6+3) cortante.'}
            ]
          },
          {
            nome:'PÃ¡ssaro da FÃ©', tipo:'Besta Pequena, CaÃ³tico â€” Bando de 5', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'12 (1d12+5)', desl:'9m de Voo', reacoes:'3',
            for:'2 (-4)',des:'19 (+4)',con:'11 (+0)',int:'10 (+0)',sab:'18 (+4)',car:'9 (+0)',
            pericias:'Acrobacia +8, Furtividade +8, IntuiÃ§Ã£o +7', trs:'Int +3, Sab +7, Des +8',
            imunidades:'CaÃ­do, Cego', resistencias:null, vulnerabilidades:null,
            sentidos:'EcolocalizaÃ§Ã£o', lingua:'Nenhuma',
            tracos:[
              {n:'Voo Ofuscante',d:'Alvos em linha reta de atÃ© 6m: TR CON CD 15 ou ficam Cegos por 1d4+2 turnos.'},
              {n:'Voo Pseudo-EstÃ¡tico',d:'Imune a AdO ao sair do alcance de um alvo no prÃ³prio turno, se o alvo ficou Cego apÃ³s a parada para atacar.'}
            ],
            acoes:[
              {n:'Bicada',d:'+5 para acertar, 1,5m. Dano: 5 (1d4+5) perfurante.'},
              {n:'EvasÃ£o',d:'Manobra de fuga aÃ©rea: +2 na ReaÃ§Ã£o de esquiva.'}
            ]
          },
          {
            nome:'LeÃ£ozinho da Inxia', tipo:'Besta Comum MÃ©dia, Neutra', cat:'PLAYTEST',
            ca:'14 (Defesa Natural)', pv:'25 (3d10+4)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'17 (+3)',con:'14 (+2)',int:'10 (+0)',sab:'12 (+1)',car:'14 (+2)',
            pericias:'Atletismo +7, Furtividade +6, Esquiva +6, SobrevivÃªncia +4', trs:'For +7, Des +7',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:'Olfato', lingua:'Nenhuma',
            tracos:[
              {n:'Presas Perigosas',d:'HerbÃ­voro e normalmente passivo. Se defende com forÃ§a surpreendente para seu porte. Reproduz-se rapidamente.'}
            ],
            acoes:[
              {n:'Mordida Defensiva',d:'+4 para acertar, 1,5m. Dano: 8 (1d8+4) perfurante.'}
            ]
          },
          {
            nome:'Mariposa Poodle', tipo:'Besta MÃ¡gica MÃ©dia, Neutra', cat:'PLAYTEST',
            ca:'16 (Defesa Natural)', pv:'15 (2d6+3)', desl:'6m de Voo', reacoes:null,
            for:'1 (-5)',des:'19 (+4)',con:'6 (-2)',int:'8 (-1)',sab:'11 (+0)',car:'9 (-1)',
            pericias:'Acrobacia +7, Furtividade +7', trs:'Des +7',
            imunidades:'CaÃ­do', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[
              {n:'Beleza PÃºtrida',d:'Alimentam-se de frutas podres. NÃ£o sÃ£o hostis.'}
            ],
            acoes:[
              {n:'Furtividade Simulada',d:'Pode se ocultar fazendo seu pelo crescer e simulando uma bola de algodÃ£o.'}
            ]
          },
          {
            nome:'Zebralo', tipo:'Besta Comum MÃ©dia, Neutra', cat:'PLAYTEST',
            ca:'16 (Defesa Natural)', pv:'40 (5dx)', desl:'15m', reacoes:null,
            for:'22 (+6)',des:'16 (+3)',con:'15 (+2)',int:'10 (+0)',sab:'13 (+1)',car:'10 (+0)',
            pericias:'Atletismo +9, SobrevivÃªncia +4', trs:'For +9, Con +5, Sab +4',
            imunidades:null, resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Nenhuma',
            tracos:[{n:'TraÃ§Ã£o Animal',d:'Capacidade de Carga dobrada.'}],
            acoes:[
              {n:'Coice',d:'+9 para acertar, 1,5m. Dano: 12 (1d12+6) impacto, Mortal x3.'}
            ]
          },
          {
            nome:'Thri-Kreen', tipo:'Besta MÃ¡gica MÃ©dia, Neutra â€” Montarias DesÃ©rticas', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'33 (6d8+6)', desl:'12m (Salto Parado 6m)', reacoes:'4',
            for:'12 (+1)',des:'15 (+2)',con:'13 (+1)',int:'8 (-1)',sab:'12 (+1)',car:'7 (-2)',
            pericias:'Furtividade +5, PercepÃ§Ã£o +4, SobrevivÃªncia +4', trs:null,
            imunidades:'Sangramento',
            resistencias:null,
            vulnerabilidades:'Impacto (ConcussÃ£o).',
            sentidos:'VisÃ£o no Escuro', lingua:'Thri-Kreen',
            tracos:[
              {n:'Corpo FrÃ¡gil',d:'Vulnerabilidade a dano de impacto.'},
              {n:'Sistema HemostÃ¡tico',d:'Imune Ã  condiÃ§Ã£o Sangramento.'},
              {n:'4 Patas Braquiais',d:'Pode segurar duas armas de duas mÃ£os ao mesmo tempo.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques: Garras/Mordida + Arma, ou 2 do mesmo tipo.'},
              {n:'Garras',d:'+3 para acertar, 1,5m. Dano: 6 (2d4+1) cortante.'},
              {n:'Mordida',d:'+3 para acertar, 1,5m. Dano: 6 (2d4+1) perfurante + TR CON CD 11: falha = Envenenado 1min; falha por 5+ = Paralisado.'},
              {n:'Gythka',d:'+3 para acertar, 1,5m. Dano: 6 (1d8+1) perfurante.'},
              {n:'Chathka',d:'+4 para acertar, 9m. Dano: 6 (1d6+2) cortante.'}
            ]
          },
          {
            nome:'BoitatÃ¡ Adulto', tipo:'Besta MÃ¡gica Enorme, CaÃ³tico/Maligno', cat:'PLAYTEST',
            ca:'19 (Armadura Natural)', pv:'150 (5d20Ã—3)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'20 (+5)',con:'18 (+4)',int:'14 (+2)',sab:'11 (+0)',car:'7 (-2)',
            pericias:'Acrobacia +8, Lidar com Animais +3, IntimidaÃ§Ã£o +1, PercepÃ§Ã£o +3', trs:'For +3, Des +8, Con +7',
            imunidades:'Fogo', resistencias:null, vulnerabilidades:null,
            sentidos:'PercepÃ§Ã£o Passiva 13', lingua:'Nenhuma',
            tracos:[
              {n:'PresenÃ§a Perigosa (Calor)',d:'Ao entrar no alcance (3m): TR CON CD 18 ou recebe 1d12 fogo. No inÃ­cio de cada turno dos alvos enquanto no alcance: repete o teste. Passar 1 vez = imune por um dia.'},
              {n:'Rastro de Fogo',d:'Deixa mancha de fogo no chÃ£o. Passar pelo rastro: 1d4 fogo. Terminar turno no rastro: +1d6 fogo.'}
            ],
            acoes:[
              {n:'Mordida',d:'+3 para acertar, 3m, 2 alvos. Dano: 7 (1d8+3) perfurante + TR CON CD 20: falha = +1d12 fogo.'}
            ]
          },
          {
            nome:'BoitatÃ¡ Jovem', tipo:'Besta MÃ¡gica Enorme, CaÃ³tico/Maligno', cat:'PLAYTEST',
            ca:'19 (Armadura Natural)', pv:'60 (3d20Ã—2)', desl:'9m', reacoes:null,
            for:'16 (+3)',des:'20 (+5)',con:'14 (+2)',int:'12 (+2)',sab:'11 (+0)',car:'7 (-2)',
            pericias:'Acrobacia +8, Lidar com Animais +3, IntimidaÃ§Ã£o +1, PercepÃ§Ã£o +3', trs:'For +3, Des +8, Con +7',
            imunidades:'Fogo', resistencias:null, vulnerabilidades:null,
            sentidos:'PercepÃ§Ã£o Passiva 13', lingua:'Nenhuma',
            tracos:[
              {n:'PresenÃ§a Perigosa (Calor)',d:'Ao entrar no alcance (3m): TR CON CD 18 ou recebe 1d12 fogo. Passar 1 vez = imune por um dia.'},
              {n:'Rastro de Fogo',d:'Deixa mancha de fogo. Passar: 1d4 fogo. Terminar turno: +1d6 fogo.'}
            ],
            acoes:[
              {n:'Mordida',d:'+3 para acertar, 3m, 2 alvos. Dano: 7 (1d8+3) perfurante + TR CON CD 20: falha = +1d12 fogo.'}
            ]
          },
          {
            nome:'Canibal Hitoku', tipo:'Besta MÃ¡gica MÃ©dia, CaÃ³tico â€” Rank C+', cat:'PLAYTEST',
            ca:'15 (Defesa Natural)', pv:'50 (5d12)', desl:'9m', reacoes:null,
            for:'14 (+2)',des:'14 (+2)',con:'18 (+4)',int:'10 (+0)',sab:'20 (+5)',car:'16 (+3)',
            pericias:'PercepÃ§Ã£o +7, Furtividade +4, IntimidaÃ§Ã£o +5', trs:'Con +6, Sab +7',
            imunidades:'Derrubado',
            resistencias:null,
            vulnerabilidades:'Qualquer ataque de uma criatura que nÃ£o tenha sido copiada: dano dobrado.',
            sentidos:'VisÃ£o no Escuro 18m', lingua:'A do copiado',
            tracos:[
              {n:'CÃ³pia Perfeita',d:'Observa alvo por 1 turno e assume sua forma completa (atributos, habilidades, metade do dano). NÃ£o pode trocar de cÃ³pia atÃ© derrotar o copiado.'}
            ],
            acoes:[
              {n:'Garra (sem cÃ³pia)',d:'+2 para acertar, 1,5m. Dano: 1d10+2 cortante.'},
              {n:'CÃ³pia',d:'Usa qualquer habilidade da ficha do inimigo copiado, incluindo hatsu.'}
            ]
          },
          {
            nome:'Lefyurgo', tipo:'AberraÃ§Ã£o MÃ©dia, Maligno', cat:'ABERRAÃ‡ÃƒO',
            ca:'18 (Defesa Natural)', pv:'26 (3d10+1)', desl:'9m', reacoes:'8',
            for:'18 (+4)',des:'13 (+1)',con:'17 (+3)',int:'18 (+4)',sab:'18 (+4)',car:'22 (+6)',
            pericias:'+7 Atletismo, InvestigaÃ§Ã£o, SobrevivÃªncia, IntuiÃ§Ã£o, PercepÃ§Ã£o; +9 IntimidaÃ§Ã£o', trs:'For +7, Car +7',
            imunidades:'Agarrado/Preso/Enredado, Impedido', resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro, PercepÃ§Ã£o Passiva 17', lingua:'Comum',
            tracos:[
              {n:'Corpo AdaptÃ¡vel',d:'Como ReaÃ§Ã£o ou aÃ§Ã£o livre: transforma membros e Ã³rgÃ£os para outros locais ou cria novos. Role 1d100: 50% de chance de receber 1 nÃ­vel de ExaustÃ£o.'},
              {n:'Sentidos AguÃ§ados',d:'Vantagem em PercepÃ§Ã£o/InvestigaÃ§Ã£o baseados em VisÃ£o.'}
            ],
            acoes:[
              {n:'Mordida',d:'+6 para acertar, 1,5m. Dano: 7 (1d6+4) perfurante + 5 (1d4+3) necrÃ³tico.'},
              {n:'Sinergia MorfolÃ³gica',d:'ApÃ³s 10 de dano NecrÃ³tico total no mesmo alvo: adapta sistema ao sangue desse alvo; prÃ³ximos ataques recuperam PV = dano NecrÃ³tico causado.'}
            ]
          },
          // â”€â”€ MADE IN ABYSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          {
            nome:'Amakagame', tipo:'AberraÃ§Ã£o Imenso/Colossal, Neutro', cat:'ABERRAÃ‡ÃƒO',
            ca:'12 (Defesa Natural)', pv:'36 (6d10+4)', desl:'6m', reacoes:null,
            for:'5 (-3)',des:'5 (-3)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',car:'5 (-3)',
            pericias:'SobrevivÃªncia +5, PercepÃ§Ã£o +5', trs:'Con +7',
            imunidades:'Veneno, Ãcido',
            resistencias:'Impacto (ConcussÃ£o).',
            vulnerabilidades:'Fogo, Cortante.',
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Corpo Malemolente',d:'ResistÃªncia a impacto pelo corpo menos rÃ­gido que engolfa contatos fÃ­sicos.'},
              {n:'Corpo Fagomorfo',d:'Criatura que termina turno adjacente Ã© englobada por sua membrana (atraÃ§Ã£o que se estende a criaturas vivas).'},
              {n:'DigestÃ£o Passiva',d:'Criatura dentro do Amakagame: 3d6 Ã¡cido/turno. Deteriora objetos, armaduras e equipamentos (nÃ£o dividido).'}
            ],
            acoes:[
              {n:'ExtensÃ£o da Membrana Faminta',d:'Ao mover-se para o espaÃ§o de outra criatura: TR CON CD 21. Falha: 6d6 Ã¡cido (alvo + todos no local + equipamentos). Sucesso: metade (sÃ³ usuÃ¡rio, nÃ£o equipamentos). Imune por 24h apÃ³s sucesso.'}
            ]
          },
          {
            nome:'Emperador Armorshell', tipo:'Besta MÃ¡gica MÃ©dio-Grande, CaÃ³tico/Maligno', cat:'BESTA MÃGICA',
            ca:'26 (Defesa Natural)', pv:'64 (5d12+8)', desl:'9m', reacoes:null,
            for:'18 (+4)',des:'1 (-5)',con:'27 (+8)',int:'10 (+0)',sab:'10 (+0)',car:'10 (+0)',
            pericias:'Atletismo +7, SobrevivÃªncia +3', trs:'For +7, Con +11',
            imunidades:'Veneno, Fogo, Eletricidade, PsÃ­quico',
            resistencias:'Impacto, Cortante, Perfurante (precisÃ£o DES).',
            vulnerabilidades:'Perfurante (impacto FOR), BalÃ­stico, Armas de Cerco.',
            sentidos:'SÃ­smico', lingua:'Desconhecida',
            tracos:[
              {n:'Criatura de Cerco',d:'Dano crÃ­tico em construÃ§Ãµes e Constructos.'},
              {n:'TraÃ§Ã£o Animal',d:'Capacidade de Carga dobrada.'},
              {n:'AparÃªncia Falsa',d:'Pode passar despercebido como rocha contra PercepÃ§Ã£o Passiva < 15.'}
            ],
            acoes:[
              {n:'Investida Pesada',d:'+7 para acertar, 1,5m, 2 alvos. Dano: 12 (2d8+4).'},
              {n:'Cauda da Muralha Oportunista (ReaÃ§Ã£o)',d:'Ao defender ataque com carapaÃ§a: realiza ataque de cauda livre. +7 para acertar, 1,5m, 1 alvo. Dano: 12 (2d8+4).'}
            ]
          },
          {
            nome:'Hidra do Deserto', tipo:'AberraÃ§Ã£o MÃ©dio/MÃ©dio Modificado, Maligno', cat:'ABERRAÃ‡ÃƒO',
            ca:'18 (Defesa Natural)', pv:'86 (8d8+21)', desl:'9m', reacoes:'12',
            for:'17 (+3)',des:'21 (+5)',con:'15 (+2)',int:'12 (+1)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Atletismo +6, Furtividade +8, PercepÃ§Ã£o +5', trs:'For +6, Des +8, Con +5',
            imunidades:'Sangramento',
            resistencias:'Cortante, Perfurante (CarapaÃ§a/Sistema HemostÃ¡tico).',
            vulnerabilidades:'7 caudas sensÃ­veis â€” ataques mirados com 10+ dano inutilizam a cauda.',
            sentidos:'SÃ­smico', lingua:'Desconhecida',
            tracos:[
              {n:'Arma Natural: FerrÃµes',d:'Ataque CaC com alcance (3m) e Finta (enquanto tiver 2+ caudas funcionais, sem gastar aÃ§Ã£o bÃ´nus).'}
            ],
            acoes:[
              {n:'Cauda com FerrÃ£o',d:'+6 para acertar, 3m, 1 alvo. Dano: 6 (2d6). Cada ferrÃ£o seguinte no mesmo alvo aumenta progressivamente: 4d6â†’6d6â†’8d6â†’10d6â†’12d6â†’14d6.'}
            ]
          },
          {
            nome:'Fuzosheppu / Oogasumi', tipo:'AberraÃ§Ã£o Imenso/Colossal (mais leve que o ar), Neutro', cat:'ABERRAÃ‡ÃƒO',
            ca:'12 (Defesa Natural)', pv:'10 (1d12+4) Camada Externa / 36 (6d10+4) NÃºcleo', desl:'15m de Voo', reacoes:null,
            for:'5 (-3)',des:'5 (-3)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',car:'5 (-3)',
            pericias:'Natureza +4, SobrevivÃªncia +5', trs:'Con +7',
            imunidades:'Agarrado/Cortante/Impacto/Perfurante/BalÃ­stico (camada externa)',
            resistencias:null,
            vulnerabilidades:'Fogo e Vento â€” separa a camada externa do nÃºcleo.',
            sentidos:'Sentido TÃ©rmico', lingua:'Desconhecida',
            tracos:[
              {n:'Corpo Gasoso de NÃºcleo SÃ³lido',d:'Vento/explosÃ£o de dispersÃ£o pode separar a camada externa do nÃºcleo sÃ³lido.'},
              {n:'Licor Corrosivo',d:'Criatura dentro: 3d6 Ã¡cido/turno, deteriora equipamentos.'}
            ],
            acoes:[
              {n:'Disparo Corrosivo',d:'+4 para acertar, 9m, 3 alvos. Dano: 15 (2d10+5) Ã¡cido/corrosivo.'}
            ]
          },
          {
            nome:'Gogouge â€” Silkfang', tipo:'Besta Natural Enorme, Maligno â€” PrÃ³ximo de Covil', cat:'BESTA NATURAL',
            ca:'17 (Defesa Natural)', pv:'127 (7d20+8)', desl:'16m', reacoes:'6',
            for:'18 (+4)',des:'22 (+6)',con:'18 (+4)',int:'12 (+1)',sab:'14 (+2)',car:'1 (+5)',
            pericias:'Atletismo +7, IntuiÃ§Ã£o +5, PercepÃ§Ã£o +5, SobrevivÃªncia +5', trs:'Des +9, Con +7, Sab +5',
            imunidades:'Veneno, Ãcido', resistencias:null, vulnerabilidades:null,
            sentidos:'VisÃ£o no Escuro', lingua:'Desconhecida',
            tracos:[
              {n:'Disparo PeÃ§onhento',d:'Dispara lÃ­quido Ã¡cido e pegajoso para limitar movimentos. TR FOR CD 18.'},
              {n:'Transe de CaÃ§a',d:'Enquanto focada em 1 alvo: pode atacÃ¡-lo duas vezes.'}
            ],
            acoes:[
              {n:'Disparo PeÃ§onhento',d:'+8 para acertar, 9m, raio 3m (terreno difÃ­cil). Dano: 3 (1d6) Ã¡cido por turno que permanece na poÃ§a.'},
              {n:'Garras Cortantes',d:'+6 para acertar, 1 alvo. Dano: 12 (2d8+4) cortante.'}
            ]
          },
          {
            nome:'Hammerbeak (Bico de Martelo)', tipo:'Besta MÃ¡gica MÃ©dia, Maligno', cat:'BESTA MÃGICA',
            ca:'16 (Defesa Natural)', pv:'38 (5d8+3)', desl:'12m de Voo', reacoes:'4',
            for:'17 (+3)',des:'18 (+4)',con:'17 (+3)',int:'12 (+1)',sab:'15 (+2)',car:'11 (+0)',
            pericias:'+7 Esquiva e Esquiva AcrobÃ¡tica; +5 PercepÃ§Ã£o e SobrevivÃªncia', trs:'Con +7, Sab +5',
            imunidades:'CaÃ­do, Atordoado por som ou impacto', resistencias:null, vulnerabilidades:null,
            sentidos:'PercepÃ§Ã£o Passiva 17', lingua:'Bestial',
            tracos:[
              {n:'Arma Natural: Bico de Martelo',d:'Ataque CaC com FOR: 1d12+FOR dano de impacto.'},
              {n:'Rasante',d:'Mover 3m+ em voo: imune a AdO ao sair do alcance.'},
              {n:'RegeneraÃ§Ã£o',d:'Recupera 1d8+3 PV por turno.'}
            ],
            acoes:[
              {n:'Bico de Martelo',d:'+6 para acertar, 1,5m. Dano: 9 (1d12+3) impacto.'},
              {n:'Martelo Voador (Rasante)',d:'+6 para acertar, 1,5m. Dano: 12 (1d12+6) impacto. Alvo MÃ©dio ou menor: TR FOR CD 16 ou arremessado 6m + 1d6 queda + CaÃ­do. Natural 20: TR CON CD 16 ou Atordoado.'}
            ]
          },
          {
            nome:'Hanashirama', tipo:'AberraÃ§Ã£o MiÃºda, Neutra â€” ColÃ´nia de 10', cat:'ABERRAÃ‡ÃƒO',
            ca:'22 (Defesa Natural)', pv:'2 (1d4-2)', desl:'9m de Nado', reacoes:'Ilimitadas (ao ser tocada ou mover)',
            for:'1 (-5)',des:'12 (+0)',con:'6 (-2)',int:'9 (-1)',sab:'12 (+1)',car:'1 (-5)',
            pericias:'Furtividade +3', trs:'Des +3, Sab +4',
            imunidades:'Envenenado',
            resistencias:null,
            vulnerabilidades:'Esmagamento.',
            sentidos:'PercepÃ§Ã£o Ã s Cegas', lingua:'Desconhecida',
            tracos:[
              {n:'PeÃ§onha',d:'Aplica Veneno/CorrosÃ£o no contato ou ataque.'}
            ],
            acoes:[
              {n:'GlÃ¢ndulas Discipadora (ReaÃ§Ã£o)',d:'Ao ser tocada ou receber dano: 1,5m de jato de peÃ§onha em 5d6 Veneno/CorrosÃ£o no atacante + TR CON CD 25 ou Envenenado. SHU protege objetos contra corrosÃ£o.'}
            ]
          },
          {
            nome:'Inbyos', tipo:'Monstruosidade MÃ©dia, Mau â€” Bando de 3-5', cat:'MONSTRUOSIDADE',
            ca:'16 (Defesa Natural)', pv:'34 (6d6+2)', desl:'9m (18m Transflorestal)', reacoes:'4',
            for:'18 (+4)',des:'18 (+4)',con:'14 (+2)',int:'12 (+1)',sab:'15 (+2)',car:'10 (+0)',
            pericias:'Atletismo +7, Furtividade +7, Acrobacia +7, PercepÃ§Ã£o +5', trs:'For +7, Des +7',
            imunidades:null, resistencias:null,
            vulnerabilidades:'Luz.',
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Movimento Transflorestal',d:'Move-se entre Ã¡rvores com saltos como em terra firme, com o dobro do deslocamento.'},
              {n:'TÃ¡tica de Matilha',d:'Aliado a 1,5m de um inimigo do Inbyos (no campo de visÃ£o): recebe vantagem nos ataques.'}
            ],
            acoes:[
              {n:'Garras Firmes (IMOBILIZADOR)',d:'+7 para acertar, 1,5m. Com mÃºltiplas garras: aplica condiÃ§Ã£o Imobilizado.'},
              {n:'Mordida',d:'+7 para acertar, 1,5m. Dano: 8 (1d8+4).'}
            ]
          },
          {
            nome:'Kuongatari', tipo:'Besta Natural MiÃºdo, Neutro â€” ColÃ´nia de 10', cat:'BESTA NATURAL',
            ca:'14 (Defesa Natural)', pv:'5 (1d6+1) cada / 50 (colÃ´nia completa)', desl:'6m', reacoes:null,
            for:'7 (-2)',des:'16 (+3)',con:'12 (+1)',int:'6 (-2)',sab:'10 (+0)',car:'3 (-4)',
            pericias:'Natureza +3, PercepÃ§Ã£o +3', trs:'Con +4, Sab +3',
            imunidades:'Envenenado, Esmagamento, Impacto',
            resistencias:'Cortante.',
            vulnerabilidades:null,
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Arma Natural: Picada CarapeÃ§onhenta',d:'Ataque CaC com FOR. Quando alvo cercado por 5+ da colÃ´nia: acerto automÃ¡tico.'}
            ],
            acoes:[
              {n:'Ataques MÃºltiplos',d:'2 ataques (Picada + Mordida) quando NÃƒO usa picada em colÃ´nia no turno.'},
              {n:'Picada CarapeÃ§onhenta',d:'+1 para acertar, alvo "pousado". Dano: 3 (1d4+1) perfurante + Veneno paralisante: TR CON CD 20 ou Imobilizado. Para mover apÃ³s efeito: TR FOR CD 20. Para curar: superar TR original.'},
              {n:'Mordida',d:'+1 para acertar, alvo pousado. Dano: 5 (2d4+1) perfurante.'}
            ]
          },
          {
            nome:'Madokajacks', tipo:'Besta MÃ¡gica Grande, Mau â€” Sozinho ou em Par', cat:'BESTA MÃGICA',
            ca:'21 (Defesa Natural) / 18 (Membrana das asas)', pv:'56 (5d12+3)', desl:'15m Voo / 9m Terrestre', reacoes:'6',
            for:'20 (+5)',des:'20 (+5)',con:'15 (+2)',int:'14 (+2)',sab:'17 (+3)',car:'10 (+0)',
            pericias:'Atletismo +8, Acrobacia +8, IntuiÃ§Ã£o +5, PercepÃ§Ã£o +6', trs:'For +8, Des +8',
            imunidades:'Surdo',
            resistencias:null,
            vulnerabilidades:'Luz.',
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'EvasÃ£o',d:'Manobra de fuga aÃ©rea: +2 na ReaÃ§Ã£o de esquiva.'},
              {n:'Investida',d:'Requer 6m de deslocamento para aplicar condiÃ§Ã£o.'},
              {n:'Rasante',d:'Ataque aÃ©reo sem receber AdO.'}
            ],
            acoes:[
              {n:'Investida do Vendaval Rasante',d:'+8 para acertar, cone 4,5m. Sem dano â€” alvos empurrados 6m + TR FOR CD 18 ou CaÃ­dos.'},
              {n:'Mordida (contra CaÃ­dos)',d:'+8 para acertar, 3m, 2 alvos. Dano: 12x (2d8+5).'}
            ]
          },
          {
            nome:'MandÃ­bula Escarlate', tipo:'Besta MÃ¡gica Imenso/Colossal, Mau â€” Sozinho', cat:'BESTA MÃGICA',
            ca:'25 (Defesa Natural)', pv:'255 (8d20+10)', desl:'27m de Voo (planando)', reacoes:null,
            for:'30 (+10)',des:'18 (+4)',con:'30 (+10)',int:'10 (+0)',sab:'15 (+2)',car:'16 (+4)',
            pericias:'Atletismo +13, IntimidaÃ§Ã£o +7', trs:'For +13, Con +13',
            imunidades:'Surdo, Assustado/Intimidado, Exausto', resistencias:null, vulnerabilidades:null,
            sentidos:'PercepÃ§Ã£o Ã s Cegas', lingua:'Desconhecida',
            tracos:[
              {n:'Criatura de Cerco',d:'Dano crÃ­tico em construÃ§Ãµes e Constructos.'},
              {n:'Limiar de Dano',d:'Qualquer dano abaixo de 40 Ã© insignificante contra esta criatura.'}
            ],
            acoes:[
              {n:'Mordida',d:'+13 para acertar, 3m, atÃ© 3 alvos. Dano: 20 (2d10+10) perfurante+cortante.'},
              {n:'Cauda',d:'+13 para acertar, 3m, atÃ© 3 alvos. Dano: 16 (2d6+10) impacto.'},
              {n:'Ataque de Cerco',d:'+13 para acertar construÃ§Ãµes/Constructos/ambientes naturais. Dano: 20 (2d10+10) impacto.'}
            ]
          },
          {
            nome:'Nakikabane (Corpse Weeper / Lamentador de CadÃ¡ver)', tipo:'Besta MÃ¡gica MÃ©dio Modificado, CaÃ³tico/Mal â€” PrÃ³ximo de ColÃ´nias', cat:'BESTA MÃGICA',
            ca:'17 (Defesa Natural)', pv:'74 (10d10+24)', desl:'9m Terrestre / 21m Voo', reacoes:'6',
            for:'14 (+2)',des:'18 (+4)',con:'9 (-1)',int:'12 (+1)',sab:'18 (+4)',car:'7 (-2)',
            pericias:'Atletismo +5, Acrobacia +7, IntuiÃ§Ã£o +7', trs:'For +5, Des +7, Sab +7',
            imunidades:'Assustado', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'MÃ­mico Sonoro',d:'Engana alvos simulando choro de feridos. Criaturas que nunca viram essa criatura nÃ£o tÃªm chance de duvidar. Criaturas sobreviventes sÃ£o imunes.'},
              {n:'Emboscador',d:'EstratÃ©gia de emboscada concede dado mÃ¡ximo de dano adicional contra desavisados.'},
              {n:'Olhar Aterrorizante',d:'Olhar que provoca medo, paralisando alvos para facilitar o ataque.'}
            ],
            acoes:[
              {n:'Mordida',d:'+5 para acertar, 1,5m. Dano: 10 (2d8+2) perfurante.'},
              {n:'Garras',d:'+5 para acertar (CrÃ­tico 19), 1,5m. Dano: 10 (3d6+2) cortante.'},
              {n:'Olhar Aterrorizante',d:'Alvos no campo de visÃ£o em 18m: TR Sab CD 16 ou Amedrontados. Pode refazer o teste no fim do prÃ³prio turno.'}
            ]
          },
          {
            nome:'DragÃ£o TurbinÃ³dio â€” Ryuusazai', tipo:'Besta MÃ¡gica Imenso/Colossal, Mau â€” Sozinho', cat:'BESTA MÃGICA',
            ca:'23 (Defesa Natural)', pv:'187 (9d20+30)', desl:'18m Terrestre', reacoes:null,
            for:'30 (+10)',des:'17 (+3)',con:'30 (+10)',int:'10 (+0)',sab:'26 (+8)',car:'10 (+0)',
            pericias:'Atletismo +13, PercepÃ§Ã£o +11', trs:'For +13, Sab +11',
            imunidades:'Assustado, Sangrando, Queimando, Atordoado', resistencias:null, vulnerabilidades:null,
            sentidos:null, lingua:'Desconhecida',
            tracos:[
              {n:'Limiar de Dano',d:'Dano abaixo de 50 Ã© insignificante.'},
              {n:'Cuspe Ãcido',d:'Expele lÃ­quido Ã¡cido com dano corrosivo e necrÃ³tico. Recarrega 5-6 (1d6) no fim do turno.'}
            ],
            acoes:[
              {n:'Mordida',d:'+13 para acertar, 6m, 1 alvo. Dano: 22 (3d8+10) perfurante.'},
              {n:'PisÃ£o/Patada',d:'+13 para acertar, 6m, 1 alvo. Dano: 22 (3d8+10) impacto+esmagamento. Local pisado vira terreno difÃ­cil.'},
              {n:'Cuspe Ãcido',d:'+6 para acertar, 18m, 1 alvo. Dano: 30 (3d12+10).'}
            ]
          },
          {
            nome:'Tamaugachi', tipo:'Monstruosidade MÃ©dio Modificado, Mau â€” Sozinho', cat:'MONSTRUOSIDADE',
            ca:'18 (Defesa Natural)', pv:'86 (7d12+8)', desl:'12m', reacoes:'17',
            for:'28 (+9)',des:'24 (+7)',con:'30 (+10)',int:'7 (-2)',sab:'30 (+10)',car:'4 (-3)',
            pericias:'Atletismo +12, Acrobacia +10, Natureza +13, PercepÃ§Ã£o +13', trs:'Con +13, Sab +13',
            imunidades:'Cego, Surdo, Atordoado, Envenenado', resistencias:null,
            vulnerabilidades:'IntimidaÃ§Ã£o com REN.',
            sentidos:'VisÃ£o Ã s Cegas', lingua:'Desconhecida',
            tracos:[
              {n:'Arma Natural + Corpo Adaptado',d:'Espinhos venenosos que pode manipular para crescer em qualquer direÃ§Ã£o em atÃ© 1m, enquanto conectados ao corpo.'},
              {n:'Sensibilidade EnergÃ©tica',d:'VÃª fluxo de aura: usuÃ¡rios de NEN sem ZETSU atacam em desvantagem. IntimidaÃ§Ã£o com REN: vantagem para o atacante. PrevÃª movimentos, possibilitando ataques rÃ¡pidos e reativos.'}
            ],
            acoes:[
              {n:'Ponta Venenoso',d:'+12 para acertar, 1,5m, todos os alvos adjacentes sem Zetsu. Dano: 19 (2d10+9) perfurante. Alvo perfurado: TR CON CD 25 ou local sofre 3d10+10 veneno + incapacita aquele membro (incha e se deforma). Novo teste ao fim do turno.'},
              {n:'Defesa Venenosa (ReaÃ§Ã£o)',d:'Ao receber ataque: crescer espinhos. Atacante: TR DES CD 20. Reduz dano recebido em 50%. Se atacante falhar: ele pode ser perfurado em diversas partes + TR CON CD 25 ou Paralisado.'}
            ]
          }
        ];
