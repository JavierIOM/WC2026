export interface Match {
  id: string;
  matchday: number;
  dateISO: string;      // YYYY-MM-DD
  kickoffBST: string;   // "HH:MM"
  group: string;
  venue: string;
  home: string;
  away: string;
  predHome: number;
  predAway: number;
  predType: 'mismatch' | 'favourite-tight' | 'draw' | 'rule-bend';
  scorerCall?: string;
  scorerCallType?: 'score' | 'score-or-assist';
  reasoning: string;
  // Actuals — omit both to mark match as PENDING
  actualHome?: number;
  actualAway?: number;
  scorers?: string[];    // goalscorers (either side)
  assisters?: string[];  // players credited with assists/involvement
  actualNotes?: string;
  informalOnly?: boolean; // exclude from headline tallies
}

export type ResultVerdict = 'EXACT' | 'CORRECT' | 'MISS' | 'PENDING';
export type ScorerVerdict = 'HIT' | 'ASSIST' | 'MISS' | 'PENDING';

export function isPlayed(m: Match): boolean {
  return m.actualHome !== undefined && m.actualAway !== undefined;
}

export function getResultVerdict(m: Match): ResultVerdict {
  if (!isPlayed(m)) return 'PENDING';
  const predOut = m.predHome > m.predAway ? 'H' : m.predHome < m.predAway ? 'A' : 'D';
  const actOut  = m.actualHome! > m.actualAway! ? 'H' : m.actualHome! < m.actualAway! ? 'A' : 'D';
  if (predOut !== actOut) return 'MISS';
  if (m.predHome === m.actualHome && m.predAway === m.actualAway) return 'EXACT';
  return 'CORRECT';
}

export function getScorerVerdict(m: Match): ScorerVerdict | null {
  if (!m.scorerCall) return null;
  if (!isPlayed(m)) return 'PENDING';
  const player   = m.scorerCall.toLowerCase();
  const scored   = (m.scorers   || []).some(s => s.toLowerCase().includes(player));
  const assisted = (m.assisters || []).some(a => a.toLowerCase().includes(player));
  if (scored) return 'HIT';
  if (m.scorerCallType === 'score-or-assist' && assisted) return 'HIT';
  if (assisted) return 'ASSIST';
  return 'MISS';
}

export interface Stats {
  resultTotal: number;
  resultCorrect: number;  // EXACT + CORRECT
  resultExact: number;
  scorerTotal: number;
  scorerPositive: number; // HIT + ASSIST
  scorerHit: number;      // HIT only
  resultsByMatchday: Record<number, { total: number; correct: number }>;
}

export function computeStats(ms: Match[]): Stats {
  const formal = ms.filter(m => !m.informalOnly);
  const played = formal.filter(isPlayed);

  let resultCorrect = 0, resultExact = 0;
  let scorerTotal = 0, scorerPositive = 0, scorerHit = 0;
  const resultsByMatchday: Record<number, { total: number; correct: number }> = {};

  for (const m of played) {
    const rv = getResultVerdict(m);
    if (rv === 'CORRECT' || rv === 'EXACT') resultCorrect++;
    if (rv === 'EXACT') resultExact++;

    if (!resultsByMatchday[m.matchday]) resultsByMatchday[m.matchday] = { total: 0, correct: 0 };
    resultsByMatchday[m.matchday].total++;
    if (rv !== 'MISS') resultsByMatchday[m.matchday].correct++;

    const sv = getScorerVerdict(m);
    if (sv !== null && sv !== 'PENDING') {
      scorerTotal++;
      if (sv === 'HIT')    { scorerPositive++; scorerHit++; }
      if (sv === 'ASSIST') { scorerPositive++; }
    }
  }

  return {
    resultTotal: played.length,
    resultCorrect,
    resultExact,
    scorerTotal,
    scorerPositive,
    scorerHit,
    resultsByMatchday,
  };
}

export function formatDate(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function predTypeLabel(t: Match['predType']): string {
  const map: Record<Match['predType'], string> = {
    'mismatch':       'Mismatch',
    'favourite-tight': 'Fav (tight)',
    'draw':           'Draw call',
    'rule-bend':      'Rule bend',
  };
  return map[t];
}

// ─── MATCH DATA ────────────────────────────────────────────────────────────────
// To mark a match played: add actualHome, actualAway, and optionally scorers/assisters/actualNotes.
// To add a new match: append one object to the array below.

export const matches: Match[] = [

  // ── MATCHDAY 1 ─────────────────────────────────────────────────────────────

  {
    id: 'mex-rsa',
    matchday: 1,
    dateISO: '2026-06-11',
    kickoffBST: '19:00',
    group: 'A',
    venue: 'Estadio Azteca, Mexico City',
    home: 'Mexico',
    away: 'South Africa',
    predHome: 2,
    predAway: 0,
    predType: 'mismatch',
    reasoning: 'Mexico at the Azteca in a home World Cup opener. South Africa ranked 82nd. Classic mismatch — the multi-goal margin is justified on paper and emotionally. Red-card-heavy Mexico games are still Mexico wins.',
    actualHome: 2,
    actualAway: 0,
    scorers: ['Raul Jimenez', 'Hirving Lozano'],
    actualNotes: '3 red cards. Mexico ~80% territory. Clinical and dominant.',
  },

  {
    id: 'kor-cze',
    matchday: 1,
    dateISO: '2026-06-11',
    kickoffBST: '22:00',
    group: 'A',
    venue: 'Estadio Akron, Guadalajara',
    home: 'South Korea',
    away: 'Czechia',
    predHome: 2,
    predAway: 1,
    predType: 'favourite-tight',
    reasoning: "Korea's tournament pedigree and Son Heung-min's creativity edges Czechia. Narrow win expected — Czechia will create, Korea should close out.",
    actualHome: 2,
    actualAway: 1,
    scorers: ['Hwang In-beom', 'Oh Hyeon-gyu'],
    actualNotes: 'Hwang In-beom 67, Oh Hyeon-gyu 80.',
  },

  // ── MATCHDAY 2 ─────────────────────────────────────────────────────────────

  {
    id: 'can-bih',
    matchday: 2,
    dateISO: '2026-06-12',
    kickoffBST: '21:00',
    group: 'B',
    venue: 'BMO Field, Toronto',
    home: 'Canada',
    away: 'Bosnia',
    predHome: 2,
    predAway: 0,
    predType: 'mismatch',
    scorerCall: 'Jonathan David',
    scorerCallType: 'score',
    reasoning: 'Canada at home in their first home World Cup match — the emotional wave, the crowd, and Jonathan David in Ligue 1 form. Bosnia are competitive but Canada should control.',
    actualHome: 1,
    actualAway: 1,
    scorers: ['Larin', 'Lukic'],
    assisters: [],
    actualNotes: 'Lukic 21; Larin 78. Draw flagged in advance. David subbed off 61 without scoring or assisting.',
  },

  {
    id: 'usa-par',
    matchday: 2,
    dateISO: '2026-06-12',
    kickoffBST: '23:00',
    group: 'D',
    venue: 'SoFi Stadium, Los Angeles',
    home: 'USA',
    away: 'Paraguay',
    predHome: 2,
    predAway: 1,
    predType: 'favourite-tight',
    scorerCall: 'Pulisic',
    scorerCallType: 'score-or-assist',
    reasoning: 'USA at home with a massive atmosphere. Pulisic the most dangerous creative threat. Paraguay defensively organised but outclassed in the final third.',
    actualHome: 4,
    actualAway: 1,
    scorers: ['Balogun', 'Balogun', 'Reyna', 'Mauricio'],
    assisters: ['Pulisic'],
    actualNotes: 'Bobadilla OG 7, Balogun brace, Reyna late; Mauricio 73. Pulisic assisted the opener.',
  },

  // ── MATCHDAY 3 ─────────────────────────────────────────────────────────────

  {
    id: 'qat-sui',
    matchday: 3,
    dateISO: '2026-06-13',
    kickoffBST: '18:00',
    group: 'B',
    venue: "Levi's Stadium, Santa Clara",
    home: 'Qatar',
    away: 'Switzerland',
    predHome: 0,
    predAway: 2,
    predType: 'mismatch',
    scorerCall: 'Embolo',
    scorerCallType: 'score',
    reasoning: "Switzerland are technically superior in every department. Qatar hosting the World Cup once doesn't translate to another continent. Embolo is the focal point and the obvious pick.",
    actualHome: 1,
    actualAway: 1,
    scorers: ['Embolo', 'Khoukhi'],
    actualNotes: 'Embolo 17 pen; Khoukhi in stoppage time. Switzerland 23 shots. Got the scorer, missed the result badly.',
  },

  {
    id: 'bra-mar',
    matchday: 3,
    dateISO: '2026-06-13',
    kickoffBST: '21:00',
    group: 'C',
    venue: 'MetLife Stadium, New Jersey',
    home: 'Brazil',
    away: 'Morocco',
    predHome: 2,
    predAway: 1,
    predType: 'favourite-tight',
    scorerCall: 'Vinicius Jr',
    scorerCallType: 'score',
    reasoning: 'Brazil should have enough quality to edge Morocco despite flagging this as a banana-skin game. Morocco beat Spain in 2022. Vinicius is the obvious pick for the most dangerous Brazilian.',
    actualHome: 1,
    actualAway: 1,
    scorers: ['Vinicius Jr', 'Saibari'],
    actualNotes: 'Saibari 21; Vinicius 32. Called the banana skin explicitly. Got the scorer, missed the result.',
  },

  {
    id: 'hai-sco',
    matchday: 3,
    dateISO: '2026-06-13',
    kickoffBST: '23:00',
    group: 'C',
    venue: 'Gillette Stadium, Boston',
    home: 'Haiti',
    away: 'Scotland',
    predHome: 0,
    predAway: 1,
    predType: 'favourite-tight',
    scorerCall: 'Che Adams',
    scorerCallType: 'score',
    reasoning: "Scotland's recalibrated approach: discipline over flair. Haiti have heart but no top-flight striker threat. 1-0 is the clean-sheet template. Che Adams as mobile focal point.",
    actualHome: 0,
    actualAway: 1,
    scorers: ['McGinn'],
    assisters: ['Che Adams'],
    actualNotes: 'McGinn 28, Adams started the move. Recalibration vindicated — Scotland top Group C.',
  },

  // ── MATCHDAY 4 ─────────────────────────────────────────────────────────────

  {
    id: 'aus-tur',
    matchday: 4,
    dateISO: '2026-06-14',
    kickoffBST: '16:00',
    group: 'D',
    venue: 'BC Place, Vancouver',
    home: 'Australia',
    away: 'Türkiye',
    predHome: 1,
    predAway: 2,
    predType: 'favourite-tight',
    reasoning: 'Informal lean only — not formally logged. Türkiye carry better squad depth and European knockout experience. Expected a tight match with Türkiye edging it.',
    actualHome: 2,
    actualAway: 0,
    scorers: ['Irankunda', 'Metcalfe'],
    actualNotes: 'Irankunda 27, Metcalfe 75. Türkiye 59% possession, 30 shots — GK Beach 8 saves. Underdog won outright.',
    informalOnly: true,
  },

  {
    id: 'ger-cur',
    matchday: 4,
    dateISO: '2026-06-14',
    kickoffBST: '18:00',
    group: 'E',
    venue: 'NRG Stadium, Houston',
    home: 'Germany',
    away: 'Curaçao',
    predHome: 4,
    predAway: 0,
    predType: 'mismatch',
    scorerCall: 'Havertz',
    scorerCallType: 'score',
    reasoning: "Curaçao rank 82nd and are making their World Cup debut after losing 4-1 to Scotland. Germany are on a 9-game win streak scoring 28 goals. Biggest mismatch on the slate. One caveat: patience against a low block — Germany may take time to break them down.",
    actualHome: 7,
    actualAway: 1,
    scorers: ['Nmecha', 'Comenencia', 'Schlotterbeck', 'Havertz', 'Musiala', 'Brown', 'Undav'],
    actualNotes: 'Nmecha 6; Comenencia 21 (Curaçao first-ever WC goal, levelled at 1-1); Schlotterbeck, Havertz pen, Musiala, Brown, Undav piled on. Caveat landed — block held briefly.',
  },

  {
    id: 'ned-jpn',
    matchday: 4,
    dateISO: '2026-06-14',
    kickoffBST: '21:00',
    group: 'F',
    venue: "AT&T Stadium, Arlington",
    home: 'Netherlands',
    away: 'Japan',
    predHome: 1,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Gakpo',
    scorerCallType: 'score',
    reasoning: "Lowest-confidence call on the slate. Held after a deep recheck — Opta 49/25/26. Backing the narrow Dutch win is backing the single highest-probability outcome; backing the draw means picking the least likely. Worries: Dutch defensive crisis (Timber, Simons, de Ligt all out/doubtful) and Japan's 3-4-2-1 wing-backs targeting the high Dutch full-backs. Still holds because de Jong and Gravenberch control the midfield and Japan miss Mitoma/Minamino/Endo. Gakpo is the only Netherlands forward nailed on to start.",
    actualHome: 2,
    actualAway: 2,
    scorers: ['Van Dijk', 'Summerville', 'Nakamura', 'Kamada'],
    assisters: ['Gravenberch'],
    actualNotes: "Van Dijk 51 (Gravenberch cross); Nakamura 57 deflected; Summerville 64; Kamada 89 off a corner. Dutch led twice, pegged back twice. 69% possession, couldn't see it out. Process was defensible (draw was least-likely at 25%) — but gut flagged the draw danger three times and was right. Late set-piece equaliser is exactly the even-opener pattern all tournament.",
  },

  {
    id: 'civ-ecu',
    matchday: 4,
    dateISO: '2026-06-14',
    kickoffBST: '23:00',
    group: 'E',
    venue: 'Lincoln Financial Field, Philadelphia',
    home: 'Ivory Coast',
    away: 'Ecuador',
    predHome: 1,
    predAway: 1,
    predType: 'draw',
    scorerCall: 'Amad Diallo',
    scorerCallType: 'score',
    reasoning: 'Even game — market Ecuador 41 / draw 34 / CIV 28. Ecuador are unbeaten in 19. Ivory Coast beat France away on 4 June. Neither side has a decisive edge; the draw is the honest call. Amad Diallo is in exceptional form.',
  },

  {
    id: 'swe-tun',
    matchday: 4,
    dateISO: '2026-06-15',
    kickoffBST: '03:00',
    group: 'F',
    venue: 'Estadio BBVA, Monterrey',
    home: 'Sweden',
    away: 'Tunisia',
    predHome: 2,
    predAway: 1,
    predType: 'rule-bend',
    scorerCall: 'Gyokeres',
    scorerCallType: 'score',
    reasoning: "Attacking mismatch: Gyokeres and Isak are proven Premier League-level strikers; Tunisia have no top-5-league striker and shipped 5 goals to Belgium. Bending the rule here because Tunisia's clean-sheet discipline and cautious opener style means they'll nick one. Sweden win, but Tunisia make them work for it.",
  },

  // ── MATCHDAY 5 ─────────────────────────────────────────────────────────────

  {
    id: 'eng-cro',
    matchday: 5,
    dateISO: '2026-06-17',
    kickoffBST: '21:00',
    group: 'L',
    venue: "AT&T Stadium, Arlington",
    home: 'England',
    away: 'Croatia',
    predHome: 1,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Kane',
    scorerCallType: 'score',
    reasoning: "Revised from 2-1; a 1-1 would be no surprise. Even European openers often don't resolve cleanly. Croatia are aging (Modric turns 41 in September) but have never been beaten comfortably. England's squad depth is their biggest edge. 2018 semi rematch. Kane the obvious call if England carve out enough chances.",
  },

];
