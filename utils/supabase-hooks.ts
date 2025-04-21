import { useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Game } from '@/lib/sample-data';
import { useCallback } from 'react';

export function useGames() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchGames = useCallback(async () => {
    if (!user) {
      setError(new Error('User is not authenticated'));
      return { data: null, error: new Error('User is not authenticated') };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id)
        .order('added_date', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      setError(error as Error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const addGame = async (game: Omit<Game, 'id'>) => {
    if (!user) {
      setError(new Error('User is not authenticated'));
      return { data: null, error: new Error('User is not authenticated') };
    }

    setLoading(true);
    setError(null);

    try {
      const gameData = {
        user_id: user.id,
        title: game.title,
        igdb_id: game.igdbId,
        cover_url: game.coverUrl,
        platform: game.platform,
        release_date: game.releaseDate,
        developer: game.developer,
        publisher: game.publisher,
        genres: game.genres,
        status: game.status,
        progress: game.progress,
        rating: game.rating,
        play_time: game.playTime,
        notes: game.notes,
        added_date: game.added_date || new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('games')
        .insert([gameData])
        .select();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      setError(error as Error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (gameId: number, updates: Partial<Game>) => {
    if (!user) {
      setError(new Error('User is not authenticated'));
      return { data: null, error: new Error('User is not authenticated') };
    }

    setLoading(true);
    setError(null);

    try {
      const gameData: any = {};
      
      if (updates.title) gameData.title = updates.title;
      if (updates.igdbId) gameData.igdb_id = updates.igdbId;
      if (updates.coverUrl) gameData.cover_url = updates.coverUrl;
      if (updates.platform) gameData.platform = updates.platform;
      if (updates.releaseDate) gameData.release_date = updates.releaseDate;
      if (updates.developer) gameData.developer = updates.developer;
      if (updates.publisher) gameData.publisher = updates.publisher;
      if (updates.genres) gameData.genres = updates.genres;
      if (updates.status) gameData.status = updates.status;
      if ('progress' in updates) gameData.progress = updates.progress;
      if ('rating' in updates) gameData.rating = updates.rating;
      if ('playTime' in updates) gameData.play_time = updates.playTime;
      if ('notes' in updates) gameData.notes = updates.notes;
      
      gameData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', gameId)
        .eq('user_id', user.id)
        .select();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      setError(error as Error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (gameId: number) => {
    if (!user) {
      setError(new Error('User is not authenticated'));
      return { error: new Error('User is not authenticated') };
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      setError(error as Error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getGame = useCallback(async (gameId: number) => {
    if (!user) {
      setError(new Error('User is not authenticated'));
      return { data: null, error: new Error('User is not authenticated') };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      const game: Game = {
        id: data.id,
        title: data.title,
        coverUrl: data.cover_url,
        platform: data.platform,
        releaseDate: data.release_date,
        developer: data.developer,
        publisher: data.publisher,
        genres: data.genres,
        status: data.status,
        progress: data.progress,
        rating: data.rating,
        playTime: data.play_time,
        notes: data.notes,
        added_date: data.added_date,
        igdbId: data.igdb_id,
      };

      return { data: game, error: null };
    } catch (error) {
      setError(error as Error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    fetchGames,
    addGame,
    updateGame,
    deleteGame,
    getGame,
    loading,
    error,
  };
}

export function useProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setError(new Error('User is not authenticated'));
      return { data: null, error: new Error('User is not authenticated') };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      setError(error as Error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    theme_preference?: 'light' | 'dark' | 'system';
    show_completed_games?: boolean;
    default_view?: 'grid' | 'list';
    default_sort?: string;
  }) => {
    if (!user) {
      setError(new Error('User is not authenticated'));
      return { data: null, error: new Error('User is not authenticated') };
    }

    setLoading(true);
    setError(null);

    try {
      const profileData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      setError(error as Error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchProfile,
    updateProfile,
    loading,
    error,
  };
}