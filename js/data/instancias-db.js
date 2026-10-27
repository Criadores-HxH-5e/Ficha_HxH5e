// ── Instâncias Shingen-Ryu (Manual v2.0, cap. 4) ─────────────────────────────
// As Instâncias são o treinamento de Nen da escola Shingen-Ryu. Não existiam no app:
// nem dado, nem tela. Duas regras definem como entram:
//
// 1. CUSTO EM P.N, não em Pontos de Inclinação: 2 P.N no Nível 1 e 3 P.N no Nível 2 —
//    o mesmo P.N usado em Hatsus e Princípios. Por isso o gasto é somado dentro de
//    calcPNSpentInDominio (nen-affinity.js), que é por onde TODO cálculo de P.N
//    disponível do app já passa. Somar em outro lugar criaria um orçamento paralelo.
// 2. Cada Instância exige treino em Inclinações de Combate. Os requisitos do livro
//    misturam "e" com "ou", então são descritos em árvore (avaliarRequisitoInstancia)
//    em vez de uma lista plana, que não daria conta de "(A ou B) e (C, D ou E)".
//
// Personagens sem Nen não compram Instâncias. Quem já as possui pode usá-las mesmo
// em Zetsu ou sem Nen — isso é narrativa de mesa, não muda nada no cálculo.

// Grupos que o livro cita de forma coletiva ("Defensiva (qualquer)", "Ofensiva (qualquer)").
window.INST_GRUPO_DEFENSIVA = ['defensiva_bruta', 'defensiva_precisa', 'defensiva_reativa_agil'];
window.INST_GRUPO_OFENSIVA  = ['ofensiva_agil', 'ofensiva_bruta', 'ofensiva_precisa'];

// Açúcar para montar os requisitos sem repetir estrutura.
// umDe([...ids], nivel) → qualquer um daqueles ids no nível pedido.
(function () {
    const umDe = function (ids, nivel) {
        return { modo: 'OU', itens: ids.map(function (id) { return { inc: id, nivel: nivel }; }) };
    };
    const E  = function () { return { modo: 'E',  itens: Array.prototype.slice.call(arguments) }; };
    const OU = function () { return { modo: 'OU', itens: Array.prototype.slice.call(arguments) }; };
    const inc = function (id, nivel) { return { inc: id, nivel: nivel }; };
    const DEF = window.INST_GRUPO_DEFENSIVA, OFE = window.INST_GRUPO_OFENSIVA;

    // Níveis: 1 = Básico, 2 = Intermediário, 3 = Maestria.
    window.INSTANCIAS_DB = [
        {
            id: 'agil',
            nome: 'Ágil',
            reqTexto: 'Perceptiva Maestria ou Visão 360º Básico.',
            requisitos: OU(inc('perceptiva', 3), inc('visao_360', 1)),
            niveis: [
                '+2 na Esquiva e na Esquiva Acrobática.',
                'Quem te ataca tem −3 no acerto.',
            ],
        },
        {
            id: 'assassino_veterano',
            nome: 'Assassino Veterano',
            reqTexto: '(Ofensiva Ágil Básica ou Ofensiva Precisa Intermediária) e (Analítica, Perceptiva ou Trapaceira Básica).',
            requisitos: E(
                OU(inc('ofensiva_agil', 1), inc('ofensiva_precisa', 2)),
                umDe(['analitica', 'perceptiva', 'trapaceira'], 1)
            ),
            niveis: [
                '+1 ação de movimento.',
                'Crítico em 18+.',
            ],
        },
        {
            id: 'atirador_de_elite',
            nome: 'Atirador de Elite',
            reqTexto: 'Ofensiva Precisa Intermediária e (Perceptiva, Analítica ou Visão 360º Básica).',
            requisitos: E(
                inc('ofensiva_precisa', 2),
                umDe(['perceptiva', 'analitica', 'visao_360'], 1)
            ),
            niveis: [
                'Seus ataques à distância não sofrem desvantagem entre a distância normal e a máxima da arma, e ignoram meia cobertura.',
                'Use sua Reação para fazer um ataque à distância contra um inimigo, dentro da distância normal da arma, logo depois que ele se mover ou atacar. Esse ataque não custa sua próxima Ação Principal.',
            ],
        },
        {
            id: 'combatente_rapido',
            nome: 'Combatente Rápido',
            reqTexto: '(A) Ofensiva Ágil ou Precisa Maestria e Defensiva (qualquer) Intermediária; ou (B) Defensiva (qualquer) Maestria e Ofensiva Ágil ou Precisa Intermediária.',
            requisitos: OU(
                E(umDe(['ofensiva_agil', 'ofensiva_precisa'], 3), umDe(DEF, 2)),
                E(umDe(DEF, 3), umDe(['ofensiva_agil', 'ofensiva_precisa'], 2))
            ),
            niveis: [
                'Usa Inclinações Ofensivas com armas de Acuidade.',
                '+2 na CA ou Ações de Esquivas.',
            ],
        },
        {
            id: 'combatente_tanque',
            nome: 'Combatente Tanque',
            etiquetas: ['TEN'],
            reqTexto: '(A) Ofensiva (qualquer) Maestria e Defensiva (qualquer) Intermediária; ou (B) Defensiva (qualquer) Maestria e Ofensiva (qualquer) Intermediária; ou (C) (Mestre de Armas ou Mestre de Armas Grandes Intermediário) e (Maestria em Armadura Média, Pesada ou Mestre de Escudo Intermediário).',
            requisitos: OU(
                E(umDe(OFE, 3), umDe(DEF, 2)),
                E(umDe(DEF, 3), umDe(OFE, 2)),
                E(
                    umDe(['mestre_de_armas', 'mestre_de_armas_grandes'], 2),
                    umDe(['maestria_armadura_media', 'maestria_armadura_pesada', 'mestre_de_escudo'], 2)
                )
            ),
            niveis: [
                '+5 na RD do seu TEN.',
                '+1 ataque ao usar a Ação Principal para atacar com jogadas de acerto (mesmo com Hatsu).',
            ],
        },
        {
            id: 'estrategista',
            nome: 'Estrategista',
            // Requisito do livro: "Tática Intermediária E (Analítica, Experiente ou
            // Perceptiva Básica)". A inclinação Tática está pendente de escrita no
            // capítulo, e por decisão do Lucas (27/10) o requisito do livro entra como
            // está — com a consequência aceita: enquanto `tatica` não existir em
            // COMBAT_INCLINATIONS_DB, NINGUÉM consegue treinar Estrategista, porque o
            // primeiro item do E nunca é satisfeito.
            // Quem JÁ tem a Instância em char.instancias não perde nada: o requisito
            // governa a compra, não o uso. E quando a Tática entrar no banco com os seus
            // 3 níveis, isto passa a funcionar sem nenhuma alteração aqui.
            reqTexto: 'Tática Intermediária e (Analítica, Experiente ou Perceptiva Básica). ⚠ A inclinação Tática ainda não existe no capítulo: até ela ser escrita, esta Instância fica indisponível.',
            requisitos: E(
                inc('tatica', 2),
                umDe(['analitica', 'experiente', 'perceptiva'], 1)
            ),
            niveis: [
                'Depois de rolar a iniciativa, troque sua posição na ordem com a de um aliado disposto.',
                'Quando um aliado a até 9 m que possa te ouvir for atacado, use sua Reação para dar vantagem na Reação dele contra esse ataque.',
            ],
        },
        {
            id: 'executor',
            nome: 'Executor',
            reqTexto: 'Decisiva Intermediária e (Cirúrgica, Ofensiva Bruta ou Mestre de Armas Grandes Básica).',
            requisitos: E(
                inc('decisiva', 2),
                umDe(['cirurgica', 'ofensiva_bruta', 'mestre_de_armas_grandes'], 1)
            ),
            niveis: [
                'O golpe decisivo ganha +1 na margem de crítico (Crítico 19, ou 18 se a arma já tiver Crítico).',
                'O golpe decisivo ignora a RD do TEN/KEN do alvo.',
            ],
        },
        {
            id: 'guardiao',
            nome: 'Guardião',
            reqTexto: 'Guardiã Intermediária e (Inabalável, Defensiva Bruta ou Mestre de Escudo Básico).',
            requisitos: E(
                inc('guardia', 2),
                umDe(['inabalavel', 'defensiva_bruta', 'mestre_de_escudo'], 1)
            ),
            niveis: [
                'Ao Assumir Lugar com resultado IGUAL ou MAIOR, você não perde a próxima Ação Principal.',
                'Ao Assumir Lugar com resultado MAIOR, faça um ataque corpo a corpo contra o atacante na mesma Reação, se ele estiver no seu alcance.',
            ],
        },
        {
            id: 'mestre_do_fluxo',
            nome: 'Mestre do Fluxo',
            reqTexto: 'Fluida Intermediária e (Defensiva Reativa-Ágil, Ofensiva Ágil ou Perceptiva Básica).',
            requisitos: E(
                inc('fluida', 2),
                umDe(['defensiva_reativa_agil', 'ofensiva_agil', 'perceptiva'], 1)
            ),
            niveis: [
                'Todo Contra-ataque bem-sucedido custa sua próxima Ação Bônus, em vez da próxima Ação Principal.',
                '1x por rodada, qualquer reação sua possui +2 no resultado.',
            ],
        },
        {
            id: 'observador',
            nome: 'Observador',
            reqTexto: 'Perceptiva Maestria; Experiente Intermediária; ou Analítica Intermediária.',
            requisitos: OU(
                inc('perceptiva', 3),
                inc('experiente', 2),
                inc('analitica', 2)
            ),
            niveis: [
                '+3 para acertar.',
                '−3 em ataques e contra-ataques de alvos que você observou por 1 rodada inteira.',
            ],
        },
    ];
})();

// Custo em P.N por nível da Instância: 2 no Nível 1, 3 no Nível 2.
window.INSTANCIA_CUSTO_PN = [2, 3];

// Avalia a árvore de requisitos contra char.combatInclinations.
// { inc, nivel } é a folha; { modo:'E'|'OU', itens:[...] } combina.
window.avaliarRequisitoInstancia = function (req, ci) {
    if (!req) return true;
    const invest = ci || {};
    if (req.inc) return (parseInt(invest[req.inc]) || 0) >= (req.nivel || 1);
    const itens = req.itens || [];
    if (!itens.length) return true;
    if (req.modo === 'OU') {
        return itens.some(function (r) { return window.avaliarRequisitoInstancia(r, invest); });
    }
    return itens.every(function (r) { return window.avaliarRequisitoInstancia(r, invest); });
};

// P.N já gasto em Instâncias. Entra no mesmo bolo dos Princípios e Hatsus.
window.calcPNSpentInInstancias = function (char) {
    const inst = (char || {}).instancias || {};
    let spent = 0;
    Object.keys(inst).forEach(function (id) {
        const n = Math.max(0, Math.min(2, parseInt(inst[id]) || 0));
        for (let i = 0; i < n; i++) spent += window.INSTANCIA_CUSTO_PN[i] || 0;
    });
    return spent;
};

// Mesma porta das Inclinações, mais a exigência de ter inclinação treinada:
// toda Instância do livro pede treino marcial, então sem nenhuma inclinação não há
// Instância possível e o jogador merece ler o motivo.
window.podeComprarInstancias = function (char) {
    const c = char || {};
    if ((parseInt(c.level) || 1) < 2) return { ok: false, motivo: 'Disponível a partir do Nível 2.' };
    // As Instâncias mantêm a exigência de Nen por conta própria. Antes isso vinha de
    // podeComprarInclinacoes, mas aquela porta deixou de exigir Nen quando Arsenal Militar
    // passou a ser treino marcial livre — e o livro é explícito: "Personagens sem Nen não
    // compram Instâncias".
    if (c.categoriaMetodo === 'semnen' || !c.class) {
        return { ok: false, motivo: 'Exige Nen: personagens sem categoria de Nen não compram Instâncias.' };
    }
    if (window.temPrincipioOuTecnica && !window.temPrincipioOuTecnica(c)) {
        return { ok: false, motivo: 'Desbloqueie ao menos 1 Princípio ou Técnica de Nen (Ten, Ren, Zetsu ou um avançado).' };
    }
    const ci = c.combatInclinations || {};
    const temAlguma = Object.keys(ci).some(function (k) { return (parseInt(ci[k]) || 0) > 0; });
    if (!temAlguma) {
        return { ok: false, motivo: 'Treine ao menos uma Inclinação de Combate: toda Instância exige inclinação como requisito.' };
    }
    return { ok: true, motivo: '' };
};
