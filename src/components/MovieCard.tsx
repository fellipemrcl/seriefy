import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MovieCardProps {
  title: string;
  posterUrl: string;
  seasons?: number;
  onClick?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ title, posterUrl, seasons, onClick }) => {
  return (
    <motion.div
      className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="relative w-full h-96">
        <Image 
          src={posterUrl} 
          alt={title} 
          layout="fill" 
          objectFit="cover" 
          className="rounded-t-lg"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-800 to-transparent" />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-end">
        <h3 className="text-lg font-bold truncate">{title}</h3>
        {seasons && <p className="text-gray-400">Seasons: {seasons}</p>}
      </div>
    </motion.div>
  );
};

export default MovieCard;
