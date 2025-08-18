'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {favorites.map((favorite) => {
            const isLoadingDetails = loadingDetails.includes(favorite.id);
            const totalEpisodes = favorite.seriesDetails?.total_episodes || 0;
            const scheduleOptions = totalEpisodes > 0 ? calculateScheduleOptions(totalEpisodes) : [];
            
            return (
              <div 
                key={favorite.id} 
                className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/10 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                
                {/* Image Container with Enhanced Design */}
                <div className="relative overflow-hidden rounded-t-3xl">
                  <div className="relative w-full h-64 md:h-72 lg:h-80">
                    <Image
                      src={getImageUrl(favorite.poster_path)}
                      alt={favorite.name || 'Series poster'}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Sophisticated Overlay Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Floating Action Buttons */}
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFavorite(favorite.id)}
                        className="bg-red-500/20 backdrop-blur-md border-red-400/30 text-red-400 hover:bg-red-500/40 hover:border-red-400/50 hover:text-white rounded-full p-2 h-10 w-10 shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-110"
                      >
                        <span className="text-base">×</span>
                      </Button>
                    </div>
                    
                    {/* Enhanced Season Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
                        <span className="text-white text-sm font-bold tracking-wide">
                          {favorite.number_of_seasons} {favorite.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                        </span>
                      </div>
                    </div>

                    {/* Rating Indicator */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-2 flex items-center space-x-2 shadow-lg">
                        <span className="text-yellow-400 text-lg">⭐</span>
                        <span className="text-white text-sm font-medium">TMDB</span>
                      </div>
                    </div>
                    
                    {/* Title Overlay */}
                    <div className="absolute bottom-4 left-4 max-w-[70%]">
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-2xl">
                        {favorite.name}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1 drop-shadow-lg">
                        Added {format(new Date(favorite.addedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Content Section */}
                <div className="p-6 space-y-5">
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-3 border-pink-500/20 border-b-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                      </div>
                      <span className="ml-3 text-sm text-gray-300 font-medium">Loading details...</span>
                    </div>
                  ) : favorite.seriesDetails ? (
                    <>
                      {/* Enhanced Episode Info Card */}
                      <div className="relative bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-2xl p-4 border border-blue-400/30 shadow-lg overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
                        <div className="relative">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400 text-lg">📺</span>
                              <span className="text-sm font-semibold text-blue-300">Total Episodes</span>
                            </div>
                            <span className="text-2xl font-bold text-white">{totalEpisodes}</span>
                          </div>
                          <div className="text-xs text-gray-400 font-medium">
                            ≈ {calculateViewingTime(totalEpisodes)} of amazing content
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Schedule Options */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">⚡</span>
                          <h4 className="text-sm font-semibold text-gray-200">Quick Schedules</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {scheduleOptions.slice(0, 4).map((option, index) => (
                            <div 
                              key={option.days}
                              className="group/option relative bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 overflow-hidden"
                            >
                              <div className={`absolute top-0 right-0 w-8 h-8 rounded-full blur-xl transition-opacity duration-300 opacity-60 group-hover/option:opacity-100 ${
                                index === 0 ? 'bg-green-400/30' : 
                                index === 1 ? 'bg-blue-400/30' : 
                                index === 2 ? 'bg-purple-400/30' : 'bg-pink-400/30'
                              }`} />
                              <div className="relative">
                                <div className="text-xs text-gray-400 font-medium">{option.label}</div>
                                <div className="text-sm font-bold text-white mt-1">
                                  {option.episodesPerDay} ep/day
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Series Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                        <div className="text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-3 border border-green-400/20">
                          <div className="text-lg font-bold text-green-400 mb-1">
                            {favorite.seriesDetails.seasons.length}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">Seasons</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-3 border border-yellow-400/20">
                          <div className="text-lg font-bold text-yellow-400 mb-1">
                            {Math.round(totalEpisodes / (favorite.seriesDetails.seasons.length || 1))}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">Avg Ep/Season</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🤔</div>
                      <p className="text-sm text-gray-400">Details not available</p>
                    </div>
                  )}
                </div>

                {/* Subtle Hover Effect Line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 group-hover:w-full transition-all duration-700 ease-out rounded-full" />
              </div>
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
