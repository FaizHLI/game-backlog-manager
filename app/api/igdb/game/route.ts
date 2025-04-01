import { NextResponse } from 'next/server';

// Function to get a valid access token (stored or refreshed)
async function getAccessToken() {
  let accessToken = process.env.IGDB_ACCESS_TOKEN;
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing IGDB client credentials');
  }
  
  // If no token exists, get a new one
  if (!accessToken) {
    console.log('No access token found, requesting a new one');
    
    try {
      const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }
      
      const data = await response.json();
      accessToken = data.access_token;
      
      console.log('New access token received');
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }
  
  return accessToken;
}

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json();
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    const accessToken = await getAccessToken();
    const clientId = process.env.IGDB_CLIENT_ID;
    
    // IGDB API query to get detailed information about a specific game
    const igdbQuery = `
      fields name, cover.image_id, platforms.name, first_release_date, genres.name, 
        involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
        summary, storyline, rating, rating_count, total_rating, total_rating_count, 
        screenshots.image_id, videos.video_id, websites.*, game_modes.name, themes.name,
        similar_games.name, similar_games.cover.image_id;
      where id = ${gameId};
    `;
    
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': clientId as string,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: igdbQuery,
    });
    
    if (!response.ok) {
      console.error('IGDB API error:', response.statusText);
      return NextResponse.json({ error: 'Error fetching data from IGDB' }, { status: response.status });
    }
    
    const games = await response.json();
    
    if (!games || games.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const game = games[0];
    
    // Extract developer and publisher
    let developer = '';
    let publisher = '';
    
    if (game.involved_companies) {
      game.involved_companies.forEach((company: any) => {
        if (company.developer && company.company) {
          developer = company.company.name;
        }
        if (company.publisher && company.company) {
          publisher = company.company.name;
        }
      });
    }
    
    // Format platforms
    const platforms = game.platforms 
      ? game.platforms.map((p: any) => p.name)
      : [];
    
    // Format genres
    const genres = game.genres 
      ? game.genres.map((g: any) => g.name) 
      : [];
    
    // Format release date
    const releaseDate = game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
      : '';
    
    // Format cover image URL
    const coverUrl = game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : 'https://placehold.co/300x400/gray/white?text=No+Image';
    
    // Format screenshots
    const screenshots = game.screenshots
      ? game.screenshots.map((s: any) => 
          `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${s.image_id}.jpg`
        )
      : [];
    
    // Format similar games
    const similarGames = game.similar_games
      ? game.similar_games.map((g: any) => ({
          id: g.id,
          name: g.name,
          cover: g.cover 
            ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${g.cover.image_id}.jpg`
            : 'https://placehold.co/300x400/gray/white?text=No+Image',
        }))
      : [];
    
    // Format rating (out of 100 -> out of 5)
    const rating = game.total_rating 
      ? Math.round((game.total_rating / 20) * 10) / 10
      : null;
    
    const gameDetails = {
      id: game.id,
      name: game.name,
      cover: coverUrl,
      platforms,
      releaseDate,
      developer,
      publisher,
      genres,
      summary: game.summary || '',
      storyline: game.storyline || '',
      rating,
      ratingCount: game.total_rating_count || 0,
      screenshots,
      similarGames,
      gameModes: game.game_modes ? game.game_modes.map((m: any) => m.name) : [],
      themes: game.themes ? game.themes.map((t: any) => t.name) : [],
    };
    
    return NextResponse.json(gameDetails);
  } catch (error) {
    console.error('Error processing game details request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}