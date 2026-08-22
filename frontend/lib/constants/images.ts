/**
 * 10 Curated, High-Resolution Travel Journal Images
 * Used consistently across Cities, Trips, Cover Photos, and Community stories.
 */
export const CURATED_IMAGES = [
  {
    id: "paris",
    name: "Paris, France",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80",
    tag: "Eiffel Tower & Seine",
  },
  {
    id: "tokyo",
    name: "Tokyo, Japan",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80",
    tag: "Neon Metropolis",
  },
  {
    id: "kyoto",
    name: "Kyoto, Japan",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop&q=80",
    tag: "Zen Gardens & Shrines",
  },
  {
    id: "santorini",
    name: "Santorini, Greece",
    url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&auto=format&fit=crop&q=80",
    tag: "Aegean Coastline",
  },
  {
    id: "barcelona",
    name: "Barcelona, Spain",
    url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&auto=format&fit=crop&q=80",
    tag: "Gaudí Architecture",
  },
  {
    id: "rome",
    name: "Rome, Italy",
    url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=80",
    tag: "Colosseum & Piazzas",
  },
  {
    id: "newyork",
    name: "New York City, USA",
    url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop&q=80",
    tag: "Manhattan Skyline",
  },
  {
    id: "bali",
    name: "Bali, Indonesia",
    url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80",
    tag: "Tropical Rice Terraces",
  },
  {
    id: "cairo",
    name: "Cairo, Egypt",
    url: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&auto=format&fit=crop&q=80",
    tag: "Pyramids of Giza",
  },
  {
    id: "sydney",
    name: "Sydney, Australia",
    url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&auto=format&fit=crop&q=80",
    tag: "Harbour & Opera House",
  },
];

export function getRandomCuratedImage() {
  return CURATED_IMAGES[Math.floor(Math.random() * CURATED_IMAGES.length)];
}

export function getImageByCityName(cityName: string) {
  const normalized = cityName.toLowerCase();
  const found = CURATED_IMAGES.find((img) => normalized.includes(img.id) || img.name.toLowerCase().includes(normalized));
  return found ? found.url : CURATED_IMAGES[0].url;
}
