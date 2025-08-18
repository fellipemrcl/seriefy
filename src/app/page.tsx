'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MovieCard from "@/components/MovieCard";
import { searchMedia, MediaResult, getSeriesDetails } from "./actions";
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
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [episodesPerDay, setEpisodesPerDay] = useState<number | null>(null);
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null);
  const [desiredEpisodesPerDay, setDesiredEpisodesPerDay] = useState<number | null>(null);
  const [finishDate, setFinishDate] = useState<Date | null>(null);
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

  const handleSeriesClick = async (seriesId: number) => {
    setSelectedSeriesId(seriesId);
    setIsModalOpen(true);
    const details = await getSeriesDetails(seriesId);
    if (details) {
      setTotalEpisodes(details.total_episodes);
    }
  };

  const handleCalculate = () => {
    if (totalEpisodes === null) {
      // No total episodes, cannot calculate
      setEpisodesPerDay(null);
      setFinishDate(null);
      setCalculationMessage(null); // Reset message
      return;
    }

    if (desiredEpisodesPerDay !== null && desiredEpisodesPerDay > 0) {
      // Scenario B: User provided desired episodes per day
      setEpisodesPerDay(desiredEpisodesPerDay); // Set episodesPerDay to desired value

      const startDate = targetDate || new Date(); // Use targetDate or today
      const daysToFinish = Math.ceil(totalEpisodes / desiredEpisodesPerDay);
      const finish = new Date(startDate);
      finish.setDate(startDate.getDate() + daysToFinish);
      setFinishDate(finish);
      setCalculationMessage(`Watching ${desiredEpisodesPerDay} episodes per day, you will finish by ${format(finish, "PPP")}.`);

    } else if (targetDate) {
      // Scenario A: User provided target date (original functionality)
      const today = new Date();
      const diffTime = Math.abs(targetDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setEpisodesPerDay(Math.ceil(totalEpisodes / diffDays));
        setCalculationMessage(`To finish by ${format(targetDate, "PPP")}, you need to watch ${Math.ceil(totalEpisodes / diffDays)} episodes per day.`);
      } else {
        setEpisodesPerDay(totalEpisodes); // Complete today
        setCalculationMessage(`To finish today, you need to watch ${totalEpisodes} episodes.`);
      }
      setFinishDate(null); // Reset finish date for this scenario
    } else {
      // No valid input for calculation
      setEpisodesPerDay(null);
      setFinishDate(null);
      setCalculationMessage(null); // Reset message
    }
  };

  const getImageUrl = (path: string | null) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder.svg'; // Placeholder image
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Series Tracker</h1>
        <p className="text-lg text-muted-foreground">
          Search for your favorite TV shows to track what you've watched.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Search for a series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      <div className="mt-12">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 card-grid">
            {results.map((item) => (
              <Dialog key={item.id} open={isModalOpen && selectedSeriesId === item.id} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <MovieCard
                    title={item.name || ''}
                    posterUrl={getImageUrl(item.poster_path)}
                    seasons={item.number_of_seasons}
                    rating={0} // Placeholder for rating
                    onClick={() => handleSeriesClick(item.id)}
                  />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] p-6">
                  <DialogHeader>
                    <DialogTitle>Calculate Episodes Per Day</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-6">
                      <label htmlFor="totalEpisodes" className="text-right">
                        Total Episodes
                      </label>
                      <Input
                        id="totalEpisodes"
                        value={totalEpisodes || ''}
                        readOnly
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-6">
                      <label htmlFor="desiredEpisodesPerDay" className="text-right">
                        Episodes per Day (Desired)
                      </label>
                      <Input
                        id="desiredEpisodesPerDay"
                        type="number"
                        value={desiredEpisodesPerDay || ''}
                        onChange={(e) => setDesiredEpisodesPerDay(Number(e.target.value))}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-6">
                      <label htmlFor="targetDate" className="text-right">
                        Target Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !targetDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={targetDate}
                            onSelect={setTargetDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-6">
                      <div className="col-span-3 col-start-2">
                        <Button
                          variant="outline"
                          onClick={() => setTargetDate(new Date())}
                          className="w-full"
                        >
                          Today
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-full text-center mt-4">
                      <Button onClick={handleCalculate} className="w-full max-w-xs">
                        Calculate
                      </Button>
                    </div>
                    {calculationMessage && (
                      <p className="text-center text-lg font-bold mt-2">
                        {calculationMessage}
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
            {results.length === 0 && searched && (
               <div className="col-span-full text-center text-muted-foreground">
                <p>No results found for your search. Please try another term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}