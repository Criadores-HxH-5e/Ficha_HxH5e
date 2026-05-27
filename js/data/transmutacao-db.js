window.TRANSMUTACAO_DB = {
    elemental: [
        { id:'acido', nome:'Ãcido', icon:'ðŸ§ª', cor:'#84cc16',
          efeito:'Propriedade corrosiva. Alvos ficam Expostos.',
          progressao:[
            { nivel:1, nome:'Ãcido', desc:'Aura corrosiva â€” alvos ficam Expostos e matÃ©ria sÃ³lida/orgÃ¢nica Ã© danificada.' },
            { nivel:3, nome:'CorrosÃ£o de ProteÃ§Ã£o', desc:'Cada acerto reduz a CA do alvo em âˆ’1 (mÃ¡x. âˆ’5).' },
            { nivel:5, nome:'Queimadura QuÃ­mica', desc:'Aura Ã¡cida queima o alvo (necessita lÃ­quido ou terra para diluir). CondiÃ§Ã£o: Queimado.' },
            { nivel:6, nome:'DissoluÃ§Ã£o Proximal', desc:'Derrete o solo ao redor. Inimigos que terminam turno no espaÃ§o recebem +1 dado (menor) de dano.' },
            { nivel:8, nome:'Diabo Verde', desc:'Ao atingir arma/item, reduz 1 grau/passo do dado de dano atÃ© ser reparado.' },
            { nivel:10, nome:'DeterioraÃ§Ã£o Corrosiva', desc:'Dano \"necrÃ³tico\" â€” reduz do total mÃ¡ximo de vida, nÃ£o da vida atual.' },
          ]},
        { id:'agua', nome:'Ãgua/LÃ­quido', icon:'ðŸ’§', cor:'#38bdf8',
          efeito:'Alvo fica Molhado (vulnerÃ¡vel a elÃ©trico), desvantagem vs gelo.',
          progressao:[
            { nivel:1, nome:'Ãgua/LÃ­quido', desc:'Molha o que toca â€” alvo Molhado (vulnerÃ¡vel a dano ElÃ©trico, desvantagem vs TRs de Gelo).' },
            { nivel:1, nome:'Jato Poderoso', desc:'Golpes aplicam jato que pode deixar o alvo CaÃ­do.' },
            { nivel:1, nome:'Encharcar', desc:'Encharca alvos e equipamentos â€” âˆ’1 em resultados de reaÃ§Ãµes do alvo.' },
            { nivel:1, nome:'Manto de Fluidez', desc:'UsuÃ¡rio fica escorregadio â€” +2 em testes de acrobacia para escapar de agarrÃµes.' },
            { nivel:3, nome:'LÃ¢mina de PressÃ£o', desc:'Fios/lÃ¢minas de alta velocidade â€” ignora 2 de RD.' },
            { nivel:6, nome:'AbsorÃ§Ã£o HidrÃ¡ulica', desc:'Densidade lÃ­quida amortece â€” +2 de ReduÃ§Ã£o de Dano.' },
            { nivel:10, nome:'RefraÃ§Ã£o de Aura', desc:'Distorce luz. Inimigos Ã  distÃ¢ncia ficam Ofuscados e âˆ’5 em Acerto.' },
          ]},
        { id:'vento', nome:'Ar/Vento/Gases', icon:'ðŸŒªï¸', cor:'#a3e635',
          efeito:'Voo, reduÃ§Ã£o de dano de queda 50%, ou ignora RD fÃ­sico em 3.',
          progressao:[
            { nivel:1, nome:'Ar/Vento/Gases', desc:'Escolha: a) voo independente do peso de carga, b) reduÃ§Ã£o de queda 50%, ou c) pressÃ£o interna â€” ignora RD fÃ­sico em 3.' },
            { nivel:3, nome:'Ar Rarefeito', desc:'Dificulta respiraÃ§Ã£o. Alvo sofre âˆ’1 em CON e fica Asfixiado ao ser golpeado na cabeÃ§a.' },
            { nivel:3, nome:'Reagente Coringa', desc:'Mistura com outro elemento: +1 grau de dano, TR ou Alcance/Ãrea.' },
            { nivel:3, nome:'TurbulÃªncia de Aura', desc:'Correntes caÃ³ticas. Alvo âˆ’1 em ataques Ã  distÃ¢ncia OU alvos em Ã¡rea recebem Resistente a danos fÃ­sicos externos.' },
            { nivel:5, nome:'VÃ¡cuo de ComunicaÃ§Ã£o', desc:'Fina camada impede som/ar do alvo â€” perde capacidade de falar.' },
            { nivel:5, nome:'Impacto de Vendaval', desc:'Alvo empurrado 3m. Em caso de colisÃ£o, adiciona o maior dado de dano 1Ã—.' },
          ]},
        { id:'eletricidade', nome:'Eletricidade', icon:'âš¡', cor:'#fbbf24',
          efeito:'Aura assume propriedade elÃ©trica. CondiÃ§Ãµes: Atordoado e Eletrocutado.',
          progressao:[
            { nivel:1, nome:'Eletricidade', desc:'Aura elÃ©trica. CondiÃ§Ãµes aplicÃ¡veis: Atordoado e Eletrocutado.' },
            { nivel:1, nome:'Desfibrilador', desc:'Choque em alvo inconsciente o faz recobrar consciÃªncia com 1 PV.' },
            { nivel:3, nome:'Neuro-Espasmo', desc:'+1,5m de deslocamento OU +1 em Resultados de ReaÃ§Ãµes.' },
            { nivel:3, nome:'Curto Circuito', desc:'Alvo sofre âˆ’1 em DES OU âˆ’1,5m de deslocamento OU âˆ’1 em ReaÃ§Ãµes.' },
            { nivel:6, nome:'EstÃ¡tica Constritora', desc:'Inimigos com armas de metal recebem Desorientado e Desprevenido por uma rodada apÃ³s cada ataque.' },
            { nivel:6, nome:'Sobrecarga SinÃ¡ptica', desc:'ApÃ³s 3 acertos desta aura, alvo recebe ExaustÃ£o 1.' },
          ]},
        { id:'fogo', nome:'Fogo', icon:'ðŸ”¥', cor:'#f97316',
          efeito:'Aura com propriedade de fogo/combustÃ£o. CondiÃ§Ãµes: Queimado/Queimando.',
          progressao:[
            { nivel:1, nome:'Fogo', desc:'Aura assume propriedade de fogo/combustÃ£o â€” dano correspondente. CondiÃ§Ãµes: Queimado/Queimando.' },
            { nivel:3, nome:'DesidrataÃ§Ã£o CrÃ­tica', desc:'Calor seco consome o fÃ´lego. Alvo âˆ’1 em CON enquanto estiver a 1,5m do usuÃ¡rio.' },
            { nivel:3, nome:'CauterizaÃ§Ã£o de Tecido', desc:'Aura sela ferimentos â€” estanca Sangramento (causa 1d4 dano de fogo no processo).' },
            { nivel:3, nome:'PiromanÃ­aco', desc:'Inimigos que terminam turno no espaÃ§o do usuÃ¡rio recebem +1 dado (menor) de dano.' },
            { nivel:5, nome:'IncendiÃ¡rio', desc:'Equipamentos atingidos com golpes mirados pegam fogo â€” 1d10 por turno (tecidos/materiais nÃ£o-aura).' },
            { nivel:8, nome:'Chamas Azuis', desc:'Queima sem dor fÃ­sica â€” causa dano psÃ­quico ao ver o corpo pegar fogo.' },
            { nivel:10, nome:'Onda de InsolaÃ§Ã£o', desc:'TR de CON ou alvo recebe ExaustÃ£o 2.' },
          ]},
        { id:'gelo', nome:'Frio/Gelo', icon:'â„ï¸', cor:'#7dd3fc',
          efeito:'Aura gÃ©lida causa dano de frio. CondiÃ§Ã£o: Lento.',
          progressao:[
            { nivel:1, nome:'Frio/Gelo', desc:'Aura gÃ©lida â€” dano de frio nos alvos. CondiÃ§Ã£o: Lento.' },
            { nivel:3, nome:'Rigidez Articular', desc:'Frio extremo â€” alvo âˆ’1 em DES e ReaÃ§Ãµes.' },
            { nivel:3, nome:'Jogos de Inverno', desc:'Camada de gelo no chÃ£o â€” terreno difÃ­cil, provoca queda ao se mover.' },
            { nivel:6, nome:'Manto de Cisne', desc:'a) +2 CA, âˆ’2 DES (armadura de gelo) OU b) +5 RD contra qualquer propriedade (placas leves).' },
            { nivel:10, nome:'Fadiga CrionergÃ©tica', desc:'ApÃ³s qualquer dano de frio, alvo perde 1 reaÃ§Ã£o por rodada.' },
          ]},
        { id:'terra', nome:'Terra/Areia', icon:'ðŸª¨', cor:'#a78bfa',
          efeito:'+1 grau/passo de dano e RD contra golpes fÃ­sicos.',
          progressao:[
            { nivel:1, nome:'Densidade Granular', desc:'Peso e maleabilidade da terra/areia. +1 grau/passo de dano e RD contra golpes fÃ­sicos.' },
            { nivel:3, nome:'AbrasÃ£o de Areia', desc:'Granulada e Ã¡spera â€” micro-cortes causam Sangramento.' },
            { nivel:3, nome:'Areia MovediÃ§a', desc:'Prende alvo sobre densa camada de terra/areia. CondiÃ§Ã£o: Enredado/Preso.' },
            { nivel:6, nome:'Jogo Sujo', desc:'Poeirenta e sufocante â€” golpes podem deixar alvos Cegos se olhos desprotegidos.' },
            { nivel:10, nome:'Centro de Gravidade', desc:'UsuÃ¡rio imune a empurrÃµes, CaÃ­do e penalidades de terreno difÃ­cil.' },
          ]},
        { id:'veneno', nome:'Veneno', icon:'â˜ ï¸', cor:'#86efac',
          efeito:'Propriedades quÃ­micas ou naturais de veneno. CondiÃ§Ã£o: Envenenado.',
          progressao:[
            { nivel:1, nome:'Veneno', desc:'Propriedades de veneno â€” dano correspondente e Envenenamento.' },
            { nivel:3, nome:'Toxina BotulÃ­nica', desc:'Relaxamento muscular â€” âˆ’1 em ForÃ§a OU progressivamente ImÃ³vel â†’ Paralisado.' },
            { nivel:5, nome:'Neurotoxina Motora', desc:'Ataca sistema nervoso â€” âˆ’2 em DES imediato. CondiÃ§Ã£o: Lento.' },
            { nivel:5, nome:'DegradaÃ§Ã£o OrgÃ¢nica', desc:'Consome vitalidade â€” âˆ’2 em CON enquanto ativo.' },
            { nivel:6, nome:'DoenÃ§a Terminal', desc:'Colapso fÃ­sico acelerado â€” aplica diretamente ExaustÃ£o 3.' },
            { nivel:8, nome:'Toxina Relaxante/Depressora', desc:'Progressivamente: LentidÃ£o â†’ Fragilizado â†’ Inconsciente.' },
            { nivel:8, nome:'Toxina Estimulante', desc:'+1 em perÃ­cia de INT ou SAB OU +1 ReaÃ§Ã£o (total).' },
            { nivel:10, nome:'DelÃ­rio TÃ³xico', desc:'AlucinaÃ§Ãµes â€” âˆ’3 em Sanidade e pode ficar Confuso.' },
          ]},
    ],
    versatil: [
        { id:'borracha', nome:'Borracha/Elasticidade', icon:'ðŸªƒ', cor:'#fb923c',
          efeito:'Aura com propriedades de borracha/goma â€” resistente a elÃ©trico.',
          progressao:[
            { nivel:1, nome:'Fita Isolante', desc:'ResistÃªncia a dano elÃ©trico a quem toca a aura.' },
            { nivel:4, nome:'Amortecimento CinÃ©tico', desc:'a) RD 10 contra danos fÃ­sicos. OU b) Devolve ataque fÃ­sico direto ao agressor (+bÃ´nus do usuÃ¡rio).' },
            { nivel:7, nome:'ContraÃ§Ã£o SÃºbita', desc:'PuxÃ£o violento â€” TR de FOR; falha: 1d6 por 3m deslocado em impacto e pode ficar CaÃ­do.' },
            { nivel:10, nome:'Gomu Gomu', desc:'Imune a dano elÃ©trico. Limiar MÃ­nimo de Dano FÃ­sico = 20 (danos 1-19 nÃ£o contam).' },
          ]},
        { id:'decibeis', nome:'DecibÃ©is/Volume', icon:'ðŸ”Š', cor:'#fbbf24',
          efeito:'Absorve ou amplifica ondas sonoras. UsuÃ¡rio/alvo completamente silencioso.',
          progressao:[
            { nivel:1, nome:'Abafamento AcÃºstico', desc:'UsuÃ¡rio/alvo silencioso â€” âˆ’2 em percepÃ§Ã£o auditiva. CondiÃ§Ã£o: Furtivo (sonoramente).' },
            { nivel:3, nome:'Mesa de Som', desc:'Aumenta ou reduz volume de alvos afetados pelo Hatsu.' },
            { nivel:4, nome:'Pulso de RessonÃ¢ncia', desc:'RuÃ­do de alta frequÃªncia â€” Desorientado imediato + pode quebrar objetos frÃ¡geis (PV â‰¤ 10).' },
            { nivel:7, nome:'VibraÃ§Ã£o Perfurante', desc:'PressÃ£o fÃ­sica â€” dano ignora RD fÃ­sico e âˆ’2 em CON por danos internos.' },
            { nivel:10, nome:'Grito de RuÃ­na', desc:'Volume ensurdecedor â€” alvo fica Surdo e âˆ’10 na Sanidade.' },
          ]},
        { id:'dinamo', nome:'Dinamo/Conversor', icon:'âš™ï¸', cor:'#a78bfa',
          efeito:'Converte caracterÃ­sticas de combate entre si.',
          progressao:[
            { nivel:1, nome:'Vida a Todo Custo', desc:'Converte para 10 PV: 30% Aura OU 7 CA OU 5 ReaÃ§Ãµes OU 4 Atributos.' },
            { nivel:4, nome:'DomÃ­nio de ConversÃ£o (PV)', desc:'20 PV â†’ 5% Aura; 15 PV â†’ 1 CA; 10 PV â†’ 1 Atributo ou ReaÃ§Ã£o.' },
            { nivel:4, nome:'DomÃ­nio de ConversÃ£o (CA)', desc:'4 CA â†’ 5% Aura; 4 CA â†’ 1 ReaÃ§Ã£o.' },
            { nivel:4, nome:'DomÃ­nio de ConversÃ£o (Atributo)', desc:'4 Atributos â†’ 10% Aura; 2 Atributos â†’ 2 ReaÃ§Ãµes.' },
            { nivel:7, nome:'Masoquista', desc:'Converte dano recebido: 20 dano â†’ 1 Atrib./CA/ReaÃ§Ã£o OU 3 RD do tipo OU 5% Aura.' },
            { nivel:10, nome:'Energia RenovÃ¡vel', desc:'Reduz custo na metade OU dobra o efeito das conversÃµes.' },
          ]},
        { id:'scanner', nome:'Scanner', icon:'ðŸ”­', cor:'#38bdf8',
          efeito:'Identifica CA, RDs e detalhes de alvos apÃ³s contato.',
          progressao:[
            { nivel:1, nome:'Leitura AvanÃ§ada', desc:'Identifica CA e RDs apÃ³s atingir OU descobre nome, altura, peso e detalhes simples. CondiÃ§Ã£o: Exposto.' },
            { nivel:1, nome:'Varredura Visual', desc:'Identifica reaÃ§Ãµes de alvos ou mecanismos â€” +5 para destrancar/hackear/usar mecanismos.' },
            { nivel:4, nome:'Eco-LocalizaÃ§Ã£o e Bio-Leitura', desc:'Anula bÃ´nus e condiÃ§Ãµes de furtividade no alcance/Ã¡rea. CondiÃ§Ã£o: Exposto.' },
            { nivel:7, nome:'Raio-X de PrecisÃ£o', desc:'Avalia quantidade de aura OU Limiar MÃ­nimo de Dano de objeto/alvo.' },
            { nivel:10, nome:'Aura Exposta', desc:'VÃª alcance/Ã¡rea mÃ¡ximos de Hatsu OU duraÃ§Ã£o suportÃ¡vel OU imunidade a ilusÃµes e uso de IN.' },
          ]},
        { id:'antiad', nome:'AntiaderÃªncia', icon:'ðŸ«§', cor:'#e2e8f0',
          efeito:'AusÃªncia total de atrito. +2 em Esquiva e âˆ’2 em tentativas de Agarrar.',
          progressao:[
            { nivel:1, nome:'FricÃ§Ã£o Zero', desc:'AusÃªncia de atrito â€” +2 em Esquiva, tentativas de Agarrar/Imobilizar tÃªm âˆ’2.' },
            { nivel:1, nome:'MenÃ³ Deslizante', desc:'PÃ©s do alvo deslizam â€” +3m de deslocamento (usuÃ¡rio) OU terreno difÃ­cil e escorregadio (alvo), TR DES ou CaÃ­do.' },
            { nivel:4, nome:'MalemolÃªncia', desc:'ForÃ§a "desliza" ao ser atingido por danos fÃ­sicos â€” RD = 5 + NÃ­vel do UsuÃ¡rio.' },
            { nivel:10, nome:'InÃ©rcia Absoluta', desc:'Alvo nÃ£o consegue firmar os pÃ©s â€” TR FOR ou ImÃ³vel. 2 rodadas: ExaustÃ£o 2 pelo desgaste.' },
          ]},
        { id:'reflexao', nome:'ReflexÃ£o/RefraÃ§Ã£o', icon:'ðŸªž', cor:'#c084fc',
          efeito:'Reflete luz perfeitamente. +2 em Esquiva e condiÃ§Ã£o Ofuscado ao atacante.',
          progressao:[
            { nivel:1, nome:'RefraÃ§Ã£o IlusÃ³ria', desc:'Distorce posiÃ§Ã£o real/imagem como miragem â€” +2 em Esquiva e Ofuscado ao atacante.' },
            { nivel:4, nome:'ReversÃ£o CinÃ©tica', desc:'Reflete 25% do dano fÃ­sico recebido de volta ao agressor â€” âˆ’2 em FOR no contragolpe.' },
            { nivel:4, nome:'Vultos de Aura', desc:'CÃ³pias residuais ao mover â€” alvo faz percepÃ§Ã£o ou usuÃ¡rio fica Furtivo/Oculto.' },
            { nivel:7, nome:'Espelho PrismÃ¡tico', desc:'Direciona luz ao alvo â€” TR CON ou Cego.' },
            { nivel:7, nome:'Pesadelo LÃºcido', desc:'Imagem invertida do alvo causa confusÃ£o. CondiÃ§Ã£o: Confuso.' },
            { nivel:10, nome:'Reflexo Perturbador', desc:'Miragem indistinguÃ­vel da realidade â€” TR SAB ou âˆ’10 de Sanidade.' },
          ]},
        { id:'ferrugem', nome:'Ferrugem', icon:'ðŸ”©', cor:'#b45309',
          efeito:'PartÃ­culas metÃ¡licas corroÃ­das atacam sentidos do alvo.',
          progressao:[
            { nivel:4, nome:'Poeira de Ferro', desc:'PartÃ­culas de metal corroÃ­do â€” alvo pode ficar Asfixiado ou Cego.' },
            { nivel:7, nome:'DegradaÃ§Ã£o de Ferro SanguÃ­neo', desc:'Ferrugem no sangue â€” âˆ’2 em CON e VulnerÃ¡vel a danos Cortantes e Perfurantes.' },
            { nivel:10, nome:'CorrosÃ£o Estrutural', desc:'DecompÃµe metais molecularmente â€” armas/equipamentos ficam VulnerÃ¡veis passivamente.' },
          ]},
        { id:'intang', nome:'Intangibilidade', icon:'ðŸ‘»', cor:'#818cf8',
          efeito:'Natureza etÃ©rea â€” pode tornar parte do corpo ou objeto pequeno intangÃ­vel.',
          progressao:[
            { nivel:1, nome:'Fluidez Molecular', desc:'Torna objeto pequeno ou parte do corpo intangÃ­vel. Imune a danos fÃ­sicos nessa parte.' },
            { nivel:4, nome:'Dois Corpos NÃ£o Ocupam...', desc:'Desfaz intangibilidade durante ataque â€” dano interno ignorando RD fÃ­sica ao expelir a parte.' },
            { nivel:7, nome:'Ghost', desc:'Todo o corpo intangÃ­vel â€” atravessa superfÃ­cies. Imune a danos fÃ­sicos e incapaz de causar dano fÃ­sico.' },
            { nivel:10, nome:'ExÃ­lio Dimensional', desc:'Projeta intangibilidade no alvo â€” incapaz de tocar ou respirar. âˆ’15 Sanidade/rodada. InterrompÃ­vel com aÃ§Ã£o livre.' },
          ]},
        { id:'magnetismo', nome:'Magnetismo', icon:'ðŸ§²', cor:'#f472b6',
          efeito:'Campo magnÃ©tico trava armaduras metÃ¡licas. âˆ’2 em DES e FOR.',
          progressao:[
            { nivel:4, nome:'CÃ¡rcere de Ferro', desc:'Trava armaduras/equipamentos metÃ¡licos â€” âˆ’2 em DES e FOR.' },
            { nivel:7, nome:'Mutante Ã”mega', desc:'Objetos magnetizados (tamanho mÃ©dio) manipulados por telecinese.' },
            { nivel:10, nome:'Colapso MagnÃ©tico', desc:'Campo intenso interfere em impulsos elÃ©tricos cerebrais â€” ExaustÃ£o 1 e âˆ’5 Sanidade.' },
          ]},
        { id:'peso', nome:'Peso/Gravidade', icon:'âš–ï¸', cor:'#94a3b8',
          efeito:'Densidade sÃºbita no ponto de contato. Â±1,5m de deslocamento.',
          progressao:[
            { nivel:1, nome:'G~10m/sÂ²', desc:'Penalidade ou bÃ´nus de 1,5m no deslocamento OU objetos ganham/perdem 1 de peso. CondiÃ§Ã£o: Lento.' },
            { nivel:4, nome:'PressÃ£o Esmagadora', desc:'Campo de gravidade aumentada â€” âˆ’2 em FOR e TR para nÃ£o cair. CondiÃ§Ã£o: CaÃ­do.' },
            { nivel:7, nome:'Excalibur', desc:'Aumenta peso de objeto para uso com 2 mÃ£os + TR de ForÃ§a para manuseÃ¡-lo.' },
            { nivel:10, nome:'Gravidade G-Force', desc:'PressÃ£o interna dificulta circulaÃ§Ã£o/respiraÃ§Ã£o â€” ExaustÃ£o 2 e âˆ’5 em CON.' },
          ]},
        { id:'luz', nome:'Luz/TransparÃªncia/EscuridÃ£o', icon:'ðŸ’¡', cor:'#fde68a',
          efeito:'Descarga sÃºbita de luz. TR CON ou Desorientado e Desprevenido.',
          progressao:[
            { nivel:4, nome:'Flash EstroboscÃ³pico', desc:'Descarga de luz intensa â€” TR CON ou Desorientado e Desprevenido.' },
            { nivel:7, nome:'Vazio Obscuro', desc:'EscuridÃ£o absoluta em Ã¡rea â€” imune a golpes mirados. Concede Furtividade/Oculto, InvisÃ­vel ou Ofuscado.' },
          ]},
        { id:'vibracao', nome:'VibraÃ§Ã£o', icon:'ðŸ“³', cor:'#34d399',
          efeito:'VibraÃ§Ã£o desestabiliza equilÃ­brio. âˆ’1 em DES e Lento.',
          progressao:[
            { nivel:1, nome:'OscilaÃ§Ã£o de Contato (Gura-Gura)', desc:'FrequÃªncia que desestabiliza equilÃ­brio â€” âˆ’1 DES e Lento. Em Ã¡rea: terreno difÃ­cil.' },
            { nivel:4, nome:'Ruptura de ProteÃ§Ã£o', desc:'FrequÃªncia de ressonÃ¢ncia â€” ataques ignoram RD de armaduras e de aura.' },
            { nivel:7, nome:'Choque de Ã“rgÃ£os', desc:'VibraÃ§Ã£o penetra corpo â€” âˆ’2 em CON e condiÃ§Ã£o Enjoado por sangramento interno.' },
          ]},
        { id:'cura', nome:'Cura/RecuperaÃ§Ã£o', icon:'ðŸ’š', cor:'#4ade80',
          efeito:'AdesÃ£o biolÃ³gica â€” fecha ferimentos e interrompe sangramentos.',
          progressao:[
            { nivel:1, nome:'Sutura Bio-ElÃ¡stica', desc:'Fecha ferimentos imediatamente â€” interrompe Sangramentos e +2 em CON para estabilizaÃ§Ã£o.' },
            { nivel:4, nome:'Filtro Antitoxina', desc:'Neutraliza nocividade quÃ­mica/natural/aura â€” remove Envenenado ou Sangramento.' },
            { nivel:7, nome:'Harmonia Vital', desc:'FrequÃªncia de restauraÃ§Ã£o â€” remove ExaustÃ£o 3 e recupera +5 de Sanidade.' },
            { nivel:10, nome:'Medicina de Varvard', desc:'Recupera desmembramentos feitos em atÃ© 1 semana.' },
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
    if (lvl >= 5)  return 14; // nÃ­vel 5 = 6+2+2+2+2 = 14
    if (lvl >= 4)  return 12;
    if (lvl >= 3)  return 10;
    if (lvl >= 2)  return 8;
    return 6; // nÃ­vel 1
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  HATSU_DB â€” todos os dados direto do manual
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
