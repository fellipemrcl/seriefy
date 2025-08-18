import { MediaResult, SeriesDetails } from '@/app/actions';

export interface FavoriteItem extends MediaResult {
  addedAt: string;
  seriesDetails?: SeriesDetails;
}

const FAVORITES_KEY = 'seriefy-favorites';

export const favoriteStorage = {
  // Get all favorites from localStorage
  getFavorites(): FavoriteItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },

  // Add a series to favorites
  addFavorite(item: MediaResult, seriesDetails?: SeriesDetails): FavoriteItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const favorites = this.getFavorites();
      const isAlreadyFavorite = favorites.some(fav => fav.id === item.id);
      
      if (!isAlreadyFavorite) {
        const newFavorite: FavoriteItem = {
          ...item,
          addedAt: new Date().toISOString(),
          seriesDetails
        };
        const updatedFavorites = [newFavorite, ...favorites];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
        return updatedFavorites;
      }
      return favorites;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return this.getFavorites();
    }
  },

  // Remove a series from favorites
  removeFavorite(id: number): FavoriteItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const favorites = this.getFavorites();
      const updatedFavorites = favorites.filter(fav => fav.id !== id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return this.getFavorites();
    }
  },

  // Check if a series is favorited
  isFavorite(id: number): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const favorites = this.getFavorites();
      return favorites.some(fav => fav.id === id);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  // Update series details for a favorite
  updateSeriesDetails(id: number, seriesDetails: SeriesDetails): FavoriteItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const favorites = this.getFavorites();
      const updatedFavorites = favorites.map(fav => 
        fav.id === id ? { ...fav, seriesDetails } : fav
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      console.error('Error updating series details:', error);
      return this.getFavorites();
    }
  }
};

// Calculate estimated viewing time
export const calculateViewingTime = (totalEpisodes: number, averageEpisodeLength: number = 45) => {
  const totalMinutes = totalEpisodes * averageEpisodeLength;
  const hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  } else {
    return `${hours}h ${totalMinutes % 60}m`;
  }
};

// Calculate episodes per day for different timeframes
export const calculateScheduleOptions = (totalEpisodes: number) => {
  const timeframes = [
    { days: 7, label: '1 week' },
    { days: 14, label: '2 weeks' },
    { days: 30, label: '1 month' },
    { days: 60, label: '2 months' },
    { days: 90, label: '3 months' }
  ];

  return timeframes.map(timeframe => ({
    ...timeframe,
    episodesPerDay: Math.ceil(totalEpisodes / timeframe.days)
  }));
};
