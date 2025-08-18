'use server';

import { z } from 'zod';

// Schema to validate the search results
const mediaResultSchema = z.object({
  id: z.number(),
  name: z.string().optional(), // TV shows have name
  poster_path: z.string().nullable(),
  first_air_date: z.string().optional(), // TV
  number_of_seasons: z.number().optional(),
  popularity: z.number().optional(), // Add popularity field
});

const searchResponseSchema = z.object({
  results: z.array(mediaResultSchema),
});

const tvDetailsSchema = z.object({
  number_of_seasons: z.number(),
});

const seasonSchema = z.object({
  id: z.number(),
  name: z.string(),
  season_number: z.number(),
  episode_count: z.number().optional(),
});

const seriesDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  seasons: z.array(seasonSchema),
  total_episodes: z.number().optional(),
});

export type MediaResult = z.infer<typeof mediaResultSchema>;
export type SeriesDetails = z.infer<typeof seriesDetailsSchema>;

export async function searchMedia(query: string): Promise<MediaResult[]> {
  if (!query) {
    return [];
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error('TMDB API key is not configured.');
    return [];
  }

  const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error('Failed to fetch from TMDB API:', response.statusText);
      return [];
    }

    const data = await response.json();
    const validatedData = searchResponseSchema.safeParse(data);

    if (!validatedData.success) {
      console.error('Invalid data structure from TMDB API:', validatedData.error);
      return [];
    }

    const sortedResults = validatedData.data.results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const top3Results = sortedResults.slice(0, 1);

    const resultsWithSeasons = await Promise.all(
      top3Results.map(async (result) => {
        const details = await getTvShowDetails(result.id, apiKey);
        return {
          ...result,
          number_of_seasons: details?.number_of_seasons,
        };
      })
    );

    return resultsWithSeasons;
  } catch (error) {
    console.error('An error occurred while searching:', error);
    return [];
  }
}

async function getTvShowDetails(tvId: number, apiKey: string): Promise<{ number_of_seasons: number } | null> {
  const url = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch TV show details for id ${tvId}:`, response.statusText);
      return null;
    }
    const data = await response.json();
    const validatedData = tvDetailsSchema.safeParse(data);
    if (!validatedData.success) {
      console.error(`Invalid TV show details structure for id ${tvId}:`, validatedData.error);
      return null;
    }
    return validatedData.data;
  } catch (error) {
    console.error(`An error occurred while fetching details for id ${tvId}:`, error);
    return null;
  }
}

export async function getSeriesDetails(seriesId: number): Promise<SeriesDetails | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error('TMDB API key is not configured.');
    return null;
  }

  const seriesUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}&language=en-US`;

  try {
    const seriesResponse = await fetch(seriesUrl);
    if (!seriesResponse.ok) {
      console.error(`Failed to fetch series details for id ${seriesId}:`, seriesResponse.statusText);
      return null;
    }

    const seriesData = await seriesResponse.json();
    const validatedSeriesData = seriesDetailsSchema.safeParse(seriesData);

    if (!validatedSeriesData.success) {
      console.error(`Invalid series details structure for id ${seriesId}:`, validatedSeriesData.error);
      return null;
    }

    let totalEpisodes = 0;
    validatedSeriesData.data.seasons.forEach(season => {
      const seasonNameLower = season.name.toLowerCase();
      if (season.episode_count && seasonNameLower !== 'especiais' && seasonNameLower !== 'specials') {
        totalEpisodes += season.episode_count;
      }
    });

    return {
      ...validatedSeriesData.data,
      total_episodes: totalEpisodes,
    };

  } catch (error) {
    console.error(`An error occurred while fetching series details for id ${seriesId}:`, error);
    return null;
  }
}
