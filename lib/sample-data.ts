// lib/sample-data.ts

export type Game = {
    id: number;
    title: string;
    coverUrl: string;
    platform: string;
    releaseDate: string;
    developer: string;
    publisher: string;
    genres: string[];
    status: 'notStarted' | 'inProgress' | 'completed' | 'onHold' | 'dropped';
    progress?: number;
    rating?: number;
    playTime?: number;
    notes?: string;
    added_date: string;
    igdbId?: number;
  };
  
  export const sampleGames: Game[] = [
    {
      id: 1,
      title: "The Legend of Zelda: Breath of the Wild",
      coverUrl: "https://placehold.co/300x400/3498db/ffffff?text=Zelda+BOTW",
      platform: "Nintendo Switch",
      releaseDate: "2017-03-03",
      developer: "Nintendo EPD",
      publisher: "Nintendo",
      genres: ["Action-Adventure", "Open World"],
      status: "inProgress",
      progress: 65,
      rating: 4.5,
      playTime: 48,
      notes: "Currently exploring the Hebra region",
      added_date: "2023-01-15",
      igdbId: 7346 // Actual IGDB ID for BOTW
    },
    {
      id: 2,
      title: "Elden Ring",
      coverUrl: "https://placehold.co/300x400/e74c3c/ffffff?text=Elden+Ring",
      platform: "PlayStation 5",
      releaseDate: "2022-02-25",
      developer: "FromSoftware",
      publisher: "Bandai Namco",
      genres: ["Action RPG", "Open World"],
      status: "inProgress",
      progress: 42,
      rating: 4.8,
      playTime: 37,
      notes: "Stuck at Malenia, Blade of Miquella",
      added_date: "2022-03-01",
      igdbId: 119133 // Actual IGDB ID for Elden Ring
    },
    {
      id: 3,
      title: "Baldur's Gate 3",
      coverUrl: "https://placehold.co/300x400/9b59b6/ffffff?text=Baldur's+Gate+3",
      platform: "PC",
      releaseDate: "2023-08-03",
      developer: "Larian Studios",
      publisher: "Larian Studios",
      genres: ["RPG", "Turn-Based Strategy"],
      status: "inProgress",
      progress: 78,
      rating: 5,
      playTime: 86,
      notes: "Playing as Dark Urge, almost finished Act 3",
      added_date: "2023-08-04",
      igdbId: 114282 // Actual IGDB ID for Baldur's Gate 3
    },
    {
      id: 4,
      title: "Starfield",
      coverUrl: "https://placehold.co/300x400/34495e/ffffff?text=Starfield",
      platform: "Xbox Series X",
      releaseDate: "2023-09-06",
      developer: "Bethesda Game Studios",
      publisher: "Bethesda Softworks",
      genres: ["RPG", "Open World", "Sci-Fi"],
      status: "notStarted",
      added_date: "2023-09-01"
    },
    {
      id: 5,
      title: "Final Fantasy XVI",
      coverUrl: "https://placehold.co/300x400/27ae60/ffffff?text=Final+Fantasy+XVI",
      platform: "PlayStation 5",
      releaseDate: "2023-06-22",
      developer: "Square Enix",
      publisher: "Square Enix",
      genres: ["Action RPG", "Fantasy"],
      status: "notStarted",
      added_date: "2023-06-15"
    },
    {
      id: 6,
      title: "Cyberpunk 2077",
      coverUrl: "https://placehold.co/300x400/f1c40f/000000?text=Cyberpunk+2077",
      platform: "PC",
      releaseDate: "2020-12-10",
      developer: "CD Projekt Red",
      publisher: "CD Projekt",
      genres: ["Action RPG", "Open World", "Cyberpunk"],
      status: "completed",
      progress: 100,
      rating: 4.2,
      playTime: 73,
      notes: "Completed with Nomad path",
      added_date: "2020-12-12"
    },
    {
      id: 7,
      title: "Hades",
      coverUrl: "https://placehold.co/300x400/e67e22/ffffff?text=Hades",
      platform: "Nintendo Switch",
      releaseDate: "2020-09-17",
      developer: "Supergiant Games",
      publisher: "Supergiant Games",
      genres: ["Roguelike", "Action", "Indie"],
      status: "completed",
      progress: 100,
      rating: 5,
      playTime: 45,
      notes: "Escaped 25 times, romanced Megaera",
      added_date: "2021-01-05"
    },
    {
      id: 8,
      title: "God of War Ragnarök",
      coverUrl: "https://placehold.co/300x400/3498db/ffffff?text=God+of+War",
      platform: "PlayStation 5",
      releaseDate: "2022-11-09",
      developer: "Santa Monica Studio",
      publisher: "Sony Interactive Entertainment",
      genres: ["Action-Adventure", "Hack and Slash"],
      status: "onHold",
      progress: 34,
      rating: 4.7,
      playTime: 15,
      notes: "Paused after reaching Alfheim",
      added_date: "2022-11-10"
    },
    {
      id: 9,
      title: "Horizon Forbidden West",
      coverUrl: "https://placehold.co/300x400/1abc9c/ffffff?text=Horizon",
      platform: "PlayStation 5",
      releaseDate: "2022-02-18",
      developer: "Guerrilla Games",
      publisher: "Sony Interactive Entertainment",
      genres: ["Action RPG", "Open World"],
      status: "dropped",
      progress: 22,
      rating: 3.8,
      playTime: 12,
      notes: "Couldn't get into it, might try again later",
      added_date: "2022-02-20"
    },
    {
      id: 10,
      title: "Hollow Knight",
      coverUrl: "https://placehold.co/300x400/8e44ad/ffffff?text=Hollow+Knight",
      platform: "PC",
      releaseDate: "2017-02-24",
      developer: "Team Cherry",
      publisher: "Team Cherry",
      genres: ["Metroidvania", "Platformer", "Indie"],
      status: "completed",
      progress: 100,
      rating: 4.9,
      playTime: 40,
      notes: "Got the true ending",
      added_date: "2020-05-10"
    }
  ];
  
  export const platforms = [
    "PC",
    "PlayStation 5",
    "PlayStation 4",
    "Xbox Series X/S",
    "Xbox One",
    "Nintendo Switch",
    "Steam Deck",
    "Mobile"
  ];
  
  export const genres = [
    "Action",
    "Adventure",
    "Action-Adventure",
    "RPG",
    "Strategy",
    "Simulation",
    "Sports",
    "Racing",
    "Fighting",
    "Shooter",
    "Puzzle",
    "Platformer",
    "Survival",
    "Horror",
    "Open World",
    "Indie",
    "Roguelike",
    "MMO",
    "MOBA",
    "Card Game",
    "Battle Royale"
  ];
  
  export const statuses = [
    { value: "notStarted", label: "Not Started" },
    { value: "inProgress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "onHold", label: "On Hold" },
    { value: "dropped", label: "Dropped" }
  ];