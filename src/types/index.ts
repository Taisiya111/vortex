export type { Role, LibraryStatus, NotificationType } from "@prisma/client";

export interface GameWithRelations {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  coverImage?: string | null;
  bannerImage?: string | null;
  releaseDate?: Date | null;
  developer?: string | null;
  publisher?: string | null;
  website?: string | null;
  metacriticScore?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  genres: { genre: { id: string; name: string; slug: string; color?: string | null } }[];
  platforms: { platform: { id: string; name: string; slug: string } }[];
  categories: { category: { id: string; name: string; slug: string } }[];
  _count?: {
    reviews: number;
    ratings: number;
    libraryEntries: number;
    wishlists: number;
  };
  avgRating?: number;
}

export interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  username?: string | null;
  image?: string | null;
  banner?: string | null;
  bio?: string | null;
  role: string;
  createdAt: Date;
  _count?: {
    library: number;
    reviews: number;
    collections: number;
    followers: number;
    following: number;
  };
}

export interface ReviewWithRelations {
  id: string;
  content: string;
  title?: string | null;
  rating: number;
  spoiler: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
  };
  game: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string | null;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  liked?: boolean;
}

export interface LibraryEntryWithGame {
  id: string;
  status: string;
  hoursPlayed?: number | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  game: GameWithRelations;
}

export interface CollectionWithItems {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  public: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
  };
  items: {
    id: string;
    order: number;
    notes?: string | null;
    addedAt: Date;
    game: GameWithRelations;
  }[];
  _count?: { items: number };
}

export interface DashboardStats {
  totalGames: number;
  completedGames: number;
  playingGames: number;
  totalHours: number;
  totalReviews: number;
  totalCollections: number;
  wishlistCount: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
