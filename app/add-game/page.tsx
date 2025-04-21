'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { platforms, genres, statuses } from '@/lib/sample-data';
import type { Game } from '@/lib/sample-data';
import { searchGames, getIGDBImageUrl, formatIGDBDate } from '@/utils/igdb';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface GameSearchResult {
  id: number;
  name: string;
  cover: string;
  platform: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  genres: string[];
  summary?: string;
}

export default function AddGame() {
  const router = useRouter();
  const { user } = useAuth();
  const { isLoading: isAuthChecking } = useAuthGuard(true, '/login');
  
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    releaseDate: '',
    developer: '',
    publisher: '',
    selectedGenres: [] as string[],
    status: 'notStarted' as Game['status'],
    progress: 0,
    notes: '',
    searchQuery: '',
    searchResults: [] as GameSearchResult[],
    igdbId: null as number | null,
    coverUrl: '',
    added_date: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // IGDB API search function
  const handleSearch = async () => {
    if (!formData.searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowSearchResults(false);
    
    try {
      const igdbResults = await searchGames(formData.searchQuery);
      
      const searchResults: GameSearchResult[] = igdbResults.map(game => ({
        id: game.id,
        name: game.name,
        cover: game.cover || 'https://placehold.co/300x400/gray/white?text=No+Image',
        platform: game.platform || '',
        releaseDate: game.releaseDate || '',
        developer: game.developer || '',
        publisher: game.publisher || '',
        genres: game.genres || [],
        summary: game.summary
      }));
      
      setFormData({
        ...formData,
        searchResults
      });
      
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching for games:', error);
      alert('Failed to search for games. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectGame = (game: GameSearchResult) => {
    const selectedGenres = game.genres || [];
    
    setFormData({
      ...formData,
      title: game.name,
      platform: game.platform || '',
      releaseDate: game.releaseDate || '',
      developer: game.developer || '',
      publisher: game.publisher || '',
      selectedGenres,
      notes: game.summary || '',
      igdbId: game.id,
      coverUrl: game.cover
    });
    
    setShowSearchResults(false);
    setCurrentStep(2);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'status') {
      const isValidStatus = statuses.some(s => s.value === value);
      if (isValidStatus) {
        setFormData({
          ...formData,
          [name]: value as Game['status']
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleGenreToggle = (genre: string) => {
    const selectedGenres = [...formData.selectedGenres];
    
    if (selectedGenres.includes(genre)) {
      const index = selectedGenres.indexOf(genre);
      selectedGenres.splice(index, 1);
    } else {
      selectedGenres.push(genre);
    }
    
    setFormData({
      ...formData,
      selectedGenres
    });
  };
  
  const addGame = async (gameData: any) => {
    if (!user) {
      throw new Error("You must be logged in to add a game");
    }
    
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          ...gameData,
          user_id: user.id
        })
        .select();
        
      return { data, error };
    } catch (error) {
      console.error("Error in addGame function:", error);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to add games');
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    const gameData = {
      title: formData.title,
      platform: formData.platform || '',
      releaseDate: formData.releaseDate || '',
      developer: formData.developer || '',
      publisher: formData.publisher || '',
      genres: formData.selectedGenres,
      status: formData.status,
      ...(formData.status === 'inProgress' && { progress: formData.progress }),
      notes: formData.notes || '',
      igdbId: formData.igdbId || undefined,
      coverUrl: formData.coverUrl || (formData.searchResults.find(g => g.id === formData.igdbId)?.cover || ''),
      added_date: new Date().toISOString().split('T')[0]
    };
    
    try {
      const { data, error } = await addGame(gameData);
      
      if (error) {
        throw error;
      }
      
      alert('Game added successfully!');
      
      router.push('/library');
    } catch (error: any) {
      console.error('Error adding game:', error);
      alert(`Failed to add game: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleManualEntry = () => {
    setShowSearchResults(false);
    setCurrentStep(2);
  };
  
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }
  
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Game</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`h-2 rounded-l-full ${currentStep >= 1 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            </div>
            <div className="flex-1">
              <div className={`h-2 rounded-r-full ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className={`text-sm font-medium ${currentStep >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Search Game</div>
            <div className={`text-sm font-medium ${currentStep >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Game Details</div>
          </div>
        </div>
        
        {currentStep === 1 && (
          <div>
            <div className="mb-6">
              <label htmlFor="searchQuery" className="block text-sm font-medium mb-1">Search for a game</label>
              <div className="flex">
                <input
                  type="text"
                  id="searchQuery"
                  name="searchQuery"
                  value={formData.searchQuery}
                  onChange={handleInputChange}
                  placeholder="Enter game title..."
                  className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Search for games in the IGDB database
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                >
                  Or add game manually
                </button>
              </div>
            </div>
            
            {showSearchResults && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Search Results</h2>
                
                {formData.searchResults.length === 0 ? (
                  <p>No results found. Try a different search or add manually.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.searchResults.map((game) => (
                      <div 
                        key={game.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSelectGame(game)}
                      >
                        <div className="relative h-48 w-full">
                          <Image 
                            src={game.cover} 
                            alt={game.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold truncate">{game.name}</h3>
                          {game.platform && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{game.platform}</p>
                          )}
                          {game.releaseDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Released: {new Date(game.releaseDate).toLocaleDateString()}
                            </p>
                          )}
                          {game.developer && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Developer: {game.developer}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {currentStep === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Game Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="platform" className="block text-sm font-medium mb-1">Platform *</label>
                <select
                  id="platform"
                  name="platform"
                  required
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="releaseDate" className="block text-sm font-medium mb-1">Release Date</label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">Status *</label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="developer" className="block text-sm font-medium mb-1">Developer</label>
                <input
                  type="text"
                  id="developer"
                  name="developer"
                  value={formData.developer}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="publisher" className="block text-sm font-medium mb-1">Publisher</label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {formData.status === 'inProgress' && (
                <div>
                  <label htmlFor="progress" className="block text-sm font-medium mb-1">
                    Progress: {formData.progress}%
                  </label>
                  <input
                    type="range"
                    id="progress"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Genres</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`genre-${genre}`}
                      checked={formData.selectedGenres.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                    />
                    <label htmlFor={`genre-${genre}`} className="ml-2 text-sm">
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Add any notes about this game..."
              ></textarea>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Adding...' : 'Add to Library'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}