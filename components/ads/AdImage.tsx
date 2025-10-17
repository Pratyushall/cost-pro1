// components/ads/AdImage.tsx
"use client";
import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  width: number;
  height: number;
};

export default function AdImage({
  src,
  alt = "Sponsored creative",
  width,
  height,
}: Props) {
  return (
    <div className="ad-wrap shadow-lg">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="block w-full h-auto"
        priority
      />
      <div className="ad-label">
        <span className="ad-i">i</span>
        Sponsored
      </div>
    </div>
  );
}
