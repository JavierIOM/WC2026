// Fetch live World Cup 2026 match data from ESPN public API
// No API key required — read-only scraping of public data

export const handler = async (event) => {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    if (!response.ok) throw new Error(`ESPN API error: ${response.status}`);

    const data = await response.json();
    const events = data.events || [];

    // Group by status and extract key fields
    const grouped = {
      live: [],
      halftime: [],
      upcoming: [],
      finished: [],
    };

    for (const event of events) {
      const match = {
        id: event.id,
        name: event.name,
        status: event.status?.type || 'UNKNOWN',
        competitors: event.competitors?.map(c => ({
          name: c.team?.name || c.displayName || 'Unknown',
          logo: c.team?.logo,
          score: c.score,
          uid: c.uid,
        })) || [],
        clock: event.status?.clock || null,
        displayClock: event.status?.displayClock || null,
        period: event.status?.period || null,
        venue: event.venue?.fullName || event.venue?.shortName || null,
        groups: event.groups || [],
        articles: event.articles?.slice(0, 3) || [],
      };

      // Classify by status
      const statusType = event.status?.type?.toLowerCase() || '';
      if (statusType === 'in') {
        grouped.live.push(match);
      } else if (statusType === 'ht') {
        grouped.halftime.push(match);
      } else if (statusType === 'pre') {
        grouped.upcoming.push(match);
      } else if (statusType === 'post') {
        grouped.finished.push(match);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        matches: grouped,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
