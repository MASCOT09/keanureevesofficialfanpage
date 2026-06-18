create table if not exists public.site_buttons (
  id text primary key,
  button_key text not null unique,
  section text not null,
  label text not null,
  href text not null,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  open_in_new_tab boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.site_buttons disable row level security;

insert into public.site_buttons (id, button_key, section, label, href, description, is_active, sort_order, open_in_new_tab)
values
  ('btn-navbar-home', 'navbar.home', 'Navigation', 'Home', '/', 'Top menu and footer — Home', true, 1, false),
  ('btn-navbar-communities', 'navbar.communities', 'Navigation', 'Communities', '/communities', 'Top menu and footer — Communities', true, 2, false),
  ('btn-navbar-giveaways', 'navbar.giveaways', 'Navigation', 'Giveaways', '/giveaways', 'Top menu and footer — Giveaways (logged-in fans)', true, 3, false),
  ('btn-navbar-meet-greet', 'navbar.meet_greet', 'Navigation', 'Meet & Greet', '/meet-and-greet', 'Top menu and footer — Meet & Greet (logged-in fans)', true, 4, false),
  ('btn-navbar-contact', 'navbar.contact', 'Navigation', 'Private DMs', '/contact', 'Top menu and footer — Private DMs (logged-in fans)', true, 5, false),
  ('btn-navbar-login', 'navbar.login', 'Navigation', 'Log in', '/login', 'Top menu — Log in (guests)', true, 6, false),
  ('btn-navbar-signup', 'navbar.signup', 'Navigation', 'Sign up', '/signup', 'Top menu — Sign up (guests)', true, 7, false),
  ('btn-navbar-dashboard', 'navbar.dashboard', 'Navigation', 'Dashboard', '/dashboard', 'Top menu — Dashboard (logged-in fans)', true, 8, false),
  ('btn-navbar-admin', 'navbar.admin', 'Navigation', 'Admin', '/admin', 'Top menu — Admin panel (admins only)', true, 9, false),
  ('btn-home-guest-primary', 'home.cta.guest_primary', 'Home page', 'Create Account', '/signup', 'Landing page bottom — main button for guests', true, 10, false),
  ('btn-home-guest-secondary', 'home.cta.guest_secondary', 'Home page', 'Log In', '/login', 'Landing page bottom — secondary button for guests', true, 11, false),
  ('btn-home-member-primary', 'home.cta.member_primary', 'Home page', 'Go to Dashboard', '/dashboard', 'Landing page bottom — main button for logged-in fans', true, 12, false),
  ('btn-home-member-secondary', 'home.cta.member_secondary', 'Home page', 'Browse Communities', '/communities', 'Landing page bottom — secondary button for logged-in fans', true, 13, false),
  ('btn-home-feature-giveaways', 'home.feature.giveaways', 'Home page', 'Giveaways', '/giveaways', 'Home feature card — Giveaways (logged-in fans)', true, 14, false),
  ('btn-home-feature-meet-greet', 'home.feature.meet_greet', 'Home page', 'Meet & Greet', '/meet-and-greet', 'Home feature card — Meet & Greet (logged-in fans)', true, 15, false),
  ('btn-home-feature-communities-guest', 'home.feature.communities_guest', 'Home page', 'Communities', '/signup', 'Home feature card — Communities (guests, before sign up)', true, 16, false),
  ('btn-home-feature-communities-member', 'home.feature.communities_member', 'Home page', 'Communities', '/communities', 'Home feature card — Communities (logged-in fans)', true, 17, false),
  ('btn-home-feature-contact', 'home.feature.contact', 'Home page', 'Private DMs', '/contact', 'Home feature card — Private DMs (logged-in fans)', true, 18, false),
  ('btn-community-guest-join', 'community.guest_join', 'Communities', 'Sign up to join', '/signup', 'When a guest clicks a community card — where they go instead of Telegram', true, 19, false)
on conflict (button_key) do nothing;
