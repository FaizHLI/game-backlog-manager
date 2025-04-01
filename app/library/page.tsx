'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { platforms, genres, statuses } from '@/lib/sample-data';
import type { Game } from '@/lib/sample-data';
import { useGames } from '@/utils/supabase-hooks';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchGames } = useGames();
  const { user } = useAuth();
  const router = useRouter();
  
  // Fetch games from Supabase
  useEffect(() => {
    const loadGames = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      
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
            coverUrl: game.cover_url || 'https://placehold.co/300x400/gray/white?text=No+Image',
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
          
          setGames(transformedGames);
        } else {
          setGames([]);
        }
      } catch (error: any) {
        console.error('Error fetching games:', error);
        setError(error.message || 'Failed to load games');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGames();
  }, [user, router, fetchGames]);

  // Filter games based on search and filters
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus ? game.status === selectedStatus : true;
    const matchesPlatform = selectedPlatform ? game.platform === selectedPlatform : true;
    const matchesGenre = selectedGenre ? (game.genres && game.genres.includes(selectedGenre)) : true;
    
    return matchesSearch && matchesStatus && matchesPlatform && matchesGenre;
  });

  // Sort games
  const sortedGames = [...filteredGames].sort((a, b) => {
    let comparison = 0;
    
    switch(sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'platform':
        comparison = (a.platform || '').localeCompare(b.platform || '');
        break;
      case 'releaseDate':
        comparison = new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime();
        break;
      case 'added_date':
        comparison = new Date(a.added_date || 0).getTime() - new Date(b.added_date || 0).getTime();
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Game Library</h1>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="platform" className="block text-sm font-medium mb-1">Platform</label>
            <select
              id="platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Platforms</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-1">Genre</label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium mb-1">Sort By</label>
            <select
              id="sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="releaseDate-desc">Release Date (Newest)</option>
              <option value="releaseDate-asc">Release Date (Oldest)</option>
              <option value="added_date-desc">Date Added (Newest)</option>
              <option value="added_date-asc">Date Added (Oldest)</option>
              <option value="rating-desc">Rating (Highest)</option>
              <option value="rating-asc">Rating (Lowest)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4">Loading your game library...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-bold">Error loading games</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && games.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start building your game collection by adding your first game.
          </p>
          <Link 
            href="/add-game" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Your First Game
          </Link>
        </div>
      )}
      
      {/* Results count */}
      {!isLoading && !error && games.length > 0 && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Showing {sortedGames.length} of {games.length} games
        </p>
      )}
      
      {/* Games grid */}
      {!isLoading && !error && games.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

// Game Card Component
function GameCard({ game }: { game: Game }) {
  const statusClasses = {
    notStarted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    inProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    onHold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    dropped: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  
  const statusLabels = {
    notStarted: 'Not Started',
    inProgress: 'In Progress',
    completed: 'Completed',
    onHold: 'On Hold',
    dropped: 'Dropped'
  };

  return (
    <Link href={`/game/${game.id}`}>
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
          
          {game.status === 'inProgress' && game.progress !== undefined && (
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
          )}
          
          <div className="mt-2 flex justify-between items-center">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusClasses[game.status]}`}>
              {statusLabels[game.status]}
            </span>
            
            {game.rating && (
              <span className="flex items-center text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-xs">{game.rating}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}