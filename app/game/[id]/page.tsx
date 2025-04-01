'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { statuses } from '@/lib/sample-data';
import type { Game } from '@/lib/sample-data';
import { notFound, useRouter } from 'next/navigation';
import { getGameDetails } from '@/utils/igdb';
import { useGames } from '@/utils/supabase-hooks';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ExtendedGame extends Game {
  igdbId?: number;
}

type GameDetailsProps = {
  params: {
    id: string;
  };
};

export default function GameDetails({ params }: GameDetailsProps) {
  const gameId = parseInt(params.id);
  const [game, setGame] = useState<ExtendedGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Game['status']>('notStarted');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [playTime, setPlayTime] = useState(0);
  const router = useRouter();
  
  // Use the auth guard hook
  const { isLoading: isAuthChecking } = useAuthGuard();
  
  // State for IGDB additional data
  const [igdbData, setIgdbData] = useState<any>(null);
  const [isLoadingIgdbData, setIsLoadingIgdbData] = useState(false);
  
  const { getGame, updateGame, deleteGame } = useGames();
  const { user } = useAuth();
  
  // Fetch the game from Supabase
  useEffect(() => {
    const fetchGameDetails = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is authenticated
        if (!user) {
          return;
        }
        
        const { data, error } = await getGame(gameId);
        
        if (error) {
          console.error('Error fetching game:', error);
          return;
        }
        
        if (!data) {
          return;
        }
        
        setGame(data);
        setCurrentGame(data);
        setProgress(data.progress || 0);
        setStatus(data.status);
        setRating(data.rating || 0);
        setNotes(data.notes || '');
        setPlayTime(data.playTime || 0);
      } catch (error) {
        console.error('Error in fetchGameDetails:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchGameDetails();
    }
  }, [gameId, user, getGame]);
  
  // Fetch additional data from IGDB if the game has an IGDB ID
  useEffect(() => {
    const fetchIgdbData = async () => {
      if (game?.igdbId) {
        setIsLoadingIgdbData(true);
        try {
          const data = await getGameDetails(game.igdbId);
          setIgdbData(data);
        } catch (error) {
          console.error('Error fetching IGDB data:', error);
        } finally {
          setIsLoadingIgdbData(false);
        }
      }
    };
    
    if (game) {
      fetchIgdbData();
    }
  }, [game]);

  const handleSave = async () => {
    if (!currentGame) return;
    
    const updatedGame = {
      ...currentGame,
      progress,
      status,
      rating,
      notes,
      playTime
    };
    
    setCurrentGame(updatedGame as Game);
    setIsEditing(false);
    
    try {
      const { data, error } = await updateGame(gameId, {
        progress,
        status,
        rating,
        notes,
        playTime
      });
      
      if (error) {
        throw error;
      }
      
      // Update local state with the saved data
      if (data && data.length > 0) {
        const savedGame = data[0];
        // Transform database model to frontend model if needed
      }
      
      alert('Game updated successfully!');
    } catch (error: any) {
      console.error('Error updating game:', error);
      alert(`Failed to update game: ${error.message}`);
    }
  };
  
  const handleDelete = async () => {
    if (!currentGame) return;
    
    if (confirm('Are you sure you want to delete this game from your library?')) {
      try {
        const { error } = await deleteGame(gameId);
        
        if (error) {
          throw error;
        }
        
        alert('Game deleted successfully!');
        router.push('/library');
      } catch (error: any) {
        console.error('Error deleting game:', error);
        alert(`Failed to delete game: ${error.message}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Show loading indicator while checking authentication or loading game data
  if (isAuthChecking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return notFound();
  }
  
  const statusColor = {
    notStarted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    inProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    onHold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    dropped: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  
  const statusLabel = statuses.find(s => s.value === currentGame.status)?.label || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/library" className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Library
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Game Cover */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative h-96 md:h-full w-full">
              <Image
                src={currentGame.coverUrl}
                alt={currentGame.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Game Details */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{currentGame.title}</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{currentGame.platform} • Released {formatDate(currentGame.releaseDate)}</p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit Game
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Game Info</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Developer:</span> {currentGame.developer}</p>
                  <p><span className="font-medium">Publisher:</span> {currentGame.publisher}</p>
                  <p><span className="font-medium">Genres:</span> {currentGame.genres.join(', ')}</p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColor[currentGame.status]}`}>
                      {statusLabel}
                    </span>
                  </p>
                  <p><span className="font-medium">Added to Library:</span> {formatDate(currentGame.added_date)}</p>
                </div>
                
                {/* IGDB Additional Data */}
                {isLoadingIgdbData && <p className="mt-4 text-gray-500">Loading additional details...</p>}
                
                {igdbData && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-medium mb-2">Additional Info</h3>
                    
                    {igdbData.rating && (
                      <p>
                        <span className="font-medium">Critic Rating:</span> {igdbData.rating}/5
                        <span className="text-sm text-gray-500 ml-1">({igdbData.ratingCount} reviews)</span>
                      </p>
                    )}
                    
                    {igdbData.gameModes && igdbData.gameModes.length > 0 && (
                      <p><span className="font-medium">Game Modes:</span> {igdbData.gameModes.join(', ')}</p>
                    )}
                    
                    {igdbData.themes && igdbData.themes.length > 0 && (
                      <p><span className="font-medium">Themes:</span> {igdbData.themes.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
                {!isEditing ? (
                  <div className="space-y-4">
                    {currentGame.status === 'inProgress' && currentGame.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{currentGame.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full progress-bar" 
                            style={{ width: `${currentGame.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {currentGame.playTime !== undefined && (
                      <p><span className="font-medium">Play Time:</span> {currentGame.playTime} hours</p>
                    )}
                    
                    {currentGame.rating !== undefined && (
                      <div>
                        <p className="font-medium mb-1">Your Rating</p>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 ${star <= currentGame.rating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2">{currentGame.rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Game['status'])}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {statuses.map((statusOption) => (
                          <option key={statusOption.value} value={statusOption.value}>
                            {statusOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="progress" className="block text-sm font-medium mb-1">
                        Progress: {progress}%
                      </label>
                      <input
                        type="range"
                        id="progress"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="playtime" className="block text-sm font-medium mb-1">Play Time (hours)</label>
                      <input
                        type="number"
                        id="playtime"
                        min="0"
                        value={playTime}
                        onChange={(e) => setPlayTime(parseInt(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <p className="block text-sm font-medium mb-1">Your Rating</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-6 w-6 ${star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        <span className="ml-2">{rating}/5</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Add Delete Game button when in edit mode */}
                {isEditing && (
                  <div className="mt-6">
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete Game
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              {!isEditing ? (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
                  <p>{currentGame.notes || 'No notes added yet.'}</p>
                </div>
              ) : (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Add your notes about this game here..."
                ></textarea>
              )}
            </div>
            
            {/* Game Summary from IGDB */}
            {igdbData && igdbData.summary && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Game Summary</h2>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
                  <p>{igdbData.summary}</p>
                </div>
              </div>
            )}
            
            {/* Screenshots from IGDB */}
            {igdbData && igdbData.screenshots && igdbData.screenshots.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Screenshots</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {igdbData.screenshots.slice(0, 6).map((screenshot: string, index: number) => (
                    <div key={index} className="relative h-48 w-full overflow-hidden rounded-md">
                      <Image
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Similar Games from IGDB */}
            {igdbData && igdbData.similarGames && igdbData.similarGames.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Similar Games</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {igdbData.similarGames.slice(0, 5).map((similarGame: any) => (
                    <div key={similarGame.id} className="text-center">
                      <div className="relative h-32 w-24 mx-auto overflow-hidden rounded-md mb-2">
                        <Image
                          src={similarGame.cover}
                          alt={similarGame.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium truncate">{similarGame.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}