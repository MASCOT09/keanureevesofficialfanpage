import Image from "next/image";
import { getInitials } from "@/lib/dashboard-utils";

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-20 w-20 text-2xl",
  lg: "h-28 w-28 text-3xl",
};

const sizePixels = {
  sm: 36,
  md: 80,
  lg: 112,
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const base = `${sizeClasses[size]} ${className}`;

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${name} profile photo`}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className={`rounded-full border border-accent/30 object-cover ${base}`}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full border border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 font-medium text-accent ${base}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
