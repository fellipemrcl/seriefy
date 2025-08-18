'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { favoriteStorage, FavoriteItem, calculateViewingTime, calculateScheduleOptions } from '@/lib/favorites';
import { getSeriesDetails } from '@/app/actions';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<number[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      const storedFavorites = favoriteStorage.getFavorites();
      setFavorites(storedFavorites);
      setLoading(false);

      // Load series details for favorites that don't have them
      const favoritesWithoutDetails = storedFavorites.filter(fav => !fav.seriesDetails);
      if (favoritesWithoutDetails.length > 0) {
        setLoadingDetails(favoritesWithoutDetails.map(fav => fav.id));
        
        for (const favorite of favoritesWithoutDetails) {
          try {
            const details = await getSeriesDetails(favorite.id);
            if (details) {
              const updatedFavorites = favoriteStorage.updateSeriesDetails(favorite.id, details);
              setFavorites(updatedFavorites);
            }
          } catch (error) {
            console.error(`Failed to load details for series ${favorite.id}:`, error);
          } finally {
            setLoadingDetails(prev => prev.filter(id => id !== favorite.id));
          }
        }
      }
    };

    loadFavorites();
  }, []);

  const removeFavorite = (id: number) => {
    const updatedFavorites = favoriteStorage.removeFavorite(id);
    setFavorites(updatedFavorites);
  };

  const getImageUrl = (path: string | null) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder.svg';
  };

  const getTotalViewingStats = () => {
    const totalEpisodes = favorites.reduce((sum, fav) => 
      sum + (fav.seriesDetails?.total_episodes || 0), 0
    );
    const totalHours = Math.floor((totalEpisodes * 45) / 60); // Assuming 45min per episode
    const totalDays = Math.floor(totalHours / 24);
    
    return { totalEpisodes, totalHours, totalDays };
  };

  const stats = getTotalViewingStats();

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-xl text-gray-300">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">❤️</span>
          </div>
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent">
              My Favorites
            </h1>
            <p className="text-gray-300 text-lg">Your curated collection of amazing series</p>
          </div>
        </div>

        {/* Stats Overview */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{favorites.length}</div>
              <div className="text-sm text-gray-400">Series</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{stats.totalEpisodes}</div>
              <div className="text-sm text-gray-400">Episodes</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalHours}h</div>
              <div className="text-sm text-gray-400">Total Time</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-pink-400 mb-1">{stats.totalDays}d</div>
              <div className="text-sm text-gray-400">Days of Content</div>
            </div>
          </div>
        )}
      </div>

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-6">💔</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h3>
          <p className="text-gray-400 text-center max-w-md mb-6">
            Start adding your favorite series to build your personal collection and track your viewing progress.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-200 hover:scale-105">
              <span className="mr-2">🔍</span>
              Discover Series
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const isLoadingDetails = loadingDetails.includes(favorite.id);
            const totalEpisodes = favorite.seriesDetails?.total_episodes || 0;
            const scheduleOptions = totalEpisodes > 0 ? calculateScheduleOptions(totalEpisodes) : [];
            
            return (
              <Card key={favorite.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group overflow-hidden">
                <div className="relative">
                  <Image
                    src={getImageUrl(favorite.poster_path)}
                    alt={favorite.name || 'Series poster'}
                    width={500}
                    height={192}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFavorite(favorite.id)}
                      className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50 rounded-full p-2 h-8 w-8"
                    >
                      <span className="text-sm">❌</span>
                    </Button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-black/50 text-white border-0">
                      {favorite.number_of_seasons} {favorite.number_of_seasons === 1 ? 'season' : 'seasons'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {favorite.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Added {format(new Date(favorite.addedAt), 'MMM dd, yyyy')}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-gray-400">Loading details...</span>
                    </div>
                  ) : favorite.seriesDetails ? (
                    <>
                      {/* Episode Info */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-300">Episodes</span>
                          <span className="text-lg font-bold text-white">{totalEpisodes}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          ≈ {calculateViewingTime(totalEpisodes)} of content
                        </div>
                      </div>

                      {/* Quick Schedule Options */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Quick Schedule Options:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {scheduleOptions.slice(0, 4).map((option) => (
                            <div 
                              key={option.days}
                              className="bg-white/5 rounded-lg p-2 border border-white/10"
                            >
                              <div className="text-xs text-gray-400">{option.label}</div>
                              <div className="text-sm font-semibold text-white">
                                {option.episodesPerDay} ep/day
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Series Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-green-400">
                            {favorite.seriesDetails.seasons.length}
                          </div>
                          <div className="text-xs text-gray-400">Total Seasons</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-yellow-400">
                            {Math.round(totalEpisodes / (favorite.seriesDetails.seasons.length || 1))}
                          </div>
                          <div className="text-xs text-gray-400">Avg Episodes/Season</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">Details not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Back to Search Button */}
      {favorites.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-200 hover:scale-105">
              <span className="mr-2">🔍</span>
              Discover More Series
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
