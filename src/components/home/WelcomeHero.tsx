import Image from "next/image";
import { welcomeMessage, branding } from "@/lib/branding";
import { HeroVideoPortrait } from "@/components/home/HeroVideoPortrait";

export function WelcomeHero({ heroVideoUrl }: { heroVideoUrl: string }) {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={branding.heroImage}
          alt=""
          fill
          priority
          className="hero-bg-image scale-110 object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,55,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(212,175,55,0.06),transparent_40%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-6 py-20 lg:px-10">
        <div className="mb-12 animate-fade-up text-center lg:mb-16">
          <p className="mb-3 text-xs uppercase tracking-[0.45em] text-accent">
            Official Fan Experience
          </p>
          <h1 className="font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {branding.celebrityName}
          </h1>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-slide-in-left mx-auto w-full max-w-md lg:max-w-lg">
            <HeroVideoPortrait
              videoUrl={heroVideoUrl}
              poster={branding.heroImage}
              alt="Keanu Reeves intro video"
            />
          </div>

          <div className="animate-slide-in-right glass rounded-[20px] p-8 sm:p-10 lg:p-12">
            <div className="space-y-6 text-base leading-[1.85] text-muted sm:text-lg">
              {welcomeMessage.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <p className="font-display mt-10 text-xl text-foreground">{welcomeMessage.signOff}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
