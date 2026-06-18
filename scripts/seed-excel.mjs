import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "celebrity-site.xlsx");

const now = () => new Date().toISOString();

async function seed() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  const fanHash = await bcrypt.hash("fan123", 10);

  const ends1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const ends2 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const event1 = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
  const event2 = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

  const adminId = randomUUID();
  const fanId = randomUUID();

  const sheets = {
    users: [
      {
        id: adminId,
        email: "admin@keanu.fan",
        password_hash: adminHash,
        display_name: "Site Admin",
        role: "admin",
        created_at: now(),
      },
      {
        id: fanId,
        email: "fan@example.com",
        password_hash: fanHash,
        display_name: "Demo Fan",
        role: "fan",
        country: "United States",
        membership_tier: "none",
        membership_status: "none",
        created_at: now(),
      },
    ],
    membership_applications: [],
    site_settings: [
      {
        id: 1,
        celebrity_name: "Keanu Reeves",
        tagline: "Official fan experience — giveaways, meet & greets, and more.",
        hero_video_url: "/videos/intro.mp4",
        updated_at: now(),
      },
    ],
    giveaways: [
      {
        id: "giveaway-1",
        title: "Signed Poster Giveaway",
        description: "Win an exclusive signed poster from the latest production.",
        rules: "One entry per fan. Must be 18+. Winner announced on social media.",
        image_url: null,
        ends_at: ends1,
        status: "active",
        created_at: now(),
      },
      {
        id: "giveaway-2",
        title: "VIP Premiere Pass",
        description: "Two tickets to an upcoming red carpet premiere event.",
        rules: "Travel not included. Fan account required to enter.",
        image_url: null,
        ends_at: ends2,
        status: "active",
        created_at: now(),
      },
    ],
    giveaway_entries: [],
    meet_greet_events: [
      {
        id: "event-1",
        title: "Fan Meet & Greet — Lagos",
        description: "An intimate meet & greet with photo opportunities and Q&A.",
        location: "Lagos, Nigeria",
        event_date: event1,
        max_spots: 50,
        status: "upcoming",
        created_at: now(),
      },
      {
        id: "event-2",
        title: "Virtual Fan Hangout",
        description: "Join a live virtual session with fellow fans worldwide.",
        location: "Online",
        event_date: event2,
        max_spots: 200,
        status: "upcoming",
        created_at: now(),
      },
    ],
    meet_greet_registrations: [],
    communities: [
      {
        id: "community-1",
        name: "Official Fan Club",
        description: "Join thousands of fans in our main Telegram community.",
        platform: "telegram",
        url: "https://t.me/example",
        is_active: true,
        sort_order: 1,
        created_at: now(),
      },
      {
        id: "community-2",
        name: "Behind the Scenes",
        description: "Exclusive updates, sneak peeks, and production news.",
        platform: "telegram",
        url: "https://t.me/example2",
        is_active: true,
        sort_order: 2,
        created_at: now(),
      },
    ],
    contact_links: [
      {
        id: "contact-keanu-wa",
        platform: "whatsapp",
        recipient: "keanu",
        label: "Message on WhatsApp",
        url: "https://wa.me/1234567890",
        is_active: true,
        sort_order: 1,
        created_at: now(),
      },
      {
        id: "contact-keanu-zangi",
        platform: "zangi",
        recipient: "keanu",
        label: "Message on Zangi",
        url: "https://zangi.com/",
        is_active: true,
        sort_order: 2,
        created_at: now(),
      },
      {
        id: "contact-keanu-tg",
        platform: "telegram",
        recipient: "keanu",
        label: "Message on Telegram",
        url: "https://t.me/keanureeves",
        is_active: true,
        sort_order: 3,
        created_at: now(),
      },
      {
        id: "contact-team-wa",
        platform: "whatsapp",
        recipient: "team",
        label: "Message on WhatsApp",
        url: "https://wa.me/1987654321",
        is_active: true,
        sort_order: 4,
        created_at: now(),
      },
      {
        id: "contact-team-zangi",
        platform: "zangi",
        recipient: "team",
        label: "Message on Zangi",
        url: "https://zangi.com/",
        is_active: true,
        sort_order: 5,
        created_at: now(),
      },
      {
        id: "contact-team-tg",
        platform: "telegram",
        recipient: "team",
        label: "Message on Telegram",
        url: "https://t.me/keanufanteam",
        is_active: true,
        sort_order: 6,
        created_at: now(),
      },
    ],
    messages: [
      {
        id: randomUUID(),
        user_id: fanId,
        subject: "Welcome to the fan club",
        body: "Thanks for joining! You'll receive updates about giveaways, meet & greets, and exclusive content here.",
        from_name: "Keanu Fan Team",
        is_read: false,
        status: "unread",
        created_at: now(),
      },
      {
        id: randomUUID(),
        user_id: fanId,
        subject: "Giveaway reminder",
        body: "Don't forget — the Signed Poster Giveaway ends soon. Make sure your entry is confirmed!",
        from_name: "Giveaways",
        is_read: true,
        status: "read",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: randomUUID(),
        user_id: fanId,
        subject: "Your fan letter",
        body: "Thank you for your message! We loved hearing from you and will share it with the team.",
        from_name: "Fan Relations",
        is_read: true,
        status: "replied",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    notifications: [
      {
        id: randomUUID(),
        user_id: fanId,
        title: "New giveaway live",
        message: "Signed Poster Giveaway is now open for entries.",
        is_read: false,
        created_at: now(),
      },
      {
        id: randomUUID(),
        user_id: fanId,
        title: "Meet & Greet announced",
        message: "Fan Meet & Greet — Lagos has been added to upcoming events.",
        is_read: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: randomUUID(),
        user_id: fanId,
        title: "Profile complete",
        message: "Your member profile is set up. Explore the dashboard to get started.",
        is_read: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  const workbook = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  }

  XLSX.writeFile(workbook, filePath);
  console.log("Created:", filePath);
  console.log("");
  console.log("Default accounts:");
  console.log("  Admin: admin@keanu.fan / admin123");
  console.log("  Fan:   fan@example.com / fan123");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
