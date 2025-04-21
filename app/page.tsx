'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGames } from '@/utils/supabase-hooks';
import { useAuth } from '@/contexts/AuthContext';
import type { Game } from '@/lib/sample-data';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function Home() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Game[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0
  });
  
  const { fetchGames } = useGames();
  const { user } = useAuth();
  const { isLoading: isAuthChecking } = useAuthGuard();
  
  useEffect(() => {
    const loadGames = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await fetchGames();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform data if needed
          const transformedGames: Game[] = data.map(game => ({
            id: game.id,
            title: game.title,
            coverUrl: game.coverUrl || 'https://placehold.co/300x400/gray/white?text=No+Image',
            platform: game.platform || '',
            releaseDate: game.release_date || '',
            developer: game.developer || '',
            publisher: game.publisher || '',
            genres: game.genres || [],
            status: game.status,
            progress: game.progress || 0,
            rating: game.rating || 0,
            playTime: game.play_time || 0,
            notes: game.notes || '',
            added_date: game.added_date,
            igdbId: game.igdb_id || undefined
          }));
          
          // Filter currently playing games (inProgress status)
          const playing = transformedGames
            .filter(game => game.status === 'inProgress')
            .slice(0, 3);
          
          // Get recently added games
          const recent = [...transformedGames]
            .sort((a, b) => new Date(b.added_date).getTime() - new Date(a.added_date).getTime())
            .slice(0, 3);
          
          // Calculate stats
          const gameStats = {
            total: transformedGames.length,
            completed: transformedGames.filter(game => game.status === 'completed').length,
            inProgress: transformedGames.filter(game => game.status === 'inProgress').length,
            notStarted: transformedGames.filter(game => game.status === 'notStarted').length,
          };
          
          setCurrentlyPlaying(playing);
          setRecentlyAdded(recent);
          setStats(gameStats);
        }
      } catch (error: any) {
        console.error('Error fetching games:', error);
        setError(error.message || 'Failed to load games');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadGames();
    }
  }, [user, fetchGames]);

  // Show loading indicator while checking authentication or loading data
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

  // If there's an error, show it
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-bold">Error loading your dashboard</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Display welcome message for new users */}
      {stats.total === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-2">Welcome to GameLog!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your personal game backlog tracker. Start by adding your first game.
          </p>
          <Link 
            href="/add-game" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Your First Game
          </Link>
        </div>
      )}
      
      {/* Display dashboard content for users with games */}
      {stats.total > 0 && (
        <>
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Currently Playing</h2>
              <Link 
                href="/library?status=inProgress" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </Link>
            </div>
            
            {currentlyPlaying.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any games in progress. Start playing one of your games or add a new one.
                </p>
                <Link
                  href="/add-game"
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add Game
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentlyPlaying.map((game) => (
                  <Link href={`/game/${game.id}`} key={game.id}>
                    <div className="game-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg">
                      <div className="relative h-48 w-full">
                        <Image
                          src={game.coverUrl}
                          alt={game.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{game.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{game.platform}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{game.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full progress-bar" 
                              style={{ width: `${game.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recently Added</h2>
              <Link 
                href="/library" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyAdded.map((game) => (
                <Link href={`/game/${game.id}`} key={game.id}>
                  <div className="game-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg">
                    <div className="relative h-48 w-full">
                      <Image
                        src={game.coverUrl}
                        alt={game.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{game.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{game.platform}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Added on {new Date(game.added_date).toLocaleDateString()}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        game.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        game.status === 'inProgress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        game.status === 'notStarted' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        game.status === 'onHold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {game.status === 'notStarted' ? 'Not Started' :
                         game.status === 'inProgress' ? 'In Progress' :
                         game.status === 'completed' ? 'Completed' :
                         game.status === 'onHold' ? 'On Hold' : 'Dropped'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">Total Games</h3>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.completed}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">In Progress</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.inProgress}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-2">Not Started</h3>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {stats.notStarted}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}