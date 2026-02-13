
import { SimulatedUser } from '../types';

export const SIMULATED_USERS: SimulatedUser[] = [
  {
    id: 'user1',
    username: 'LunaDreamer',
    avatarUrl: 'https://picsum.photos/id/1005/50/50',
    bio: 'Exploring the cosmic canvas of subconscious thoughts. Every dream is a hidden message.',
    latitude: 34.0522, // Los Angeles
    longitude: -118.2437,
    dreams: [
      {
        id: 'd101',
        title: 'Flight with Feathered Friends',
        content: 'Dreamed I was soaring with a flock of iridescent birds over a city made of glass.',
      },
      {
        id: 'd102',
        title: 'Lost Library of Whispers',
        content: 'Wandered through an endless library where books whispered forgotten stories. Found a map to a hidden realm.',
      },
    ],
  },
  {
    id: 'user2',
    username: 'StarlightSeeker',
    avatarUrl: 'https://picsum.photos/id/1006/50/50',
    bio: 'A humble traveler through the night\'s tapestry, collecting stardust and strange tales.',
    latitude: 34.0736, // Nearby Los Angeles (Beverly Hills)
    longitude: -118.4004,
    dreams: [
      {
        id: 'd201',
        title: 'Meeting the Shadow Puppeteer',
        content: 'Encountered a mysterious figure who animated shadows into living beings. Learned the art of illusion.',
      },
      {
        id: 'd202',
        title: 'Underwater City of Coral',
        content: 'Breathed underwater in a vibrant city built entirely from living coral. Communicated with glowing fish.',
      },
    ],
  },
  {
    id: 'user3',
    username: 'EchoWeaver',
    avatarUrl: 'https://picsum.photos/id/1008/50/50',
    bio: 'Weaving echoes of memories and future visions into a tapestry of dreams. Always seeking resonance.',
    latitude: 34.0195, // Santa Monica, CA (also nearby)
    longitude: -118.4912,
    dreams: [
      {
        id: 'd301',
        title: 'The Clockwork Forest',
        content: 'Walked through a forest where trees had gears and leaves were made of polished brass, ticking softly.',
      },
      {
        id: 'd302',
        title: 'Mirror Maze of Reflections',
        content: 'Lost in a maze of infinite reflections, each mirror showing a different possible self. Found the true path eventually.',
      },
    ],
  },
  {
    id: 'user4',
    username: 'NightWhisper',
    avatarUrl: 'https://picsum.photos/id/1011/50/50',
    bio: 'Listening to the secrets the night reveals. Dreams are whispers from another reality.',
    latitude: 40.7128, // New York City (far from LA users)
    longitude: -74.0060,
    dreams: [
      {
        id: 'd401',
        title: 'Silent Carnival of Stars',
        content: 'Attended a silent carnival held under a sky full of dancing stars. Rode a carousel powered by constellations.',
      },
    ],
  },
  {
    id: 'user5',
    username: 'MythicMind',
    avatarUrl: 'https://picsum.photos/id/1012/50/50',
    bio: 'Drawing inspiration from ancient myths and legends. My dreams are sagas waiting to be told.',
    latitude: 51.5074, // London (far from LA users)
    longitude: -0.1278,
    dreams: [
      {
        id: 'd501',
        title: 'Guardian of the Crystal Caves',
        content: 'Became the guardian of crystal caves, protecting shimmering dragons and their luminous eggs.',
      },
    ],
  },
  {
    id: 'user6',
    username: 'DreamArchitect',
    avatarUrl: 'https://picsum.photos/id/1015/50/50',
    bio: 'Building worlds one dream at a time. The architect of the subconscious.',
    latitude: 34.0207, // Culver City, CA (nearby LA)
    longitude: -118.3966,
    dreams: [
      {
        id: 'd601',
        title: 'Infinite Staircase to the Sky',
        content: 'Climbed a never-ending staircase that led to a sky filled with unknown galaxies and celestial beings.',
      },
    ],
  },
  {
    id: 'user7',
    username: 'PixelDreamer',
    avatarUrl: 'https://picsum.photos/id/1016/50/50',
    bio: 'Dreams rendered in 8-bit. Retro-futurist visions from the edge of sleep.',
    latitude: -23.5505, // São Paulo, Brazil (far from others)
    longitude: -46.6333,
    dreams: [
      {
        id: 'd701',
        title: 'Jungle of Glowing Flora',
        content: 'Explored a bioluminescent jungle where every plant pulsed with soft, hypnotic light.',
      },
    ],
  },
  {
    id: 'user8',
    username: 'ZenSleeper',
    avatarUrl: 'https://picsum.photos/id/1018/50/50',
    bio: 'Finding peace in the dream realms. Serenity is the ultimate journey.',
    latitude: 34.0452, // Downtown LA (very nearby)
    longitude: -118.2570,
    dreams: [
      {
        id: 'd801',
        title: 'Floating Island of Meditation',
        content: 'Meditated on a small, silent island floating above the clouds, surrounded by pure white light.',
      },
    ],
  },
  {
    id: 'user9',
    username: 'CodeDreamer',
    avatarUrl: 'https://picsum.photos/id/1020/50/50',
    bio: 'My dreams are algorithms, constantly compiling new realities.',
    latitude: 37.7749, // San Francisco, CA (further from LA, but still CA)
    longitude: -122.4194,
    dreams: [
      {
        id: 'd901',
        title: 'Circuit City of Logic',
        content: 'Navigated a city where buildings were circuit boards and traffic flowed like data streams.',
      },
    ],
  },
  {
    id: 'user10',
    username: 'WanderlustMind',
    avatarUrl: 'https://picsum.photos/id/1021/50/50',
    bio: 'The world is my dream canvas. Always seeking new horizons.',
    latitude: 34.0805, // Hollywood, CA (nearby LA)
    longitude: -118.3398,
    dreams: [
      {
        id: 'd1001',
        title: 'Desert of Singing Sands',
        content: 'Crossed a vast desert where the sands hummed ancient tunes, guided by a mirage-like caravan.',
      },
    ],
  },
];
