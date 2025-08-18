import React, { useState } from 'react';
import Image from 'next/image';

interface EpisodeCardProps {
  episode: {
    id: number;
    name: string;
    episode_number: number;
    still_path: string | null;
    runtime?: number | null;
  };
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImageUrl = (path: string | null) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder.svg';
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="relative w-full h-32">
        {!imageLoaded && <div className="absolute inset-0 bg-gray-700 animate-pulse" />}
        <Image
          src={getImageUrl(episode.still_path)}
          alt={episode.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <div className="p-2">
        <p className="text-sm font-bold truncate">{episode.episode_number}. {episode.name}</p>
        {episode.runtime && <p className="text-xs text-gray-400">{episode.runtime} min</p>}
      </div>
    </div>
  );
};

export default EpisodeCard;
