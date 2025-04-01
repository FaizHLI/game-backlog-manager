/**
 * IGDB API client utility
 * 
 * IGDB API requires a Twitch Developer account and Client ID/Secret
 * https://api-docs.igdb.com/#getting-started
 */

// Types for IGDB API responses
export interface IGDBGame {
    id: number;
    name: string;
    cover?: string;
    platform?: string;
    releaseDate?: string;
    developer?: string;
    publisher?: string;
    genres?: string[];
    summary?: string;
    // Additional fields that might be returned from our API
    rating?: number;
    ratingCount?: number;
    screenshots?: string[];
    similarGames?: any[];
    gameModes?: string[];
    themes?: string[];
  }
  
  // Helper to convert IGDB cover ID to full image URL
  export function getIGDBImageUrl(imageId: string, size: 'cover_small' | 'cover_big' | 'screenshot_big' | 'logo_med' = 'cover_big'): string {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
  }
  
  // Helper to convert UNIX timestamp to date string
  export function formatIGDBDate(timestamp?: number): string {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toISOString().split('T')[0];
  }
  
  /**
   * Search for games using the IGDB API
   */
  export async function searchGames(query: string): Promise<IGDBGame[]> {
    try {
      const response = await fetch('/api/igdb/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
  
      if (!response.ok) {
        throw new Error(`Error searching games: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error searching games:', error);
      throw error;
    }
  }
  
  /**
   * Get game details by ID from IGDB API
   */
  export async function getGameDetails(gameId: number): Promise<IGDBGame> {
    try {
      const response = await fetch('/api/igdb/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching game details: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching game details:', error);
      throw error;
    }
  }