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
    site_buttons: [
      { id: "btn-navbar-home", button_key: "navbar.home", section: "Navigation", label: "Home", href: "/", description: "Top menu and footer — Home", is_active: true, sort_order: 1, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-communities", button_key: "navbar.communities", section: "Navigation", label: "Communities", href: "/communities", description: "Top menu and footer — Communities", is_active: true, sort_order: 2, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-giveaways", button_key: "navbar.giveaways", section: "Navigation", label: "Giveaways", href: "/giveaways", description: "Top menu and footer — Giveaways (logged-in fans)", is_active: true, sort_order: 3, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-meet-greet", button_key: "navbar.meet_greet", section: "Navigation", label: "Meet & Greet", href: "/meet-and-greet", description: "Top menu and footer — Meet & Greet (logged-in fans)", is_active: true, sort_order: 4, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-contact", button_key: "navbar.contact", section: "Navigation", label: "Private DMs", href: "/contact", description: "Top menu and footer — Private DMs (logged-in fans)", is_active: true, sort_order: 5, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-login", button_key: "navbar.login", section: "Navigation", label: "Log in", href: "/login", description: "Top menu — Log in (guests)", is_active: true, sort_order: 6, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-signup", button_key: "navbar.signup", section: "Navigation", label: "Sign up", href: "/signup", description: "Top menu — Sign up (guests)", is_active: true, sort_order: 7, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-dashboard", button_key: "navbar.dashboard", section: "Navigation", label: "Dashboard", href: "/dashboard", description: "Top menu — Dashboard (logged-in fans)", is_active: true, sort_order: 8, open_in_new_tab: false, updated_at: now() },
      { id: "btn-navbar-admin", button_key: "navbar.admin", section: "Navigation", label: "Admin", href: "/admin", description: "Top menu — Admin panel (admins only)", is_active: true, sort_order: 9, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-guest-primary", button_key: "home.cta.guest_primary", section: "Home page", label: "Create Account", href: "/signup", description: "Landing page bottom — main button for guests", is_active: true, sort_order: 10, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-guest-secondary", button_key: "home.cta.guest_secondary", section: "Home page", label: "Log In", href: "/login", description: "Landing page bottom — secondary button for guests", is_active: true, sort_order: 11, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-member-primary", button_key: "home.cta.member_primary", section: "Home page", label: "Go to Dashboard", href: "/dashboard", description: "Landing page bottom — main button for logged-in fans", is_active: true, sort_order: 12, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-member-secondary", button_key: "home.cta.member_secondary", section: "Home page", label: "Browse Communities", href: "/communities", description: "Landing page bottom — secondary button for logged-in fans", is_active: true, sort_order: 13, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-feature-giveaways", button_key: "home.feature.giveaways", section: "Home page", label: "Giveaways", href: "/giveaways", description: "Home feature card — Giveaways (logged-in fans)", is_active: true, sort_order: 14, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-feature-meet-greet", button_key: "home.feature.meet_greet", section: "Home page", label: "Meet & Greet", href: "/meet-and-greet", description: "Home feature card — Meet & Greet (logged-in fans)", is_active: true, sort_order: 15, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-feature-communities-guest", button_key: "home.feature.communities_guest", section: "Home page", label: "Communities", href: "/signup", description: "Home feature card — Communities (guests, before sign up)", is_active: true, sort_order: 16, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-feature-communities-member", button_key: "home.feature.communities_member", section: "Home page", label: "Communities", href: "/communities", description: "Home feature card — Communities (logged-in fans)", is_active: true, sort_order: 17, open_in_new_tab: false, updated_at: now() },
      { id: "btn-home-feature-contact", button_key: "home.feature.contact", section: "Home page", label: "Private DMs", href: "/contact", description: "Home feature card — Private DMs (logged-in fans)", is_active: true, sort_order: 18, open_in_new_tab: false, updated_at: now() },
      { id: "btn-community-guest-join", button_key: "community.guest_join", section: "Communities", label: "Sign up to join", href: "/signup", description: "When a guest clicks a community card — where they go instead of Telegram", is_active: true, sort_order: 19, open_in_new_tab: false, updated_at: now() },
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
