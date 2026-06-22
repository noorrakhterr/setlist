const axios = require("axios");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchConcertsByArtist(artistName, city, radius = 50) {
  try {
    const response = await axios.get(
      "https://app.ticketmaster.com/discovery/v2/events.json",
      {
        params: {
          keyword: artistName,
          city,
          radius,
          unit: "miles",
          classificationName: "music",
          sort: "date,asc",
          size: 5,
          apikey: process.env.TICKETMASTER_API_KEY,
        },
      }
    );

    const events = response.data?._embedded?.events;
    if (!events || events.length === 0) return [];

    return events.map((event) => {
      const venue = event._embedded?.venues?.[0];
      const image16x9 = event.images?.find(
        (img) => img.ratio === "16_9" && img.width > 1000
      );

      return {
        eventId: event.id,
        name: event.name,
        url: event.url,
        date: event.dates?.start?.dateTime ?? event.dates?.start?.localDate,
        venue: venue?.name ?? "Venue TBD",
        city: venue?.city?.name ?? city,
        state: venue?.state?.stateCode ?? "",
        imageUrl: image16x9?.url ?? event.images?.[0]?.url ?? null,
        minPrice: event.priceRanges?.[0]?.min ?? null,
        maxPrice: event.priceRanges?.[0]?.max ?? null,
      };
    });
  } catch (err) {
    console.error(`Ticketmaster search failed for "${artistName}":`, err.message);
    return [];
  }
}

async function getUpcomingConcertsForArtists(artists, city) {
  const limited = artists.slice(0, 20);
  const allResults = [];

  for (let i = 0; i < limited.length; i++) {
    if (i > 0) await sleep(250);

    const { artistName, rank } = limited[i];
    const concerts = await searchConcertsByArtist(artistName, city);

    const enriched = concerts.map((concert) => ({
      ...concert,
      artistRank: rank,
      artistName,
      listenScore: Math.max(0, Math.round(((20 - rank) / 20) * 100)),
    }));

    allResults.push(...enriched);
  }

  const seen = new Set();
  const deduped = allResults.filter((concert) => {
    if (seen.has(concert.eventId)) return false;
    seen.add(concert.eventId);
    return true;
  });

  return deduped.sort((a, b) => {
    if (a.artistRank !== b.artistRank) return a.artistRank - b.artistRank;
    return new Date(a.date) - new Date(b.date);
  });
}

module.exports = { searchConcertsByArtist, getUpcomingConcertsForArtists };
