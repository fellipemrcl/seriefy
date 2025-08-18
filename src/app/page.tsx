'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MovieCard from "@/components/MovieCard";
import FavoriteButton from "@/components/FavoriteButton";
import { searchMedia, MediaResult, getSeriesDetails, SeriesDetails } from "./actions";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<MediaResult | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null);
  const [seriesDetails, setSeriesDetails] = useState<SeriesDetails | null>(null);
  const [desiredEpisodesPerDay, setDesiredEpisodesPerDay] = useState<number | null>(null);
  const [calculationMessage, setCalculationMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    const searchResults = await searchMedia(query);
    setResults(searchResults);
    setLoading(false);
  };

  const handleSeriesClick = async (seriesId: number, series: MediaResult) => {
    setSelectedSeriesId(seriesId);
    setSelectedSeries(series);
    setIsModalOpen(true);
    const details = await getSeriesDetails(seriesId);
    if (details && details.total_episodes !== undefined) {
      setTotalEpisodes(details.total_episodes);
      setSeriesDetails(details);
    }
  };

  const handleCalculate = () => {
    if (totalEpisodes === null) {
      // No total episodes, cannot calculate
      setCalculationMessage(null); // Reset message
      return;
    }

    if (desiredEpisodesPerDay !== null && desiredEpisodesPerDay > 0) {
      // Scenario B: User provided desired episodes per day
      const start = startDate || new Date(); // Use startDate or today
      const daysToFinish = Math.ceil(totalEpisodes / desiredEpisodesPerDay);
      const finish = new Date(start);
      finish.setDate(start.getDate() + daysToFinish);
      setCalculationMessage(`Watching ${desiredEpisodesPerDay} episodes per day starting ${format(start, "PPP")}, you will finish by ${format(finish, "PPP")}.`);

    } else if (startDate && endDate) {
      // Scenario A: User provided start and end dates
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        const episodesNeeded = Math.ceil(totalEpisodes / diffDays);
        setCalculationMessage(`To finish between ${format(startDate, "PPP")} and ${format(endDate, "PPP")} (${diffDays} days), you need to watch ${episodesNeeded} episodes per day.`);
      } else {
        setCalculationMessage(`Start and end dates must be different.`);
      }
    } else if (endDate) {
      // Only end date provided, use today as start
      const today = new Date();
      const diffTime = Math.abs(endDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        const episodesNeeded = Math.ceil(totalEpisodes / diffDays);
        setCalculationMessage(`To finish by ${format(endDate, "PPP")} starting today, you need to watch ${episodesNeeded} episodes per day.`);
      } else {
        setCalculationMessage(`To finish today, you need to watch ${totalEpisodes} episodes.`);
      }
    } else {
      // No valid input for calculation
      setCalculationMessage("Please provide either episodes per day or start/end dates to calculate your schedule."); 
    }
  };

  const getImageUrl = (path: string | null) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder.svg'; // Placeholder image
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mb-16 relative">
        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000" />
        
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Seriefy
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full mb-6" />
        </div>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
          Discover your next binge-watch and calculate the perfect viewing schedule
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">🎬</div>
            <div className="text-sm text-gray-400">TV Shows</div>
            <div className="text-lg font-semibold">Unlimited</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">📅</div>
            <div className="text-sm text-gray-400">Schedule</div>
            <div className="text-lg font-semibold">Smart Planning</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">⚡</div>
            <div className="text-sm text-gray-400">Data Source</div>
            <div className="text-lg font-semibold">TMDB API</div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="relative">
          <form onSubmit={handleSearch} className="flex w-full items-center space-x-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search for your next series adventure..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-sm border-white/20 placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-2xl"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 rounded-2xl font-semibold transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-xl text-gray-300">Searching the universe of series...</p>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-white">Search Results</h2>
                    <p className="text-gray-300">Found {results.length} amazing series for you</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {results.map((item) => (
                <Dialog key={item.id} open={isModalOpen && selectedSeriesId === item.id} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <MovieCard
                      title={item.name || ''}
                      posterUrl={getImageUrl(item.poster_path)}
                      seasons={item.number_of_seasons}
                      onClick={() => handleSeriesClick(item.id, item)}
                      series={item}
                      seriesDetails={seriesDetails || undefined}
                    />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden bg-slate-900/95 backdrop-blur-md border-white/20 shadow-2xl">
                    <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-6 border-b border-white/10">
                      <DialogHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <DialogTitle className="text-2xl font-bold text-white mb-1">
                              📅 Calculate Your Viewing Schedule
                            </DialogTitle>
                            <p className="text-gray-300 text-base">Plan your perfect binge-watching experience</p>
                          </div>
                          {selectedSeries && (
                            <FavoriteButton 
                              series={selectedSeries} 
                              seriesDetails={seriesDetails || undefined}
                            />
                          )}
                        </div>
                      </DialogHeader>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                      <div className="p-6 space-y-6">
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-400 text-xs">📺</span>
                            </div>
                            <label className="text-base font-semibold text-blue-300">
                              Total Episodes
                            </label>
                          </div>
                          <Input
                            value={totalEpisodes || 'Loading...'}
                            readOnly
                            className="bg-white/5 border-blue-500/30 text-white text-base font-medium h-10"
                          />
                        </div>                      <div className="grid gap-6">
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                              <span className="text-green-400 text-xs">⚡</span>
                            </div>
                            <label className="text-base font-semibold text-green-300">
                              Episodes per Day
                            </label>
                          </div>
                          <Input
                            type="number"
                            placeholder="e.g., 2, 3, 4..."
                            value={desiredEpisodesPerDay || ''}
                            onChange={(e) => setDesiredEpisodesPerDay(Number(e.target.value))}
                            className="bg-white/5 border-green-500/30 text-white placeholder:text-gray-400 text-base h-10"
                          />
                          <p className="text-xs text-gray-400 mt-2">Leave empty to calculate based on dates</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <span className="text-purple-400 text-xs">📅</span>
                            </div>
                            <label className="text-base font-semibold text-purple-300">
                              Date Range
                            </label>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Start Date
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal bg-white/5 border-purple-500/30 text-white hover:bg-white/10 h-10 text-sm",
                                      !startDate && "text-gray-400"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "MMM dd") : "Pick start"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-slate-900 border-white/20">
                                  <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                    className="text-white"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                End Date
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal bg-white/5 border-purple-500/30 text-white hover:bg-white/10 h-10 text-sm",
                                      !endDate && "text-gray-400"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "MMM dd") : "Pick end"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-slate-900 border-white/20">
                                  <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                    className="text-white"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Choose your preferred watching period</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStartDate(new Date());
                            setEndDate(undefined);
                            setDesiredEpisodesPerDay(null);
                          }}
                          className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 h-10 font-medium transition-all duration-200 hover:scale-105 text-sm"
                        >
                          <span className="mr-1">📅</span>
                          Start Today
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStartDate(undefined);
                            setEndDate(undefined);
                            setDesiredEpisodesPerDay(null);
                            setCalculationMessage(null);
                          }}
                          className="flex-1 bg-white/5 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/30 h-10 font-medium transition-all duration-200 hover:scale-105 text-sm"
                        >
                          <span className="mr-1">🔄</span>
                          Clear
                        </Button>
                        <Button
                          onClick={handleCalculate}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-semibold h-10 transition-all duration-200 hover:scale-105 shadow-lg text-sm"
                        >
                          <span className="mr-1">✨</span>
                          Calculate
                        </Button>
                      </div>
                      
                      {calculationMessage && (
                        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                            <span className="text-base font-semibold text-green-300">Your Viewing Schedule</span>
                          </div>
                          <p className="text-white font-medium leading-relaxed text-sm mb-3">
                            {calculationMessage}
                          </p>
                          <div className="pt-2 border-t border-green-500/20">
                            <p className="text-green-200/80 text-xs">
                              💡 Pro tip: Adjust your schedule as needed for the perfect viewing experience!
                            </p>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
              
              {results.length === 0 && searched && (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Series Found</h3>
                  <p className="text-gray-400 text-center max-w-md">
                    We couldn&apos;t find any series matching your search. Try different keywords or check your spelling.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}