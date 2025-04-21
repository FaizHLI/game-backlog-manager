import { NextResponse } from 'next/server';

async function getAccessToken() {
  let accessToken = process.env.IGDB_ACCESS_TOKEN;
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Missing IGDB client credentials');
  }
  
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
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }
    
    const accessToken = await getAccessToken();
    const clientId = process.env.IGDB_CLIENT_ID;
    
    const igdbQuery = `
      search "${query}";
      fields name, cover.image_id, platforms.name, first_release_date, genres.name, 
        involved_companies.company.name, involved_companies.developer, involved_companies.publisher, summary;
      where version_parent = null;
      limit 10;
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
    
    const transformedGames = games.map((game: any) => {
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
      
      const platforms = game.platforms 
        ? game.platforms.map((p: any) => p.name).join(', ')
        : '';
      
      const genres = game.genres 
        ? game.genres.map((g: any) => g.name) 
        : [];
      
      const releaseDate = game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
        : '';
      
      const coverUrl = game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : 'https://placehold.co/300x400/gray/white?text=No+Image';
      
      return {
        id: game.id,
        name: game.name,
        cover: coverUrl,
        platform: platforms,
        releaseDate,
        developer,
        publisher,
        genres,
        summary: game.summary || '',
      };
    });
    
    return NextResponse.json(transformedGames);
  } catch (error) {
    console.error('Error processing search request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}