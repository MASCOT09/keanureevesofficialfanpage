import Image from "next/image";

export function ContentImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <div className="relative aspect-[21/9] w-full border-b border-border/60">
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/60 sm:grid-cols-2">
      {images.map((src, index) => (
        <div
          key={src}
          className={`relative aspect-[16/10] w-full overflow-hidden ${
            index === 0 && images.length % 2 === 1 ? "sm:col-span-2" : ""
          }`}
        >
          <Image
            src={src}
            alt={`${alt} ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
