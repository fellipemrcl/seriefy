'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { favoriteStorage } from '@/lib/favorites';
import { MediaResult, SeriesDetails } from '@/app/actions';

interface FavoriteButtonProps {
  series: MediaResult;
  seriesDetails?: SeriesDetails;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton = ({ series, seriesDetails, onToggle }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsFavorite(favoriteStorage.isFavorite(series.id));
  }, [series.id]);

  const handleToggle = () => {
    setIsAnimating(true);
    
    if (isFavorite) {
      favoriteStorage.removeFavorite(series.id);
      setIsFavorite(false);
      onToggle?.(false);
    } else {
      favoriteStorage.addFavorite(series, seriesDetails);
      setIsFavorite(true);
      onToggle?.(true);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`rounded-full p-2 h-8 w-8 transition-all duration-300 ${
        isFavorite 
          ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' 
          : 'bg-white/10 border-white/20 text-gray-400 hover:bg-white/20'
      } ${isAnimating ? 'scale-125' : 'scale-100'}`}
    >
      <span className={`text-sm transition-transform duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}>
        {isFavorite ? '❤️' : '🤍'}
      </span>
    </Button>
  );
};

export default FavoriteButton;
