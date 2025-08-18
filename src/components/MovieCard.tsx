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
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col cursor-pointer transform transition-all duration-300"
      whileHover={{ 
        scale: 1.03,
        rotateY: 5,
        rotateX: 5,
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{ perspective: 1000 }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      {/* Image Container */}
      <div className="relative w-full h-80 overflow-hidden">
        <Image 
          src={posterUrl} 
          alt={title} 
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
          <span className="text-yellow-400 text-sm">⭐</span>
          <span className="text-white text-sm font-medium">TMDB</span>
        </div>
        
        {/* Seasons Badge */}
        {seasons && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">{seasons} Season{seasons > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-end relative">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
            {title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v1M7 4V3a1 1 0 00-1 1v1m0 0v16l4-2 4 2V6" />
              </svg>
              <span className="text-sm">Track Episodes</span>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover Effect Line */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-500" />
      </div>
    </motion.div>
  );
};

export default MovieCard;
