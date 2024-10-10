// API DOC: https://www.last.fm/api/show/track.search

// 楽曲のインターフェース
export interface LastFmTrack {
  mbid?: string;
  url: string;
  name: string;
  artist?: string;
  image?: {
    "#text": string;
    size: "small" | "medium" | "large" | "extralarge";
  }[];
}

interface TrackMatches {
  track: LastFmTrack[];
}

interface LastFmApiResponse {
  results: {
    trackmatches: TrackMatches;
  };
}

function createSearchUrl(apiKey: string, query: string, artist?: string, limit: number = 30, page: number = 1): string {
  const LAST_FM_API_URL = "http://ws.audioscrobbler.com/2.0/";
  let url = `${LAST_FM_API_URL}?method=track.search&track=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=${limit}&page=${page}`;
  if (artist) {
    url += `&artist=${encodeURIComponent(artist)}`;
  }
  return url;
}

// 楽曲を検索する
export async function searchTracks(apiKey: string, query: string, artist?: string, limit: number = 30, page: number = 1): Promise<LastFmTrack[]> {
  const url = createSearchUrl(apiKey, query, artist, limit, page);
  const response = await fetch(url);
  const data: LastFmApiResponse = await response.json();
  console.log(JSON.stringify(data.results.trackmatches.track, null, 2));

  return data.results.trackmatches.track.map(track => ({
    id: track.mbid || track.url,
    name: track.name,
    artist: track.artist,
    url: track.url,
    image: track.image
  }));
}