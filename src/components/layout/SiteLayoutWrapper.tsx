import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getSiteButtonMap } from "@/lib/site-buttons";
import { Footer } from "@/components/layout/Footer";
import { Navbar, type NavbarUser } from "@/components/layout/Navbar";

async function getNavbarUser(): Promise<NavbarUser | null> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return null;

  const profile = await getCurrentProfile();
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    role: sessionUser.role,
    display_name: profile?.display_name ?? sessionUser.email,
  };
}

export async function SiteLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [initialUser, buttons] = await Promise.all([getNavbarUser(), getSiteButtonMap()]);

  return (
    <>
      <Navbar initialUser={initialUser} buttons={buttons} />
      <main id="main-content" className="min-h-[calc(100vh-8rem)]">
        {children}
      </main>
      <Footer isLoggedIn={!!initialUser} buttons={buttons} />
    </>
  );
}
