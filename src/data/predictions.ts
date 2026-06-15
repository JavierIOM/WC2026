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
  confidence?: number;  // 0-100, probability that result call (H/D/A) is correct
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
    reasoning: 'Mexico at the Azteca in a home World Cup opener. South Africa ranked 82nd. Classic mismatch: the multi-goal margin is justified on paper and emotionally. Red-card-heavy Mexico games are still Mexico wins.',
    confidence: 70,
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
    reasoning: "Korea's tournament pedigree and Son Heung-min's creativity edges Czechia. Narrow win expected. Czechia will create, Korea should close out.",
    confidence: 65,
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
    reasoning: 'Canada at home in their first home World Cup match: the emotional wave, the crowd, and Jonathan David in Ligue 1 form. Bosnia are competitive but Canada should control.',
    confidence: 55,
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
    confidence: 70,
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
    confidence: 55,
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
    confidence: 55,
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
    confidence: 65,
    actualHome: 0,
    actualAway: 1,
    scorers: ['McGinn'],
    assisters: ['Che Adams'],
    actualNotes: 'McGinn 28, Adams started the move. Recalibration vindicated. Scotland top Group C.',
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
    reasoning: 'Informal lean only, not formally logged. Türkiye carry better squad depth and European knockout experience. Expected a tight match with Türkiye edging it.',
    confidence: 60,
    actualHome: 2,
    actualAway: 0,
    scorers: ['Irankunda', 'Metcalfe'],
    actualNotes: 'Irankunda 27, Metcalfe 75. Türkiye 59% possession, 30 shots. GK Beach 8 saves. Underdog won outright.',
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
    reasoning: "Curaçao rank 82nd and are making their World Cup debut after losing 4-1 to Scotland. Germany are on a 9-game win streak scoring 28 goals. Biggest mismatch on the slate. One caveat: patience against a low block. Germany may take time to break them down.",
    confidence: 80,
    actualHome: 7,
    actualAway: 1,
    scorers: ["Nmecha 6'", "Comenencia 21' (Curacao)", "Schlotterbeck 38'", "Havertz 45+5' pen", "Musiala 47'", "Brown 68'", "Undav 78'", "Havertz 88'"],
    actualNotes: "Nmecha 6, Comenencia 21 (Curaçao, levelled 1-1), Schlotterbeck 38, Havertz pen 45+5, Musiala 47, Brown 68, Undav 78, Havertz 88. Called 4-0, got 7-1. Badly undershot the ceiling.",
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
    reasoning: "Lowest-confidence call on the slate. Held after a deep recheck (Opta 49/25/26). Backing the narrow Dutch win is backing the single highest-probability outcome; backing the draw means picking the least likely. Worries: Dutch defensive crisis (Timber, Simons, de Ligt all out/doubtful) and Japan's 3-4-2-1 wing-backs targeting the high Dutch full-backs. Still holds because de Jong and Gravenberch control the midfield and Japan miss Mitoma/Minamino/Endo. Gakpo is the only Netherlands forward nailed on to start.",
    confidence: 55,
    actualHome: 2,
    actualAway: 2,
    scorers: ["Van Dijk 51'", "Summerville 64'", "Nakamura 57' (Japan)", "Kamada 89' (Japan)"],
    assisters: ['Gravenberch'],
    actualNotes: "Van Dijk 51 (Gravenberch cross); Nakamura 57 deflected; Summerville 64; Kamada 89 off a corner. Dutch led twice, pegged back twice. 69% possession, couldn't see it out. Process was defensible (draw was least-likely at 25%) but gut flagged the draw danger three times and was right. Late set-piece equaliser is exactly the even-opener pattern all tournament.",
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
    reasoning: 'Even game: market Ecuador 41 / draw 34 / CIV 28. Ecuador are unbeaten in 19. Ivory Coast beat France away on 4 June. Neither side has a decisive edge; the draw is the honest call. Amad Diallo is in exceptional form.',
    confidence: 40,
    actualHome: 1,
    actualAway: 0,
    scorers: ["Amad Diallo 90'"],
    assisters: ['Singo'],
    actualNotes: "Ecuador hit the woodwork 3x and dominated early. Amad Diallo off the bench, winner in the 90th (Singo assist). Called 1-1, Ivory Coast won 1-0.",
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
    confidence: 80,
    actualHome: 5,
    actualAway: 1,
    scorers: ["Ayari 7'", "Isak 30'", "Gyokeres 59'", "Svanberg 84'", "Ayari 90+6'", "Rekik 43' (Tunisia)"],
    actualNotes: "Ayari 7, Isak 30, Rekik 43 (Tunisia), Gyokeres 59, Svanberg 84, Ayari 90+6. Called Sweden 2-1; actual 5-1. Right direction, badly undershot the margin.",
  },

  // ── MATCHDAY 7 ─────────────────────────────────────────────────────────────

  {
    id: 'eng-cro',
    matchday: 7,
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
    confidence: 60,
  },

  {
    id: 'gha-pan',
    matchday: 7,
    dateISO: '2026-06-18',
    kickoffBST: '00:00',
    group: 'L',
    venue: 'BMO Field, Toronto',
    home: 'Ghana',
    away: 'Panama',
    predHome: 1,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Kudus',
    scorerCallType: 'score',
    reasoning: "Even game between two sides of similar quality. Ghana have the edge in flair and attacking threat. Panama will be organised and hard to break down. Kudus is Ghana's most dangerous player. Narrow 1-0 favourite call.",
    confidence: 60,
  },

  {
    id: 'uzb-col',
    matchday: 7,
    dateISO: '2026-06-18',
    kickoffBST: '03:00',
    group: 'K',
    venue: 'Estadio Azteca, Mexico City',
    home: 'Uzbekistan',
    away: 'Colombia',
    predHome: 0,
    predAway: 2,
    predType: 'mismatch',
    scorerCall: 'Luis Díaz',
    scorerCallType: 'score',
    reasoning: "Colombia are clear favourites. Uzbekistan are improving but this is a significant quality gap at tournament level. Luis Díaz is Colombia's most dangerous threat and the natural scorer pick. 0-2 away win.",
    confidence: 60,
  },

  // ── MATCHDAY 5 — Monday 15 June ────────────────────────────────────────────

  {
    id: 'esp-cpv',
    matchday: 5,
    dateISO: '2026-06-15',
    kickoffBST: '18:00',
    group: 'H',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    home: 'Spain',
    away: 'Cape Verde',
    predHome: 3,
    predAway: 0,
    predType: 'mismatch',
    scorerCall: 'Yamal',
    scorerCallType: 'score',
    reasoning: "Spain are European champions with the best midfield in the tournament. Cape Verde are a decent African side but this is a clear mismatch in class. Spain's possession game will suffocate them and the 3-0 margin is fully justified. Yamal as the talisman.",
    confidence: 80,
    actualHome: 0,
    actualAway: 0,
    scorers: [],
    actualNotes: "Biggest shock of the tournament. Spain had 27 shots, 7 on target, Torres hit the bar; 40-year-old keeper Vozinha made 8 saves. Yamal came off the bench and didn't score. Called Spain 3-0 mismatch: first time a genuine mismatch failed to deliver.",
  },

  {
    id: 'bel-egy',
    matchday: 5,
    dateISO: '2026-06-15',
    kickoffBST: '20:00',
    group: 'G',
    venue: 'Lumen Field, Seattle',
    home: 'Belgium',
    away: 'Egypt',
    predHome: 2,
    predAway: 1,
    predType: 'favourite-tight',
    scorerCall: 'De Bruyne',
    scorerCallType: 'score-or-assist',
    reasoning: "Belgium carry genuine quality in attack and should control this. Egypt keep it tight with Salah as the outlet on the break. They will nick one. 2-1 reflects a real game rather than a rout. De Bruyne (Lukaku benched) as the creative hub and most likely to contribute.",
    confidence: 55,
    actualHome: 1,
    actualAway: 1,
    scorers: ["Ashour 19' (Egypt)", "Hany 66' OG (Belgium)"],
    actualNotes: "Egypt led via Ashour's 20-yard strike at 19 minutes. De Bruyne hit the post. Lukaku came on around 66 minutes; his presence forced Hany's own goal 22 seconds later. Called Belgium 2-1, scorer De Bruyne: result MISS, scorer MISS (goal was an own goal).",
  },

  {
    id: 'ksa-uru',
    matchday: 5,
    dateISO: '2026-06-15',
    kickoffBST: '23:00',
    group: 'H',
    venue: 'Hard Rock Stadium, Miami',
    home: 'Saudi Arabia',
    away: 'Uruguay',
    predHome: 0,
    predAway: 1,
    predType: 'favourite-tight',
    scorerCall: 'Darwin Núñez',
    scorerCallType: 'score',
    reasoning: "Uruguay are the stronger side. Darwin Núñez is the attacking threat. Saudi Arabia have some tournament pedigree from 2022 but Uruguay's quality edges this to a tight away win. 0-1 is the method: back the favourite to a scoreline, no more.",
    confidence: 60,
  },

  {
    id: 'irn-nzl',
    matchday: 5,
    dateISO: '2026-06-16',
    kickoffBST: '05:00',
    group: 'G',
    venue: 'SoFi Stadium, Los Angeles',
    home: 'Iran',
    away: 'New Zealand',
    predHome: 1,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Taremi',
    scorerCallType: 'score',
    reasoning: "Iran are the clear favourite here. New Zealand will be compact and organised but Iran have enough quality. Taremi is the most dangerous forward and the natural pick. Low-scoring 1-0 favourite call.",
    confidence: 60,
  },

  // ── MATCHDAY 6 — Tuesday 16 June ───────────────────────────────────────────

  {
    id: 'fra-sen',
    matchday: 6,
    dateISO: '2026-06-16',
    kickoffBST: '20:00',
    group: 'I',
    venue: 'MetLife Stadium, New Jersey',
    home: 'France',
    away: 'Senegal',
    predHome: 1,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Mbappé',
    scorerCallType: 'score',
    reasoning: "France are the stronger side but Senegal are genuinely dangerous and this is exactly the profile that has been drawing all tournament. The draw is very live. Leaning France to a narrow 1-0 on Mbappé quality, but flagging this as one of the genuine coin-flips of the week. If anything the even-opener pattern says lean further toward the draw.",
    confidence: 60,
  },

  {
    id: 'irq-nor',
    matchday: 6,
    dateISO: '2026-06-16',
    kickoffBST: '23:00',
    group: 'I',
    venue: 'Gillette Stadium, Boston',
    home: 'Iraq',
    away: 'Norway',
    predHome: 0,
    predAway: 2,
    predType: 'mismatch',
    scorerCall: 'Haaland',
    scorerCallType: 'score',
    reasoning: "Norway with Haaland are the clear favourite. Iraq will make this hard but Norway's attacking quality is too much to contain over 90 minutes. Haaland the obvious pick. 0-2 away win.",
    confidence: 60,
  },

  {
    id: 'arg-alg',
    matchday: 6,
    dateISO: '2026-06-17',
    kickoffBST: '02:00',
    group: 'J',
    venue: 'Arrowhead Stadium, Kansas City',
    home: 'Argentina',
    away: 'Algeria',
    predHome: 2,
    predAway: 0,
    predType: 'mismatch',
    scorerCall: 'Lautaro Martínez',
    scorerCallType: 'score',
    reasoning: "Argentina are strong favourites, reigning world champions with a squad built for tournament football. Algeria have improved but the gap in pedigree is too large. Lautaro Martínez as the focal point. 2-0.",
    confidence: 60,
  },

  {
    id: 'aut-jor',
    matchday: 6,
    dateISO: '2026-06-17',
    kickoffBST: '05:00',
    group: 'J',
    venue: "Levi's Stadium, Santa Clara",
    home: 'Austria',
    away: 'Jordan',
    predHome: 2,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Baumgartner',
    scorerCallType: 'score',
    reasoning: "Austria are clearly the stronger side. Jordan will organise well but lack the attacking quality to threaten. Baumgartner is the creative hub for Austria. 2-0 clean sheet expected.",
    confidence: 60,
  },

  // ── MATCHDAY 7 — Wednesday 17 June (continued) ─────────────────────────────

  {
    id: 'por-cod',
    matchday: 7,
    dateISO: '2026-06-17',
    kickoffBST: '18:00',
    group: 'K',
    venue: 'NRG Stadium, Houston',
    home: 'Portugal',
    away: 'DR Congo',
    predHome: 3,
    predAway: 0,
    predType: 'mismatch',
    scorerCall: 'Ronaldo',
    scorerCallType: 'score',
    reasoning: "Portugal are clear favourites. DR Congo are the weakest side in Group K on paper. Ronaldo will be motivated: this could be his last World Cup. Mismatch margin fully allowed. Dark horse caveat applies to the tournament, not to this specific game.",
    confidence: 60,
  },

  // ── MATCHDAY 8 — Thursday 18 June ──────────────────────────────────────────

  {
    id: 'cze-rsa',
    matchday: 8,
    dateISO: '2026-06-18',
    kickoffBST: '17:00',
    group: 'A',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    home: 'Czechia',
    away: 'South Africa',
    predHome: 1,
    predAway: 1,
    predType: 'draw',
    scorerCall: 'Schick',
    scorerCallType: 'score',
    reasoning: "Genuinely even game. South Africa will be motivated and organised after the opening loss to Mexico. Czechia have a quality edge but not enough to back them with confidence. Deliberate draw call. Schick is Czechia's danger man.",
    confidence: 60,
  },

  {
    id: 'sui-bih',
    matchday: 8,
    dateISO: '2026-06-18',
    kickoffBST: '20:00',
    group: 'B',
    venue: 'SoFi Stadium, Los Angeles',
    home: 'Switzerland',
    away: 'Bosnia',
    predHome: 2,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Embolo',
    scorerCallType: 'score',
    reasoning: "Switzerland had 23 shots against Qatar and drew. They will be fuming and must win here. Bosnia are capable but Switzerland with a point to prove should control this. Embolo the scorer pick again. 2-0 clean sheet.",
    confidence: 60,
  },

  {
    id: 'can-qat',
    matchday: 8,
    dateISO: '2026-06-18',
    kickoffBST: '23:00',
    group: 'B',
    venue: 'BC Place, Vancouver',
    home: 'Canada',
    away: 'Qatar',
    predHome: 2,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Jonathan David',
    scorerCallType: 'score',
    reasoning: "Canada at home again after the frustrating draw with Bosnia. Qatar were held by Switzerland despite 23 shots against them. Canada are the stronger side and the home crowd will drive them. Jonathan David gets another chance to deliver. 2-0.",
    confidence: 60,
  },

  {
    id: 'mex-kor',
    matchday: 8,
    dateISO: '2026-06-19',
    kickoffBST: '04:00',
    group: 'A',
    venue: 'Estadio Akron, Guadalajara',
    home: 'Mexico',
    away: 'South Korea',
    predHome: 1,
    predAway: 1,
    predType: 'draw',
    scorerCall: 'Santiago Giménez',
    scorerCallType: 'score',
    reasoning: "Top-of-group clash between two sides who both won their openers. Mexico at home but South Korea have real quality with Son and Hwang. Even matchup, high stakes on both sides. Deliberate draw call. Santiago Giménez as Mexico's focal point.",
    confidence: 60,
  },

  // ── MATCHDAY 9 — Friday 19 June ────────────────────────────────────────────

  {
    id: 'usa-aus',
    matchday: 9,
    dateISO: '2026-06-19',
    kickoffBST: '20:00',
    group: 'D',
    venue: 'Lumen Field, Seattle',
    home: 'USA',
    away: 'Australia',
    predHome: 1,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Pulisic',
    scorerCallType: 'score-or-assist',
    reasoning: "Both won their MD1 matches. USA have the home crowd advantage but Australia showed real fight against Türkiye. Narrow edge to USA. This is exactly the even-opener profile that has been drawing all tournament, one of the genuine coin-flips of the week. Backing USA on home soil. Pulisic as the creative hub.",
    confidence: 60,
  },

  {
    id: 'sco-mar',
    matchday: 9,
    dateISO: '2026-06-19',
    kickoffBST: '23:00',
    group: 'C',
    venue: 'Gillette Stadium, Boston',
    home: 'Scotland',
    away: 'Morocco',
    predHome: 0,
    predAway: 1,
    predType: 'favourite-tight',
    scorerCall: 'En-Nesyri',
    scorerCallType: 'score',
    reasoning: "Revised from 1-1. Morocco are the better side and the draw was a reach, not an honest call. The lesson from the CIV-ECU call: even games resolve narrow, not flat. Scotland will defend deep as always but Morocco have the quality to find a winner. 0-1, En-Nesyri the threat.",
    confidence: 60,
  },

  {
    id: 'bra-hai',
    matchday: 9,
    dateISO: '2026-06-20',
    kickoffBST: '02:00',
    group: 'C',
    venue: 'Lincoln Financial Field, Philadelphia',
    home: 'Brazil',
    away: 'Haiti',
    predHome: 3,
    predAway: 0,
    predType: 'mismatch',
    scorerCall: 'Vinicius Jr',
    scorerCallType: 'score',
    reasoning: "Brazil will be coming out with a point to prove after the Morocco draw. Haiti are significantly outclassed at this level. Mismatch: the full multi-goal margin is justified. Vinicius Jr the talisman.",
    confidence: 60,
  },

  {
    id: 'tur-par',
    matchday: 9,
    dateISO: '2026-06-20',
    kickoffBST: '05:00',
    group: 'D',
    venue: "Levi's Stadium, Santa Clara",
    home: 'Türkiye',
    away: 'Paraguay',
    predHome: 1,
    predAway: 0,
    predType: 'favourite-tight',
    scorerCall: 'Arda Güler',
    scorerCallType: 'score',
    reasoning: "Both teams are desperate for points after difficult MD1 results. Tight game with a lot riding on it. Türkiye have the creative edge with Arda Güler. 1-0 narrow call: the method says lean the favourite to a scoreline, not a rout.",
    confidence: 60,
  },

];
