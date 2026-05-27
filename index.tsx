import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Flame, 
  Sparkles, 
  Shield, 
  Target, 
  Cpu, 
  Zap, 
  ChevronRight, 
  RotateCcw,
  Loader2,
  ScrollText,
  Sword,
  ShieldCheck,
  BrainCircuit,
  Dice5,
  Plus,
  Minus,
  Coins,
  Lock,
  ZapOff,
  AlertTriangle,
  Info,
  ArrowLeft,
  ShoppingBag,
  Skull
} from 'lucide-react';

// --- ESTRUTURAS DE DADOS DO MANUAL ---

type NenType = 'Reforço' | 'Transmutação' | 'Materialização' | 'Emissão' | 'Manipulação' | 'Especialização';

interface Effect {
  name: string;
  desc: string;
  cost: number;
  level: number;
  category: 'Geral' | NenType;
}

interface Restriction {
  label: string;
  level: 'Leve' | 'Moderada' | 'Pesada' | 'Extrema' | 'Variável';
  desc: string;
  benefit: string;
  phBonus?: number;
  attackBonus?: number;
}

const NEN_CONFIG: Record<NenType, { icon: any; color: string; mod: string; affinities: Record<string, number> }> = {
  'Reforço': { icon: Flame, color: '#ef4444', mod: 'FOR', affinities: { 'Reforço': 100, 'Transmutação': 80, 'Emissão': 80, 'Materialização': 60, 'Manipulação': 60, 'Especialização': 0 } },
  'Transmutação': { icon: Sparkles, color: '#f59e0b', mod: 'SAB/INT', affinities: { 'Reforço': 80, 'Transmutação': 100, 'Materialização': 80, 'Emissão': 60, 'Manipulação': 40, 'Especialização': 0 } },
  'Materialização': { icon: Shield, color: '#10b981', mod: 'INT', affinities: { 'Reforço': 60, 'Transmutação': 80, 'Materialização': 100, 'Manipulação': 60, 'Emissão': 40, 'Especialização': 1 } },
  'Especialização': { icon: Cpu, color: '#8b5cf6', mod: '(CAR+INT+1)/2', affinities: { 'Reforço': 40, 'Transmutação': 60, 'Materialização': 80, 'Especialização': 100, 'Manipulação': 80, 'Emissão': 60 } },
  'Manipulação': { icon: Target, color: '#3b82f6', mod: 'INT/CAR', affinities: { 'Reforço': 60, 'Transmutação': 40, 'Materialização': 60, 'Manipulação': 100, 'Emissão': 80, 'Especialização': 1 } },
  'Emissão': { icon: Zap, color: '#ec4899', mod: 'DES', affinities: { 'Reforço': 80, 'Transmutação': 60, 'Materialização': 40, 'Manipulação': 80, 'Emissão': 100, 'Especialização': 0 } },
};

const GENERAL_EFFECTS: Effect[] = [
  { name: "Aumento de Alcance", desc: "+1,5m alcance (Máx 3x)", cost: 1, level: 1, category: 'Geral' },
  { name: "Aumento de Duração", desc: "+1 rodada extra", cost: 1, level: 1, category: 'Geral' },
  { name: "Ativação Rápida", desc: "Ação Principal -> Ação Bônus", cost: 1, level: 1, category: 'Geral' },
  { name: "Ajuste de Forma", desc: "Cone, linha ou esfera 1,5m", cost: 1, level: 2, category: 'Geral' },
  { name: "Condição Perigosa", desc: "Aplica 1 condição por 1 rodada", cost: 1, level: 1, category: 'Geral' },
  { name: "Dano/Cura Focal", desc: "+1 grau de dano/cura", cost: 1, level: 5, category: 'Geral' },
  { name: "Dor pra disgrama!", desc: "Dano contínuo a cada rodada", cost: 1, level: 5, category: 'Geral' },
  { name: "Experiência Comprovada", desc: "Dobra alcance ou evolui duração", cost: 3, level: 6, category: 'Geral' },
  { name: "Poder Valioso", desc: "+1 Grau de Potência", cost: 2, level: 1, category: 'Geral' },
  { name: "Redução de Custo", desc: "-5% custo de aura", cost: 1, level: 1, category: 'Geral' },
  { name: "Flagelo da Mente", desc: "1d8 dano psíquico (Sanidade)", cost: 1, level: 2, category: 'Geral' },
];

const REFORCO_EFFECTS: Effect[] = [
  { name: "Aumento de Atributo", desc: "+2 em atributo (Máx +5)", cost: 1, level: 1, category: 'Reforço' },
  { name: "Intensificação", desc: "+1 Grau de Potência", cost: 1, level: 1, category: 'Reforço' },
  { name: "Recuperação Veloz", desc: "Cura 1d8 + CON", cost: 1, level: 1, category: 'Reforço' },
  { name: "Pele de Pedra", desc: "3 RD vs Impacto/Perfurante/Cortante", cost: 1, level: 2, category: 'Reforço' },
  { name: "Golpe Reforçado", desc: "+1d8 extra no dano", cost: 1, level: 3, category: 'Reforço' },
  { name: "Onda Surda", desc: "Choque que ignora parte da defesa", cost: 1, level: 4, category: 'Reforço' },
  { name: "Barreira Interna", desc: "5 RD vs Energia/Elemental", cost: 1, level: 5, category: 'Reforço' },
  { name: "Soco Demolidor", desc: "Vantagem e ignora resistências físicas", cost: 1, level: 5, category: 'Reforço' },
  { name: "Força Descomunal", desc: "Ao gastar 15% aura, dobra bônus de FOR", cost: 2, level: 12, category: 'Reforço' },
];

const TRANSMUTACAO_EFFECTS: Effect[] = [
  { name: "Aura Perigosa Comum", desc: "Propriedade: Cortante, Perfurante, Impacto ou Energia (aura pura)", cost: 1, level: 1, category: 'Transmutação' },
  { name: "Memory Card", desc: "Grava até 5s de estímulo sensorial (máx. 3) e reproduz como projeção", cost: 1, level: 1, category: 'Transmutação' },
  { name: "Polígrafo", desc: "Vantagem em Intuição e +1 contra blefes/manipulações verbais", cost: 1, level: 1, category: 'Transmutação' },
  { name: "Transmutação Elemental", desc: "Escolhe 1 elemento e adiciona sua propriedade inicial", cost: 1, level: 1, category: 'Transmutação' },
  { name: "Transmutação Versátil", desc: "Escolhe 1 Propriedade de Utilidade (máx. 2)", cost: 1, level: 1, category: 'Transmutação' },
  { name: "Forma Esculpida Maleável", desc: "Aura assume forma qualquer (1,5x1,5m) em estado líquido, gasoso ou sólido", cost: 1, level: 2, category: 'Transmutação' },
  { name: "Superfície Adesiva", desc: "Aura cola superfícies; escala 9m verticais (5% aura/3m)", cost: 1, level: 2, category: 'Transmutação' },
  { name: "Anticoagulante", desc: "Golpe aplica sangramento leve (2d4) em alvo ferido", cost: 1, level: 3, category: 'Transmutação' },
  { name: "Concussão Leve", desc: "TR de CON ou –2 em Percepção/Reações (req: Aura Perigosa Concussivo)", cost: 1, level: 3, category: 'Transmutação' },
  { name: "Corte Irritante", desc: "Feridas penalizam concentração em -2 por corte (req: Aura Cortante)", cost: 1, level: 3, category: 'Transmutação' },
  { name: "Estaca Furadeira", desc: "Ignora 5 de RD e ½ Cobertura (req: Aura Perfurante)", cost: 1, level: 3, category: 'Transmutação' },
  { name: "Pegar ou Largar", desc: "Propriedade Agarrar/Prender; TR de FOR (req: Adesiva ou Maleável)", cost: 1, level: 3, category: 'Transmutação' },
  { name: "Condutividade de Aura", desc: "Hatsu percorre superfícies (5% aura a cada 3m)", cost: 1, level: 4, category: 'Transmutação' },
  { name: "Aura Perigosa Incomum", desc: "Propriedade: Rigidez (+1 Bloqueio), Dispersão (Spray 1,5m) ou Explosivo", cost: 2, level: 6, category: 'Transmutação' },
  { name: "Hemorragia Oculta", desc: "Ferimentos parecem superficiais mas causam hemorragia interna (2d8)", cost: 2, level: 6, category: 'Transmutação' },
  { name: "Ferida Interna", desc: "Alvo com <½ PV: +5 dano + TR de CON ou Sangramento Forte (2d10)", cost: 2, level: 8, category: 'Transmutação' },
  { name: "Golpe Perfurante Mortal", desc: "Superar CA em 5 prende parte do alvo numa superfície automaticamente", cost: 2, level: 10, category: 'Transmutação' },
];

const MATERIALIZACAO_EFFECTS: Effect[] = [
  { name: "Forjar Objeto/Arma/Equipamento", desc: "Cria objeto real com propriedades de um verdadeiro; causa 2d6 (arma)", cost: 1, level: 1, category: 'Materialização' },
  { name: "Golem de Aura", desc: "Cria constructo pequeno (PV=5+CONx2, 1 ação/rodada, 1 Característica)", cost: 2, level: 1, category: 'Materialização' },
  { name: "Características Básicas", desc: "Adiciona 1 Característica de Invocação à conjuração", cost: 1, level: 1, category: 'Materialização' },
  { name: "Dimensão de Bolso", desc: "Envia até 3 objetos/criaturas para dimensão interna (req: Característica Dimensão)", cost: 1, level: 1, category: 'Materialização' },
  { name: "Aparências Enganam", desc: "Acesso à Tabela de Conjuração com Alterações Físicas", cost: 1, level: 1, category: 'Materialização' },
  { name: "Conjuração Modular", desc: "Objetos/armas podem ser diferentes a cada conjuração; trocar = ação bônus", cost: 1, level: 2, category: 'Materialização' },
  { name: "Cópia Perfeita", desc: "Copia via conjuração objeto marcado/tocado com todas suas propriedades", cost: 2, level: 2, category: 'Materialização' },
  { name: "Imbuir Conjuração", desc: "Adiciona efeito de qualquer categoria (até seu nível, sem pré-requisitos; não Especialização)", cost: 2, level: 2, category: 'Materialização' },
  { name: "Pesos e Medidas", desc: "Reduz ou aumenta peso/tamanho da conjuração (metade ou dobro)", cost: 1, level: 2, category: 'Materialização' },
  { name: "Dano Complexo", desc: "+1 dado de dano ao empurrar inimigos com sucesso", cost: 1, level: 4, category: 'Materialização' },
  { name: "Vínculo Sustentado", desc: "Hatsu dura enquanto concentrar e gastar 5% aura/2 rodadas", cost: 2, level: 4, category: 'Materialização' },
  { name: "Aura Condensada", desc: "Item armazena 10% aura para liberar depois como +1d8 dano ou 1d8 RD", cost: 1, level: 5, category: 'Materialização' },
  { name: "Forja Avançada", desc: "Gasta ação bônus: arma ganha +1d8", cost: 1, level: 5, category: 'Materialização' },
  { name: "Forma Evoluída", desc: "+10 PV, +2 CA e 1 Característica de Invocação adicional", cost: 2, level: 6, category: 'Materialização' },
  { name: "Lugar Secreto", desc: "Dimensão como espaço 12x12m com composição predefinida (req: Dimensão)", cost: 1, level: 6, category: 'Materialização' },
  { name: "Invencível", desc: "Não pode ser destruída/desfeita pelo usuário ou duração; +2 atributos máximos temp. (req: 2 Pesadas ou 1 Extrema)", cost: 3, level: 6, category: 'Materialização' },
  { name: "Proativo", desc: "Conjuração realiza 1 ataque extra consumindo reações do usuário", cost: 2, level: 7, category: 'Materialização' },
  { name: "Encantamento Especializado", desc: "Escolhe propriedade: Desarmar, Mortal x3 ou Oculto/Finta", cost: 2, level: 8, category: 'Materialização' },
  { name: "Fusão ou Divisão de Constructos", desc: "Fundir: +10 PV, une habilidades, +1 grau. Dividir: -10 PV, -5 CA, -1 grau", cost: 2, level: 8, category: 'Materialização' },
  { name: "Constructo Apex", desc: "+1 Ação Principal à criatura e 1 efeito de outra categoria", cost: 3, level: 11, category: 'Materialização' },
  { name: "Relíquia Viva", desc: "Artefato se torna permanente; só pode ser desfeito sendo destruído", cost: 3, level: 12, category: 'Materialização' },
];

const ESPECIALIZACAO_EFFECTS: Effect[] = [
  { name: "Ajuste Improvisado", desc: "Usa temporariamente 1 efeito de outra categoria por 1 rodada", cost: 1, level: 1, category: 'Especialização' },
  { name: "Combinação Perigosa", desc: "Seleciona até 3 efeitos de até 3 categorias diferentes de uma só vez", cost: 1, level: 1, category: 'Especialização' },
  { name: "Imitação Temporária", desc: "Copia um Hatsu conhecido para 1 uso descartável", cost: 1, level: 1, category: 'Especialização' },
  { name: "Mente Aberta", desc: "Escolhe 1 efeito da tabela de Memórias", cost: 1, level: 1, category: 'Especialização' },
  { name: "Necromancia", desc: "Desperta alvo morto (consciência/memória) por 1 rodada, sem TR para interrogatório", cost: 2, level: 1, category: 'Especialização' },
  { name: "Oráculo", desc: "Escolhe 1 efeito da tabela de Previsões e Clarividência", cost: 1, level: 1, category: 'Especialização' },
  { name: "Controle do Tempo", desc: "Escolhe 1 efeito da tabela de Fluxo Temporal ou Tempo de Vida", cost: 2, level: 1, category: 'Especialização' },
  { name: "Refração de Aura", desc: "Reação ao receber dano de Hatsu: desvia 50% do dano para alvo próximo (3m)", cost: 1, level: 1, category: 'Especialização' },
  { name: "Afinidade Temporária", desc: "Considera-se de outra categoria para um único Hatsu", cost: 1, level: 1, category: 'Especialização' },
  { name: "Forçar Destino", desc: "Rola 1d20 e guarda o número; substitui qualquer rolagem (1x/dia)", cost: 1, level: 2, category: 'Especialização' },
  { name: "Corrupção de Aura", desc: "Danos com aura pura causam dano de Sanidade (máx: ½ nível+1/rodada)", cost: 1, level: 3, category: 'Especialização' },
  { name: "Reprodução Imperfeita", desc: "Copia permanentemente Hatsu com -1d6 dano/cura ou -2 em TRs/CDs (req: Imitação Temporária)", cost: 2, level: 3, category: 'Especialização' },
  { name: "Tomar Efeito Extra", desc: "Escolhe 2 efeitos gerais adicionais ou repete 1 efeito no mesmo nível (máx. 2 usos)", cost: 2, level: 3, category: 'Especialização' },
  { name: "Destino Vinculado", desc: "Quando sofre um efeito, o alvo do seu Hatsu também sofre", cost: 2, level: 4, category: 'Especialização' },
  { name: "Empréstimo", desc: "Contrato verbal/textual em Nen: recebe ou empresta 1 Hatsu a 1 alvo", cost: 2, level: 5, category: 'Especialização' },
  { name: "Falsificação de Aura", desc: "Sua aura simula outra categoria recebendo benefícios em princípios e técnicas", cost: 2, level: 5, category: 'Especialização' },
  { name: "Palavra Proibida", desc: "TR de PRES: alvo fica impedido de usar 1 Hatsu", cost: 2, level: 5, category: 'Especialização' },
  { name: "Ignorar Limites (1x/dia)", desc: "Excede em 3 graus/passos os limites de Duração/Alcance/Área do Hatsu", cost: 2, level: 7, category: 'Especialização' },
  { name: "Resultado Efetivo", desc: "Copia permanentemente 1 característica em estado máximo de 1 Hatsu sofrido", cost: 3, level: 10, category: 'Especialização' },
  { name: "Drenar Aura", desc: "Ao contato direto, drena 5% da aura do alvo", cost: 3, level: 12, category: 'Especialização' },
];

const MANIPULACAO_EFFECTS: Effect[] = [
  { name: "Controle Simples de Objetos (C.S.O)", desc: "Controla até 2 objetos pequenos/porções de matéria pela duração", cost: 1, level: 1, category: 'Manipulação' },
  { name: "Controle Simples de Criaturas (C.S.C)", desc: "Comando verbal; alvo tenta obedecer pela duração. Novo comando = ação bônus", cost: 1, level: 1, category: 'Manipulação' },
  { name: "Distorção Sensorial", desc: "Alvo sofre: Cego, Surdo, Mudo ou Anosmico (req: C.S.C)", cost: 1, level: 1, category: 'Manipulação' },
  { name: "Marcar Vontade", desc: "Marca 1 alvo: 1 uso de vantagem ou desvantagem em efeitos de manipulação (req: C.S.C)", cost: 1, level: 1, category: 'Manipulação' },
  { name: "Comando Paralelo", desc: "Comandos individuais simultâneos a objetos manipulados (req: C.S.O, SAB/INT 3+)", cost: 1, level: 2, category: 'Manipulação' },
  { name: "Jogos Mentais", desc: "Aplica 1 ilusão simples; em combate: Furtivo no alvo e/ou Oculto a objetos/armas", cost: 1, level: 2, category: 'Manipulação' },
  { name: "Mente Frágil", desc: "Alvo sofre: Fragilizado, Desorientado ou Sanidade -3 (req: C.S.C)", cost: 1, level: 3, category: 'Manipulação' },
  { name: "Ordem Forçada Sutil", desc: "Comandos passam a ser mentais; comanda reações fora do turno (PRES 3+)", cost: 2, level: 4, category: 'Manipulação' },
  { name: "Encanto de Aura", desc: "Alvo passa a considerar o usuário como aliado (PRES 4+, req: C.S.C)", cost: 2, level: 5, category: 'Manipulação' },
  { name: "Fadiga Induzida", desc: "Alvo sofre: Abalado, Condenado, Enjoado ou Desorientado (req: C.S.C)", cost: 1, level: 5, category: 'Manipulação' },
  { name: "Marionete", desc: "a) Possui o corpo do alvo. b) Controla como expectador (req: C.S.C)", cost: 2, level: 5, category: 'Manipulação' },
  { name: "Intensidade Temporal", desc: "+10% aura: estende manipulação para 1min (combate) ou 2h (fora)", cost: 2, level: 7, category: 'Manipulação' },
  { name: "Marionete Improvisada", desc: "Une até 2 objetos para agir como criatura média com turno próprio (req: C.S.O)", cost: 2, level: 7, category: 'Manipulação' },
  { name: "Tamanho não é documento", desc: "Aplica C.S.O a 1 objeto médio (req: C.S.O)", cost: 1, level: 7, category: 'Manipulação' },
  { name: "Controle Superior", desc: "Novo comando + +1 em Testes/Ataques por escolha (+5 máx) (req: Comando Paralelo)", cost: 2, level: 8, category: 'Manipulação' },
  { name: "Marionete Tática", desc: "Escolhe 2 Características de Conjurações (Carapaça, Curandeira, Defensor, etc.)", cost: 2, level: 8, category: 'Manipulação' },
  { name: "Supressão da Personalidade", desc: "Impede uso de reações e Hatsus do alvo (CAR 5+)", cost: 3, level: 10, category: 'Manipulação' },
  { name: "Toy Story", desc: "Controle completo do alvo (incluindo Hatsu), qualquer tamanho", cost: 3, level: 12, category: 'Manipulação' },
];

const EMISSAO_EFFECTS: Effect[] = [
  { name: "Aura Viva", desc: "Cria até 2 massas de aura com turno: a) Portais; b) Criaturas/Objetos médios (PV e dano 1d6)", cost: 1, level: 1, category: 'Emissão' },
  { name: "Distância Segura", desc: "+6m ao alcance ou +3m a uma área", cost: 1, level: 1, category: 'Emissão' },
  { name: "Plano Avançado (Detonador)", desc: "Hatsu pode ser aplicado com marca prévia de ativação futura (5% aura)", cost: 1, level: 1, category: 'Emissão' },
  { name: "Projétil de Aura", desc: "Desprende aura em projétil balístico (mín. 1d8). Alternativa: cria munições para armas", cost: 1, level: 1, category: 'Emissão' },
  { name: "Transporte Abstrato", desc: "Transfere informações, sensações, condições ou efeitos para algo/alguém vinculado", cost: 1, level: 1, category: 'Emissão' },
  { name: "Transporte de Cargas", desc: "Transporta si e/ou alvo(s)/objetos marcados para 3m (mín). Dobro em metros usa mov. inteiro", cost: 1, level: 1, category: 'Emissão' },
  { name: "Empurrar e Puxar", desc: "Marca de aura ou ataque empurra/puxa alvo em 3m", cost: 1, level: 2, category: 'Emissão' },
  { name: "Stalker", desc: "Marca alvo e localiza por 1h/100m ou +1 para encontrar/acertar (máx. +3)", cost: 1, level: 2, category: 'Emissão' },
  { name: "Troca Estratégica", desc: "Reação: troca de lugar com constructo de aura ou aliado marcado", cost: 1, level: 2, category: 'Emissão' },
  { name: "Reformar Constructo", desc: "Divide constructo em 2 menores ou reconstrói 1 destruído (metade dos PVs)", cost: 1, level: 3, category: 'Emissão' },
  { name: "Unificação de Constructos", desc: "Dois constructos se fundem em 1 maior (soma PVs ou FOR) até fim do combate", cost: 1, level: 3, category: 'Emissão' },
  { name: "Ancoragem", desc: "Não pode ser movido contra a vontade por meios físicos; prende objeto no espaço", cost: 1, level: 4, category: 'Emissão' },
  { name: "Lugar Marcado", desc: "Ren em local/alvo (5%): teletransporta-se para a marca, qualquer distância", cost: 1, level: 4, category: 'Emissão' },
  { name: "Expansão de Domínio", desc: "a) Partindo de si: 6m cone/círculo/cil./linha. b) À distância: 3m", cost: 2, level: 5, category: 'Emissão' },
  { name: "Mira Concentrada", desc: "Vantagem no próximo ataque à distância a cada 10% aura gasto (não redutível)", cost: 1, level: 5, category: 'Emissão' },
  { name: "Mira Guiada", desc: "Projétil contorna/atravessa obstáculos simples e alvos estáticos no caminho (SAB 3+)", cost: 2, level: 5, category: 'Emissão' },
  { name: "Troca Dimensional", desc: "Troca de lugar com aliado, portal ou marca", cost: 2, level: 6, category: 'Emissão' },
  { name: "Núcleo Vinculante", desc: "Constructo canaliza aura para amplificar ataque/defesa, sacrificando-se", cost: 2, level: 8, category: 'Emissão' },
  { name: "Espaço Reverso", desc: "Rebate ataque de aura/Hatsu com dano de volta ao alvo (1x/combate, SAB 5+)", cost: 2, level: 8, category: 'Emissão' },
  { name: "Disparo Potente", desc: "+2d6 dano e +18m de alcance/área", cost: 3, level: 10, category: 'Emissão' },
  { name: "Tão Tão Distante", desc: "Alcance/área dobrado ou muda de categoria (metros→km, req: 2 Pesadas ou 1 Extrema)", cost: 2, level: 10, category: 'Emissão' },
];

const CATEGORY_EFFECTS_MAP: Partial<Record<NenType, Effect[]>> = {
  'Reforço': REFORCO_EFFECTS,
  'Transmutação': TRANSMUTACAO_EFFECTS,
  'Materialização': MATERIALIZACAO_EFFECTS,
  'Especialização': ESPECIALIZACAO_EFFECTS,
  'Manipulação': MANIPULACAO_EFFECTS,
  'Emissão': EMISSAO_EFFECTS,
};

// BANCO DE DADOS DE RESTRIÇÕES GERAIS (JSON COMPLETO)
const RESTRICTIONS_DB: Record<string, Restriction[]> = {
  'Geral': [
    // Leves
    { label: "Cálculo Pensado 1", level: 'Leve', desc: "Gasta +10% de aura", benefit: "+1 em Acerto ou Dano/Cura" },
    { label: "Cálculo Pensado 2", level: 'Leve', desc: "Reduz 2 Graus/Passos de dano", benefit: "Reduz em 5% o custo de aura" },
    { label: "Cálculo Pensado 3", level: 'Leve', desc: "-1 Grau de Potência", benefit: "+1 em Teste de Concentração" },
    { label: "Conhecimento do Alvo", level: 'Leve', desc: "Saber nome ou histórico (min 1 min)", benefit: "+1 na CD do TR" },
    { label: "Calibragem de Dano", level: 'Leve', desc: "Impõe um TR do próprio usuário para ativar", benefit: "+1 em Testes e TRs realizados" },
    { label: "Diálogo de Arma", level: 'Leve', desc: "Ativação depende de uma Arma Específica", benefit: "+1 Grau/Passo de Dano with this weapon" },
    { label: "Pré-Ativação Negativa 1", level: 'Leve', desc: "Receber condições leves/fracas", benefit: "Duração sem o alvo testar para se libertar" },
    { label: "Exaustão 1", level: 'Leve', desc: "Receber 1 nível de exaustão", benefit: "+1 Grau/Passo no Alcance ou Área" },
    { label: "Interação Sensorial", level: 'Leve', desc: "Ver, ouvir, tocar ou ser visto/ouvido", benefit: "3m Alcance ou 1,5m Área" },
    { label: "Limitação de Alvos", level: 'Leve', desc: "Limitar entre 3-5 alvos ou alcances > 6m", benefit: "+1 Dado de dano ou +1 condição" },
    { label: "Limitação de Movimento 1", level: 'Leve', desc: "Ação livre e não se mover no turno", benefit: "+1 em Jogadas de Acerto", attackBonus: 1 },
    { label: "Limitação de Movimento 2", level: 'Leve', desc: "Consome movimento + Teste de Aptidão", benefit: "+1 em Acerto ou +1 na CD do TR" },
    { label: "Objeto Canalizador", level: 'Leve', desc: "Só ativa com objeto específico", benefit: "Objeto recebe +2 CA ou +5 PV" },
    { label: "Posição Corporal", level: 'Leve', desc: "Manter pose específica (ex: mãos juntas)", benefit: "+1 em Testes para manter efeito" },
    { label: "Tempo de Carregamento", level: 'Leve', desc: "Ativa 1 rodada após declaração", benefit: "+1 Dado de dano ou +1 em Concentração" },
    // Moderadas
    { label: "Alvo Único em Combate", level: 'Moderada', desc: "Só usa em um único alvo até vencê-lo", benefit: "+2 Grau/Passo de Dano/Cura" },
    { label: "Área Definida", level: 'Moderada', desc: "Hatsu funciona em 1/3 ou menos da área total", benefit: "Reduz custo em 10% ou anula manutenção" },
    { label: "Chuck Norris", level: 'Moderada', desc: "Não pode utilizar armas", benefit: "Dano Desarmado recebe Mortal x4" },
    { label: "Conhecimento Profundo", level: 'Moderada', desc: "Entender funções de mecanismo próprio", benefit: "Habilita Conjuração com Alterações Físicas" },
    { label: "Conhecimento Profundo Alvo", level: 'Moderada', desc: "Descobrir funcionamento do Hatsu do alvo", benefit: "Ignora Resistências ou +2 na CD" },
    { label: "Pré-Ativação Negativa 2", level: 'Moderada', desc: "Amedrontado ou imobilizado consciente", benefit: "Pode refazer 2 rolagens de ataque/defesa" },
    { label: "Exaustão 2", level: 'Moderada', desc: "Receber 2 níveis de exaustão", benefit: "Efeito novo de até 2 níveis acima" },
    { label: "Explicar o Hatsu", level: 'Moderada', desc: "Revelar funcionamento antes da ativação", benefit: "Alvo com desvantagem em TR" },
    { label: "Golpe/Toque", level: 'Moderada', desc: "Depende de acerto físico hostil", benefit: "+2 na CD do TR" },
    { label: "Limite Definitivo", level: 'Moderada', desc: "Só pode ser usado 1x por combate", benefit: "+2 Rodadas ou -10% de aura" },
    { label: "Limite Emocional", level: 'Moderada', desc: "Só ativa com emoção intensa", benefit: "+2 em Jogadas de Acerto", attackBonus: 2 },
    { label: "Tempo Marcado", level: 'Moderada', desc: "Só ativa após 4 rodadas", benefit: "Dobra alcance ou +2 em atributo" },
    { label: "Zetsu Protetivo", level: 'Moderada', desc: "Alvo usar Zetsu anula o efeito", benefit: "Adiciona Rodadas, Acerto ou Dano" },
    // Pesadas
    { label: "Alto Risco", level: 'Pesada', desc: "Perder 50% do PV para ativar", benefit: "Dados de dano cheios (máximos)" },
    { label: "Boneca Russa", level: 'Pesada', desc: "Hatsu depende de outro Hatsu", benefit: "+3 rodadas de duração" },
    { label: "Dano Permanente Variável", level: 'Pesada', desc: "Perder 1d10 vida/sanidade permanentemente", benefit: "+3 Efeitos Adicionais", phBonus: 3 },
    { label: "Efeito Rebote", level: 'Pesada', desc: "Usuário sofre condições do próprio Hatsu", benefit: "Alvos rolam com desvantagem (3 rod.)" },
    { label: "Efeitos Aleatórios", level: 'Pesada', desc: "Efeitos pré-definidos com ativação aleatória", benefit: "Crítico 18 ou Objetos com +15 PV" },
    { label: "Limite de Eficiência", level: 'Pesada', desc: "Não aplica eficiência de aura", benefit: "Ignora efeitos de RD ou CA" },
    { label: "Local Específico", level: 'Pesada', desc: "Só funciona em local/condição única", benefit: "Aura reduzida pela metade" },
    { label: "Perda de Membros", level: 'Pesada', desc: "Perder/inutilizar membro permanente", benefit: "+3 grau de potência" },
    { label: "Segredo Mortal", level: 'Pesada', desc: "Se descoberto, torna-se inutilizável", benefit: "Vantagem em Acerto e Concentração" },
    { label: "Zetsu Penalizante", level: 'Pesada', desc: "Fica em Zetsu horas após o uso", benefit: "Reduz em 3 os TRs dos alvos" },
    // Extremas
    { label: "Condição Simbiótica", level: 'Extrema', desc: "Hatsu só ativa com aura de aliado", benefit: "+4 Rodadas ou -10% custo por membro" },
    { label: "Condição Hostil", level: 'Extrema', desc: "Só ativa se aliado morrer ou pre-letal", benefit: "Dano maximizado e área dobrada" },
    { label: "Condição Única", level: 'Extrema', desc: "Só pode ser usado 1x na vida", benefit: "Permite Reencarnação ou +5 Rodadas" },
    { label: "Dano Permanente Constante", level: 'Extrema', desc: "Perde 5 vida permanentemente por uso", benefit: "Recupera toda a aura se acertar" },
    { label: "Juramento Imutável", level: 'Extrema', desc: "Voto público absoluto; quebra é morte", benefit: "+4 Graus de potência em tudo" },
    { label: "Kamikaze", level: 'Extrema', desc: "Desvantagem em Acerto / Vantagem Alvo", benefit: "Ignore pré-requisitos de efeitos" },
    { label: "Sacrifício de Nen", level: 'Extrema', desc: "Perda permanente de técnicas", benefit: "Ignora regras de resistência/imunidade" },
    { label: "Vida ou Morte", level: 'Extrema', desc: "Só ativa com < 10% de PV", benefit: "Dobra resultado de todos os dados" },
    { label: "Vida por Poder", level: 'Extrema', desc: "Regride 1 nível ao usar", benefit: "+7 PH Extra (4 Cat/3 Ger)", phBonus: 7 },
  ],
  'Variáveis': [
    { label: "Canalizar em Zetsu", level: 'Variável', desc: "X rodadas em Zetsu antes de ativar", benefit: "+X Grau de Potência variável" },
    { label: "Canalizar Concentração", level: 'Variável', desc: "X rodadas sem interrupção", benefit: "+X Rodadas ou +X Grau em Dano" },
    { label: "Contrato com Aliado", level: 'Variável', desc: "Acordo verbal; quebra causa Zetsu", benefit: "Peso do acordo define benefício" },
    { label: "Exposição Desnecessária", level: 'Variável', desc: "Alvos recebem +X em tudo contra você", benefit: "+X Grau de Potência (Máx 10)" },
    { label: "Uso Contínuo (X=1)", level: 'Variável', desc: "Usado apenas 1 vez", benefit: "+4 PH Adicionais", phBonus: 4 },
    { label: "Uso Contínuo (X=2)", level: 'Variável', desc: "Usado apenas 2 vezes", benefit: "+3 PH Adicionais", phBonus: 3 },
    { label: "Uso Contínuo (X=3)", level: 'Variável', desc: "Usado apenas 3 vezes", benefit: "+2 PH Adicionais", phBonus: 2 },
    { label: "Sorte ou Revés", level: 'Variável', desc: "Falha crítica role 1d4 penalidade", benefit: "Sucesso crítico role 1d4 bônus" },
    { label: "Troca Reações", level: 'Variável', desc: "Hatsu consome reações extras", benefit: "-5% aura por reação ou +1 Alvo" },
    { label: "Zetsu por Falha", level: 'Variável', desc: "Zetsu se objetivo falhar", benefit: "Grau em Alcance ou Zetsu ao alvo" },
  ],
  'Reforço': [
    { label: "PV < 75% Ref.", level: 'Leve', desc: "Só usa ferido", benefit: "+1 grau no dano" },
    { label: "Corpo a Corpo Ref.", level: 'Leve', desc: "Ataque físico obrigatório", benefit: "Desvantagem em reação do alvo" },
    { label: "Sem Defesas Ref.", level: 'Leve', desc: "Proibido reações defensivas", benefit: "+1 no acerto", attackBonus: 1 },
    { label: "Aumento Gradual", level: 'Moderada', desc: "Efeitos ativam por rodada", benefit: "+2 Graus de Potência" },
    { label: "Sem Buffs Ref.", level: 'Moderada', desc: "Uso sem buffs ativos", benefit: "Ignora resistências físicas" },
    { label: "Aura < 50% Ref.", level: 'Moderada', desc: "Gasta muita aura p/ ativar", benefit: "+1 Grau de Potência" },
    { label: "Auto-Dano (5%)", level: 'Pesada', desc: "Consome vida ao usar", benefit: "Pode rerrolar dados de dano" },
    { label: "Danos TR Ref.", level: 'Pesada', desc: "Desvantagem em TRs após uso", benefit: "Ignora imunidade a dano" },
    { label: "Uso Único Ref.", level: 'Pesada', desc: "Só 1x por combate", benefit: "+2 PH Adicionais", phBonus: 2 },
  ],
  'Transmutação': [
    { label: "Preparação Transmut.", level: 'Leve', desc: "Precisa preparar o Hatsu por 1 turno", benefit: "+1 Grau de Potência no Hatsu" },
    { label: "Estático Transmut.", level: 'Leve', desc: "Não pode se mover no turno", benefit: "Hatsu ganha +3m de alcance adicional" },
    { label: "Foco Único Transmut.", level: 'Leve', desc: "Afeta apenas 1 alvo mesmo sendo em área", benefit: "Alvo afetado sofre desvantagem na resistência" },
    { label: "Penalidade por Erro Transmut.", level: 'Moderada', desc: "Perde 5% de aura extra ao errar", benefit: "Se atingir, causa 1 Condição fraca adicional" },
    { label: "Sem Aliados Transmut.", level: 'Moderada', desc: "Não pode usar se houver aliados a 3m", benefit: "Hatsu pode afetar área 1,5m maior" },
    { label: "Auto-Condição Transmut.", level: 'Moderada', desc: "Causa 1 Condição fraca no usuário", benefit: "+1 dado de dano (o maior, se houver dados diferentes)" },
    { label: "Fogo Amigo Transmut.", level: 'Pesada', desc: "Afeta aliados também em Hatsu hostil", benefit: "Todos os alvos falham automaticamente (até Prof. do usuário)" },
    { label: "Abalado Transmut.", level: 'Pesada', desc: "Recebe Condição Abalado após uso", benefit: "Hatsu ignora resistência de área (barreiras, portas, grades)" },
    { label: "Custo Dobrado Transmut.", level: 'Pesada', desc: "Custa dobro de aura se não acertar ou for resistido", benefit: "Pode repetir a rolagem de ataque/acerto com o Hatsu" },
  ],
  'Materialização': [
    { label: "Curta Distância Conj.", level: 'Leve', desc: "Conjuração não pode se afastar mais de 6m", benefit: "Conjuração recebe +1 na CA" },
    { label: "Sem Dano Direto Conj.", level: 'Leve', desc: "Conjuração não causa dano direto", benefit: "+2 bônus em suporte (cura, sensor, defesa)" },
    { label: "Um por Combate Conj.", level: 'Leve', desc: "Só pode conjurar 1 item do mesmo tipo por combate", benefit: "O item ganha +2 rodadas de duração" },
    { label: "Manutenção de Aura Conj.", level: 'Moderada', desc: "Conjuração consome 5% de aura por rodada", benefit: "Pode realizar 1 ação bônus extra em seu turno" },
    { label: "Dano Compartilhado Conj.", level: 'Moderada', desc: "Usuário sofre dano = metade da vida da conjuração se ela for destruída", benefit: "Criatura explode ao morrer: 1d6 em 3m de área" },
    { label: "Local Fixo Conj.", level: 'Moderada', desc: "Só conjura em local fixo/calmo predeterminado (ex: em casa ou fora de combate)", benefit: "Conjurador ganha vantagem no primeiro teste que realizar" },
    { label: "Ação Principal Conj.", level: 'Pesada', desc: "Perde Ação Principal enquanto a Conjuração estiver ativa", benefit: "Criatura age com +4 em testes ofensivos" },
    { label: "Controlável por Outros Conj.", level: 'Pesada', desc: "Conjuração pode ser manipulada por outros contra a vontade; reverter com SAB CD 15", benefit: "Dado de dano máx. OU alcance dobra OU custo -15% OU dura +2 rodadas" },
    { label: "Componentes Materiais Conj.", level: 'Pesada', desc: "Hatsu depende de componentes materiais consumidos/inutilizados ao conjurar", benefit: "Criatura tem +2 CA e +10 PV ao ser criada" },
  ],
  'Especialização': [
    { label: "Alvo Único Espec.", level: 'Leve', desc: "Só pode usar contra o mesmo alvo 1x por combate", benefit: "Pode copiar 1 efeito geral extra da tabela de efeitos gerais" },
    { label: "Nome Verdadeiro Espec.", level: 'Leve', desc: "Precisa conhecer o nome verdadeiro do alvo", benefit: "+2 Graus de Potência no Hatsu contra o alvo específico" },
    { label: "Terreno Específico Espec.", level: 'Leve', desc: "Só ativa em terreno específico", benefit: "+1 Grau de Potência no Hatsu" },
    { label: "Alvo Único Área Espec.", level: 'Moderada', desc: "Não funciona com múltiplos alvos", benefit: "Pode aplicar 1 condição secundária ao alvo" },
    { label: "Após Falha Espec.", level: 'Moderada', desc: "Só ativa após ter falhado anteriormente", benefit: "Se ativar, o Hatsu ignora resistências" },
    { label: "Aura de Aliado Espec.", level: 'Moderada', desc: "Requer aura de outro aliado para ativar", benefit: "+1 efeito temporário da categoria do aliado (com colaboração voluntária)" },
    { label: "Inconsciência Espec.", level: 'Pesada', desc: "Fica inconsciente ou perde controle do corpo durante/após uso", benefit: "Aplica 2 efeitos simultâneos de categorias diferentes ou gerais" },
    { label: "Uso Único Sessão Espec.", level: 'Pesada', desc: "Uso único por sessão", benefit: "+2 Graus de Potência no Hatsu" },
    { label: "Esquecimento Espec.", level: 'Pesada', desc: "Esquece o Hatsu por 1 dia (em sessão participada) após uso", benefit: "Efeito considerado Irrefutável (sem resistência possível)" },
  ],
  'Manipulação': [
    { label: "Toque Obrigatório Manip.", level: 'Leve', desc: "Só funciona com alvos tocados", benefit: "+1 na CD de resistência do alvo" },
    { label: "Dano Quebra Manip.", level: 'Leve', desc: "Perde o efeito se o alvo sofrer dano", benefit: "A manipulação dura +1 rodada" },
    { label: "Contato Visual Manip.", level: 'Leve', desc: "Requer contato visual contínuo", benefit: "Alvo age com vantagem na primeira rodada sob controle" },
    { label: "Um Alvo Manip.", level: 'Moderada', desc: "Só pode controlar 1 objeto/alvo por vez", benefit: "Objeto/ser controlado pode realizar 1 ação bônus extra por turno" },
    { label: "Zetsu Quebra Manip.", level: 'Moderada', desc: "Hatsu interrompe/falha em alvos que ativam Zetsu", benefit: "Alvo controlado sofre -2 Sanidade/rodada. ou +2 em jogadas do manipulador" },
    { label: "Imunidade Temporária Manip.", level: 'Moderada', desc: "Alvo fica imune por 5 rodadas ao superar o TR", benefit: "+2 na CD de resistência do alvo" },
    { label: "Custo por Rodada Manip.", level: 'Pesada', desc: "Custa +10% de aura por rodada", benefit: "+5 na CD de resistência do alvo" },
    { label: "Movimento Quebra Manip.", level: 'Pesada', desc: "O usuário se mover (mesmo obrigado) quebra o efeito", benefit: "Manipulação ignora imunidade do alvo" },
    { label: "Desorientado ao Quebrar Manip.", level: 'Pesada', desc: "Fica Desorientado se o controle for quebrado", benefit: "Se alvo falhar novamente, efeito ativa automaticamente sem novo gasto" },
  ],
  'Emissão': [
    { label: "Linha Reta Emis.", level: 'Leve', desc: "Só pode ser lançado em linha reta", benefit: "Aumenta alcance em +6m" },
    { label: "Estático Emis.", level: 'Leve', desc: "Não pode se mover no turno", benefit: "Ignora cobertura total (atravessando barreiras)" },
    { label: "Obstáculos Bloqueiam Emis.", level: 'Leve', desc: "Obstáculos bloqueiam automaticamente", benefit: "Hatsu causa dano dobrado em objetos (Arma de Cerco)" },
    { label: "Atraso Emis.", level: 'Moderada', desc: "Atraso de 1 rodada para ativação do Hatsu", benefit: "Pode redirecionar ao errar 1x por combate (sem ação)" },
    { label: "Mov. Reduz Alcance Emis.", level: 'Moderada', desc: "Distância reduzida à metade se o usuário se mover", benefit: "+1 Grau de Potência" },
    { label: "CA Reduzida Emis.", level: 'Moderada', desc: "Usuário sofre -2 CA durante o uso do Hatsu", benefit: "Alvo sofre desvantagem no teste de resistência" },
    { label: "Aura Cheia Emis.", level: 'Pesada', desc: "Só pode ser usado com aura cheia", benefit: "Hatsu ignora resistência física e de energia" },
    { label: "Imóvel Após Emis.", level: 'Pesada', desc: "Fica Imóvel após usar o Hatsu", benefit: "Pode repetir o ataque 1x por combate se errar (metade do custo)" },
    { label: "Ricochete Emis.", level: 'Pesada', desc: "Ricochete em aliado se errar", benefit: "Acerto automático contra alvo Desprevenido" },
  ],
};

// --- APP COMPONENT ---

const App = () => {
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState<'intro' | 'category' | 'ph-shop' | 'vows' | 'analysis'>('intro');
  const [selectedCategory, setSelectedCategory] = useState<NenType>('Reforço');
  const [selectedEffects, setSelectedEffects] = useState<Effect[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<Restriction[]>([]);
  const [hatsuName, setHatsuName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const hasExtremeRestriction = useMemo(() => 
    selectedRestrictions.some(r => r.level === 'Extrema'), 
  [selectedRestrictions]);

  const phBalance = useMemo(() => {
    const base = 3;
    const spent = selectedEffects.reduce((acc, curr) => acc + curr.cost, 0);
    const earned = selectedRestrictions.reduce((acc, curr) => acc + (curr.phBonus || 0), 0);
    return base + earned - spent;
  }, [selectedEffects, selectedRestrictions]);

  const totalAttackBonus = useMemo(() =>
    selectedRestrictions.reduce((acc, r) => acc + (r.attackBonus || 0), 0),
  [selectedRestrictions]);

  const proficiencyBonus = useMemo(() =>
    level <= 4 ? 2 : level <= 8 ? 3 : 4,
  [level]);

  const isEffectLocked = (effect: Effect) => {
    const affinities = (NEN_CONFIG[selectedCategory].affinities as Record<string, number>);
    const affinity = affinities[effect.category] || 0;
    let requiredLevel = effect.level;
    
    if (effect.category !== 'Geral' && effect.category !== selectedCategory) {
      if (affinity >= 80) requiredLevel = Math.max(3, effect.level);
      else if (affinity >= 60) requiredLevel = Math.max(5, effect.level);
      else if (affinity > 0) requiredLevel = Math.max(7, effect.level);
      else requiredLevel = 13;
    }

    if (hasExtremeRestriction) requiredLevel = Math.max(1, requiredLevel - 2);
    return level < requiredLevel;
  };

  const toggleEffect = (effect: Effect) => {
    if (selectedEffects.some(e => e.name === effect.name)) {
      setSelectedEffects(selectedEffects.filter(e => e.name !== effect.name));
    } else if (phBalance >= effect.cost && !isEffectLocked(effect)) {
      setSelectedEffects([...selectedEffects, effect]);
    }
  };

  const toggleRestriction = (res: Restriction) => {
    const isSelected = selectedRestrictions.some(r => r.label === res.label);
    if (isSelected) {
      setSelectedRestrictions(selectedRestrictions.filter(r => r.label !== res.label));
    } else {
      setSelectedRestrictions([...selectedRestrictions, res]);
      if (res.phBonus && res.phBonus > 0) {
        setStep('ph-shop');
      }
    }
  };

  const analyzeHatsu = async () => {
    if (!hatsuName || !description) return;
    setLoading(true);
    setStep('analysis');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const attackBonusStr = totalAttackBonus > 0 ? ` + ${totalAttackBonus} (restrições)` : '';
      const prompt = `Gere uma Ficha Final do Hatsu Hunter x Hunter 5e:
      - Nome: ${hatsuName}
      - Categoria: ${selectedCategory}
      - Nível: ${level}
      - PH Totais Investidos: ${3 + selectedRestrictions.reduce((a,b)=>a+(b.phBonus||0),0)}
      - Efeitos: ${selectedEffects.map(e => e.name).join(', ')}
      - Restrições: ${selectedRestrictions.map(r => `${r.label} (Efeito: ${r.benefit})`).join('; ')}
      - Descrição: ${description}

      MECÂNICAS: CD=8+Proficiência+Mod ${NEN_CONFIG[selectedCategory].mod}. Escala Dano: 1d4-2d10.
      Bônus de Acerto Total: 1d20 + ${proficiencyBonus} (prof) + Mod ${NEN_CONFIG[selectedCategory].mod}${attackBonusStr}.
      JSON Schema: {dano_cura, acerto (string com a fórmula completa de ataque, ex: "1d20 + Prof + DES + 2", ou null se o hatsu não usa jogada de ataque), tipo_acerto (enum: "Ataque" | "Teste de Resistência"), cd, aura, rank, narrativa, dicionario_efeitos: [{nome, detalhe}], votos_condicoes: [{voto, bonus}]}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      setResult(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040406] text-slate-100 font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 pointer-events-none opacity-30 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-12 relative z-10">
        <header className="text-center mb-16 animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <Dice5 size={14} className="text-amber-500" />
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-slate-400">Hunter Manual 5e v5.4</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 tracking-tighter">
            NEN ARCHITECT
          </h1>
        </header>

        {/* PH Floating HUD */}
        <div className="fixed top-8 right-8 z-50">
          <div className="glass-panel p-5 flex flex-col items-end border-amber-500/40 bg-black/60 backdrop-blur-2xl shadow-2xl shadow-amber-500/10 min-w-[180px]">
            <p className="text-[8px] uppercase font-bold text-amber-500/70 mb-1 tracking-[0.2em]">PONTOS DE HATSU</p>
            <div className="flex items-center gap-3">
              <Coins className="text-amber-500 animate-pulse" size={20} />
              <span className="text-4xl font-cinzel font-bold text-amber-500">{phBalance}</span>
            </div>
            {phBalance > 0 && step === 'vows' && (
              <button onClick={() => setStep('ph-shop')} className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-500 rounded-lg text-[10px] uppercase font-bold border border-amber-500/40 hover:bg-amber-500/40 transition-all">
                <ShoppingBag size={14} /> Gastar Saldo Extra
              </button>
            )}
          </div>
        </div>

        {step === 'intro' && (
          <div className="max-w-xl mx-auto glass-panel p-12 text-center animate-in zoom-in duration-500 border-white/10">
            <ScrollText size={56} className="text-amber-500 mx-auto mb-8" />
            <h2 className="text-3xl font-cinzel mb-10 text-amber-100 tracking-[0.2em]">NÍVEL DE MAESTRIA</h2>
            <div className="flex items-center justify-center gap-12 mb-12">
              <button onClick={() => setLevel(Math.max(1, level - 1))} className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-amber-500/50 transition-all text-2xl group">
                <Minus size={24} className="group-hover:scale-110 transition-transform"/>
              </button>
              <div className="text-center w-36">
                <span className="text-8xl font-cinzel font-bold text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">{level}</span>
                <p className="text-[10px] text-slate-500 uppercase mt-4 tracking-[0.4em] font-black">Nível Hunter</p>
              </div>
              <button onClick={() => setLevel(Math.min(12, level + 1))} className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-amber-500/50 transition-all text-2xl group">
                <Plus size={24} className="group-hover:scale-110 transition-transform"/>
              </button>
            </div>
            <button onClick={() => setStep('category')} className="w-full py-5 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/40 uppercase text-xs tracking-[0.5em] flex items-center justify-center gap-4">
              Consagrar Nível <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 'category' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-center font-cinzel text-4xl mb-16 uppercase tracking-[0.3em] text-amber-100">Divinação das Águas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16">
              {(Object.keys(NEN_CONFIG) as NenType[]).map((type) => {
                const isSelected = selectedCategory === type;
                return (
                  <button key={type} onClick={() => setSelectedCategory(type)} className={`glass-panel p-10 border-b-8 transition-all group ${isSelected ? 'scale-105 border-amber-500 bg-amber-500/10' : 'opacity-40 hover:opacity-100 border-transparent hover:bg-white/5'}`}>
                    <div className="flex justify-center mb-8">
                      {React.createElement(NEN_CONFIG[type].icon, { size: 64, style: { color: NEN_CONFIG[type].color } })}
                    </div>
                    <h3 className="font-cinzel font-bold text-2xl mb-3 tracking-widest">{type}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">Atributo: {NEN_CONFIG[type].mod}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center">
              <button onClick={() => setStep('ph-shop')} className="px-24 py-5 bg-white/5 border border-white/20 rounded-2xl hover:bg-amber-500 hover:text-black transition-all uppercase text-xs tracking-[0.4em] font-bold">Investir Pontos</button>
            </div>
          </div>
        )}

        {step === 'ph-shop' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-16 border-b border-white/10 pb-8">
              <h2 className="font-cinzel text-4xl uppercase tracking-[0.3em] text-amber-100">Loja de Efeitos</h2>
              <button onClick={() => setStep('vows')} className="flex items-center gap-3 px-8 py-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl text-amber-500 text-xs font-bold uppercase tracking-[0.3em] hover:bg-amber-500/20 transition-all">
                Ir para Votos <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em] mb-8 pl-4 border-l-4 border-slate-700">Efeitos Gerais (Acesso 100%)</h3>
                <div className="grid gap-4">
                  {GENERAL_EFFECTS.map(effect => {
                    const active = selectedEffects.some(e => e.name === effect.name);
                    const locked = isEffectLocked(effect);
                    return (
                      <button key={effect.name} onClick={() => toggleEffect(effect)} disabled={locked && !active} className={`w-full p-6 glass-panel text-left transition-all border-l-4 ${active ? 'border-amber-500 bg-amber-500/10' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-white/5'} disabled:opacity-20`}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-sm tracking-widest text-amber-50 uppercase">{effect.name}</span>
                          <span className="text-xs font-bold text-amber-500">{effect.cost} PH</span>
                        </div>
                        <p className="text-xs text-slate-400 font-light leading-relaxed">{effect.desc}</p>
                        {locked && <div className="mt-3 text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1"><Lock size={12}/> Requisito Nível {effect.level}</div>}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-[0.5em] mb-8 pl-4 border-l-4 border-amber-600">Efeitos de {selectedCategory}</h3>
                <div className="grid gap-4">
                  {(CATEGORY_EFFECTS_MAP[selectedCategory] ?? []).map(effect => {
                    const active = selectedEffects.some(e => e.name === effect.name);
                    const locked = isEffectLocked(effect);
                    return (
                      <button key={effect.name} onClick={() => toggleEffect(effect)} disabled={locked && !active} className={`w-full p-6 glass-panel text-left transition-all border-l-4 ${active ? 'border-amber-500 bg-amber-500/10' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-white/5'} disabled:opacity-20`}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-sm tracking-widest text-amber-50 uppercase">{effect.name}</span>
                          <span className="text-xs font-bold text-amber-500">{effect.cost} PH</span>
                        </div>
                        <p className="text-xs text-slate-400 font-light leading-relaxed">{effect.desc}</p>
                        {locked && <div className="mt-3 text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1"><Lock size={12}/> Requisito Nível {effect.level}</div>}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}

        {step === 'vows' && (
          <div className="animate-in slide-in-from-bottom-12 duration-500">
            <div className="flex justify-between items-center mb-16 border-b border-white/10 pb-8">
              <h2 className="font-cinzel text-4xl uppercase tracking-[0.3em] text-amber-100">Contrato de Vida</h2>
              <button onClick={() => setStep('ph-shop')} className="flex items-center gap-3 px-8 py-4 border border-white/20 rounded-2xl text-slate-400 text-xs font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                <ArrowLeft size={16} /> Ajustar Efeitos
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
              {/* Coluna 1: Gerais */}
              <div className="space-y-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 pl-4 border-l-2 border-slate-700">Restrições Gerais</h3>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {RESTRICTIONS_DB['Geral'].map(res => {
                    const isSelected = selectedRestrictions.some(r => r.label === res.label);
                    return (
                      <button key={res.label} onClick={() => toggleRestriction(res)} className={`w-full p-5 glass-panel text-left transition-all border-l-4 ${isSelected ? 'border-red-500 bg-red-500/10' : 'border-white/5 opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                        <div className="flex justify-between mb-1 items-start">
                          <span className="font-bold text-[13px] text-amber-50 uppercase tracking-tight">{res.label}</span>
                          {res.phBonus && <span className="text-[10px] font-black text-green-500">+{res.phBonus} PH</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed font-medium">{res.desc}</p>
                        <p className="text-[10px] text-amber-500 italic font-bold leading-tight">Bônus: {res.benefit}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 2: Variáveis */}
              <div className="space-y-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 pl-4 border-l-2 border-blue-900">Restrições Variáveis</h3>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {RESTRICTIONS_DB['Variáveis'].map(res => {
                    const isSelected = selectedRestrictions.some(r => r.label === res.label);
                    return (
                      <button key={res.label} onClick={() => toggleRestriction(res)} className={`w-full p-5 glass-panel text-left transition-all border-l-4 ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                        <div className="flex justify-between mb-1 items-start">
                          <span className="font-bold text-[13px] text-blue-50 uppercase tracking-tight">{res.label}</span>
                          {res.phBonus && <span className="text-[10px] font-black text-green-500">+{res.phBonus} PH</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed font-medium">{res.desc}</p>
                        <p className="text-[10px] text-blue-400 italic font-bold leading-tight">Bônus: {res.benefit}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 3: Categoria */}
              <div className="space-y-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 pl-4 border-l-2 border-amber-900">Específicas: {selectedCategory}</h3>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {RESTRICTIONS_DB[selectedCategory]?.map(res => {
                    const isSelected = selectedRestrictions.some(r => r.label === res.label);
                    return (
                      <button key={res.label} onClick={() => toggleRestriction(res)} className={`w-full p-5 glass-panel text-left transition-all border-l-4 ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                        <div className="flex justify-between mb-1 items-start">
                          <span className="font-bold text-[13px] text-amber-50 uppercase tracking-tight">{res.label}</span>
                          {res.phBonus && <span className="text-[10px] font-black text-green-500">+{res.phBonus} PH</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed font-medium">{res.desc}</p>
                        <p className="text-[10px] text-amber-400 italic font-bold leading-tight">Bônus: {res.benefit}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lado Direito: Resumo e Criação de Hatsu */}
              <div className="space-y-6">
                <div className="glass-panel p-8 bg-black/60 border-amber-500/30 sticky top-24 shadow-2xl space-y-8">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3"><ShieldCheck size={20} /> Registro Hunter</h4>
                  
                  {/* Campos de Nome e Descrição integrados conforme solicitação visual */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[8px] uppercase tracking-[0.4em] font-black text-slate-500 mb-3">Nome do Hatsu</label>
                      <input 
                        className="w-full bg-black/70 border border-white/10 rounded-xl p-4 focus:border-amber-500 outline-none transition-all font-cinzel text-xl text-amber-100" 
                        value={hatsuName} 
                        onChange={e => setHatsuName(e.target.value)} 
                        placeholder="Ex: Emperor Time"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-[0.4em] font-black text-slate-500 mb-3">Descrição Narrativa</label>
                      <textarea 
                        rows={4} 
                        className="w-full bg-black/70 border border-white/10 rounded-xl p-4 focus:border-amber-500 outline-none transition-all resize-none text-xs leading-relaxed text-slate-300 font-light" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Descreva a visualização da aura..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest border-b border-white/10 pb-2">Votos Selados: {selectedRestrictions.length}</p>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {selectedRestrictions.map((r, i) => (
                        <div key={i} className="flex justify-between items-start text-[10px] p-3 bg-white/5 rounded-lg border border-white/5">
                          <span className="font-bold text-amber-50 uppercase tracking-tighter">{r.label}</span>
                          <button onClick={() => toggleRestriction(r)} className="text-slate-600 hover:text-red-500"><RotateCcw size={10}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={analyzeHatsu} 
                    disabled={!hatsuName || !description || phBalance < 0} 
                    className="w-full py-5 bg-[#8b5e28] text-amber-100 font-black rounded-2xl uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-amber-900/40 hover:bg-[#a6743b] hover:scale-[1.02] transition-all disabled:opacity-30"
                  >
                    Criar Hatsu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'analysis' && (
          <div className="glass-panel p-16 min-h-[700px] animate-in zoom-in duration-1000 border-amber-500/30 bg-[#07070a] shadow-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="animate-spin text-amber-500" size={140} />
                <p className="text-5xl font-cinzel text-white tracking-[0.5em] animate-pulse mt-10">AUTENTICANDO REGISTRO...</p>
              </div>
            ) : result && (
              <div className="animate-in fade-in duration-1000">
                <div className="flex flex-col xl:flex-row justify-between items-start gap-12 mb-24 border-b border-white/10 pb-20">
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-8xl font-cinzel font-bold text-amber-400 mb-8 tracking-tighter drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] leading-tight">{hatsuName}</h2>
                    <div className="flex flex-wrap items-center gap-8 justify-center md:justify-start">
                      <span className="px-10 py-3 bg-amber-500 text-black font-black text-sm uppercase rounded-full tracking-[0.5em] shadow-xl shadow-amber-500/30">{selectedCategory}</span>
                      <span className="text-slate-500 text-4xl font-cinzel tracking-[0.5em]">{result.rank} RANK</span>
                    </div>
                  </div>
                  <div className={`grid ${result.tipo_acerto === 'Ataque' && result.acerto ? 'grid-cols-3' : 'grid-cols-2'} gap-8 w-full md:w-auto`}>
                    {result.tipo_acerto === 'Ataque' && result.acerto && (
                      <div className="text-center px-12 py-10 bg-black/60 rounded-[3rem] border border-blue-500/20 shadow-2xl">
                        <p className="text-[10px] text-blue-400 uppercase font-black mb-4 tracking-[0.4em]">Jogada de Acerto</p>
                        <p className="font-cinzel font-bold text-3xl text-blue-300 tracking-widest">{result.acerto}</p>
                      </div>
                    )}
                    <div className="text-center px-12 py-10 bg-black/60 rounded-[3rem] border border-white/5 shadow-2xl">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-[0.4em]">Potência Hunter</p>
                      <p className="font-cinzel font-bold text-5xl text-white tracking-widest">{result.dano_cura}</p>
                    </div>
                    <div className="text-center px-12 py-10 bg-black/60 rounded-[3rem] border border-white/5 shadow-2xl">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-[0.4em]">Classe de Defesa</p>
                      <p className="font-cinzel font-bold text-5xl text-amber-500 tracking-widest">CD {result.cd}</p>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-24">
                  <div className="space-y-20">
                    <section>
                      <h4 className="flex items-center gap-4 text-xs font-black text-amber-500 uppercase tracking-[0.6em] mb-12 border-b border-white/10 pb-6"><Sword size={24} /> MECÂNICAS 5E</h4>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-[0.2em]">Custo de Aura</p>
                          <p className="font-bold text-3xl text-amber-400">{result.aura}</p>
                        </div>
                        <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-[0.2em]">PH Totais</p>
                          <p className="font-bold text-3xl text-blue-400">{3 + selectedRestrictions.reduce((a,b)=>a+(b.phBonus||0),0)} PH</p>
                        </div>
                      </div>
                    </section>
                    <section>
                      <h4 className="flex items-center gap-4 text-xs font-black text-amber-500 uppercase tracking-[0.6em] mb-10"><BrainCircuit size={24} /> DICIONÁRIO DE EFEITOS</h4>
                      <div className="space-y-8">
                        {result.dicionario_efeitos.map((d: any, i: number) => (
                          <div key={i} className="p-8 bg-black/60 rounded-3xl border border-white/5 group hover:bg-amber-500/[0.03] transition-all">
                            <p className="font-cinzel text-amber-200 text-lg mb-3 uppercase tracking-widest">{d.nome}</p>
                            <p className="text-sm text-slate-400 leading-loose font-light italic">{d.detalhe}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-20">
                    <section>
                      <h4 className="flex items-center gap-4 text-xs font-black text-red-500 uppercase tracking-[0.6em] mb-12 border-b border-white/10 pb-6"><ShieldCheck size={24} /> CONTRATO DE NEN</h4>
                      <div className="space-y-8">
                        {result.votos_condicoes.map((v: any, i: number) => (
                          <div key={i} className="p-8 bg-red-500/[0.04] rounded-3xl border border-red-500/20 shadow-inner">
                            <p className="text-red-400 font-black text-base mb-3 uppercase tracking-[0.2em]">{v.voto}</p>
                            <p className="text-xs text-slate-400 leading-loose font-medium">{v.bonus}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="bg-amber-500/[0.03] p-12 rounded-[4rem] border border-white/10 shadow-2xl">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-10 text-center">ANÁLISE DO COMITÊ</h4>
                      <p className="text-base text-slate-400 leading-[2.2] text-justify font-light tracking-wide first-letter:text-6xl first-letter:font-cinzel first-letter:text-amber-500 first-letter:float-left first-letter:mr-6 first-letter:mt-2">
                        {result.narrativa}
                      </p>
                    </section>
                  </div>
                </div>

                <div className="mt-32 flex flex-col md:flex-row justify-center gap-10">
                  <button onClick={() => window.location.reload()} className="px-16 py-6 border border-white/20 rounded-2xl hover:bg-white/5 transition-all text-xs font-black uppercase tracking-[0.5em] flex items-center gap-4 justify-center">
                    <RotateCcw size={20} /> Nova Iniciação
                  </button>
                  <button className="px-16 py-6 bg-amber-500 text-black rounded-2xl hover:bg-amber-400 transition-all text-xs font-black uppercase tracking-[0.6em] shadow-2xl shadow-amber-500/40 flex items-center gap-4 justify-center">
                    <ScrollText size={20} /> Emitir Licença
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center py-32 opacity-20 text-[11px] uppercase tracking-[1em] font-extralight border-t border-white/5 mt-20">
        Associação Hunter • Architect-Nen Protocol v5.4 • Licensed Hunter 5e RPG
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);