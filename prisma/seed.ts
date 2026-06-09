import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const genres = [
  { name: "Action", slug: "action", color: "#ef4444" },
  { name: "Adventure", slug: "adventure", color: "#f97316" },
  { name: "RPG", slug: "rpg", color: "#8b5cf6" },
  { name: "Strategy", slug: "strategy", color: "#3b82f6" },
  { name: "Simulation", slug: "simulation", color: "#10b981" },
  { name: "Sports", slug: "sports", color: "#f59e0b" },
  { name: "Horror", slug: "horror", color: "#6b7280" },
  { name: "Puzzle", slug: "puzzle", color: "#ec4899" },
  { name: "Platformer", slug: "platformer", color: "#14b8a6" },
  { name: "Shooter", slug: "shooter", color: "#ef4444" },
  { name: "Fighting", slug: "fighting", color: "#f97316" },
  { name: "Racing", slug: "racing", color: "#0ea5e9" },
  { name: "Survival", slug: "survival", color: "#84cc16" },
  { name: "Stealth", slug: "stealth", color: "#6366f1" },
  { name: "MMORPG", slug: "mmorpg", color: "#a855f7" },
];

const platforms = [
  { name: "Windows", slug: "windows" },
  { name: "Linux", slug: "linux" },
  { name: "macOS", slug: "macos" },
  { name: "Steam Deck", slug: "steam-deck" },
];

const categories = [
  { name: "Indie", slug: "indie" },
  { name: "AAA", slug: "aaa" },
  { name: "Early Access", slug: "early-access" },
  { name: "Free to Play", slug: "free-to-play" },
  { name: "Multiplayer", slug: "multiplayer" },
  { name: "Single Player", slug: "single-player" },
  { name: "Co-op", slug: "co-op" },
  { name: "Open World", slug: "open-world" },
];

const sampleGames = [
  {
    title: "Elden Ring",
    slug: "elden-ring",
    description: "A vast open-world action RPG developed by FromSoftware. Journey through the Lands Between, a new fantasy world created in collaboration with George R.R. Martin.",
    shortDesc: "Open-world action RPG with brutal combat and breathtaking exploration.",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    releaseDate: new Date("2022-02-25"),
    metacriticScore: 96,
    featured: true,
    genres: ["action", "rpg"],
  },
  {
    title: "Baldur's Gate 3",
    slug: "baldurs-gate-3",
    description: "An epic RPG set in the Forgotten Realms universe. Make choices that ripple across your journey and the world as you gather an unlikely party of adventurers.",
    shortDesc: "The definitive RPG experience with unparalleled depth and choice.",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    releaseDate: new Date("2023-08-03"),
    metacriticScore: 97,
    featured: true,
    genres: ["rpg", "strategy"],
  },
  {
    title: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    description: "An open-world action RPG set in the megalopolis of Night City, where you play as a mercenary outlaw going after a one-of-a-kind implant.",
    shortDesc: "Neon-soaked open-world action RPG in a dystopian future.",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2020-12-10"),
    metacriticScore: 86,
    featured: true,
    genres: ["action", "rpg"],
  },
  {
    title: "Hades",
    slug: "hades",
    description: "A rogue-like dungeon crawler where you defy the god of the dead as you hack and slash your way out of the Underworld.",
    shortDesc: "Rogue-like perfection with incredible story and replayability.",
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
    releaseDate: new Date("2020-09-17"),
    metacriticScore: 93,
    featured: false,
    genres: ["action", "rpg"],
  },
  {
    title: "The Witcher 3: Wild Hunt",
    slug: "the-witcher-3-wild-hunt",
    description: "Play as a monster hunter in a vast open world. Make impactful choices, meet memorable characters, and follow an epic main story.",
    shortDesc: "The gold standard of open-world RPGs.",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2015-05-19"),
    metacriticScore: 93,
    featured: true,
    genres: ["rpg", "action"],
  },
  {
    title: "Stardew Valley",
    slug: "stardew-valley",
    description: "You inherit your grandfather's old farm plot. With old tools and a handful of coins, you set out to begin your new life.",
    shortDesc: "Charming farming RPG with endless depth and cozy vibes.",
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
    releaseDate: new Date("2016-02-26"),
    metacriticScore: 89,
    featured: false,
    genres: ["simulation", "rpg"],
  },
  {
    title: "DOOM Eternal",
    slug: "doom-eternal",
    description: "Experience the ultimate combination of speed and power as you rip-and-tear your way across dimensions against the most threatening demons.",
    shortDesc: "The most intensely satisfying first-person shooter ever made.",
    developer: "id Software",
    publisher: "Bethesda Softworks",
    releaseDate: new Date("2020-03-20"),
    metacriticScore: 88,
    featured: false,
    genres: ["shooter", "action"],
  },
  {
    title: "Hollow Knight",
    slug: "hollow-knight",
    description: "A challenging 2D action-adventure. Forge your own path in Hallownest, a vast ruined kingdom of insects.",
    shortDesc: "Stunning hand-drawn metroidvania with brutal precision.",
    developer: "Team Cherry",
    publisher: "Team Cherry",
    releaseDate: new Date("2017-02-24"),
    metacriticScore: 87,
    featured: false,
    genres: ["action", "platformer"],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create genres
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }
  console.log(`✅ Created ${genres.length} genres`);

  // Create platforms
  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: {},
      create: platform,
    });
  }
  console.log(`✅ Created ${platforms.length} platforms`);

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Get platform IDs
  const windowsPlatform = await prisma.platform.findUnique({ where: { slug: "windows" } });

  // Create sample games
  for (const gameData of sampleGames) {
    const { genres: genreSlugs, ...data } = gameData;

    const game = await prisma.game.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        published: true,
        platforms: windowsPlatform
          ? { create: { platformId: windowsPlatform.id } }
          : undefined,
      },
    });

    // Attach genres
    for (const genreSlug of genreSlugs) {
      const genre = await prisma.genre.findUnique({ where: { slug: genreSlug } });
      if (genre) {
        await prisma.gameGenre.upsert({
          where: { gameId_genreId: { gameId: game.id, genreId: genre.id } },
          update: {},
          create: { gameId: game.id, genreId: genre.id },
        });
      }
    }
  }
  console.log(`✅ Created ${sampleGames.length} sample games`);

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@vortex.app" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@vortex.app",
      password: adminPassword,
      role: "ADMIN",
      username: "admin",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Created admin user (admin@vortex.app / Admin123!)");

  // Create demo user
  const demoPassword = await bcrypt.hash("Demo123!", 12);
  await prisma.user.upsert({
    where: { email: "demo@vortex.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@vortex.app",
      password: demoPassword,
      role: "USER",
      username: "demo_user",
      bio: "Just a gamer who loves RPGs and exploring vast open worlds.",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Created demo user (demo@vortex.app / Demo123!)");

  console.log("\n🎮 Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
