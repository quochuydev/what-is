"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface ThreeDMarqueeProps {
  images: string[];
}

export function ThreeDMarquee({ images }: ThreeDMarqueeProps) {
  const column1Ref = useRef<HTMLDivElement>(null);
  const column2Ref = useRef<HTMLDivElement>(null);
  const column3Ref = useRef<HTMLDivElement>(null);
  const column4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    let offset = 0;
    const speed = 0.3;

    const animate = () => {
      offset += speed;
      if (offset >= 100) offset = 0;

      // Alternate directions for columns
      if (column1Ref.current) {
        column1Ref.current.style.transform = `translateY(${offset % 50}px)`;
      }
      if (column2Ref.current) {
        column2Ref.current.style.transform = `translateY(${-(offset % 50)}px)`;
      }
      if (column3Ref.current) {
        column3Ref.current.style.transform = `translateY(${offset % 50}px)`;
      }
      if (column4Ref.current) {
        column4Ref.current.style.transform = `translateY(${-(offset % 50)}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Create 9 images per column by repeating the 5 images
  const columnImages = [...images, ...images, ...images, ...images].slice(0, 9);

  // Shuffle for different columns
  const col1Images = columnImages;
  const col2Images = [...columnImages].reverse();
  const col3Images = [columnImages[2], columnImages[0], columnImages[4], columnImages[1], columnImages[3], ...columnImages.slice(0, 4)];
  const col4Images = [columnImages[3], columnImages[1], columnImages[0], columnImages[4], columnImages[2], ...columnImages.slice(0, 4)];

  const GridLine = ({ direction }: { direction: "horizontal" | "vertical" }) => (
    <div
      className={`absolute z-30 ${
        direction === "horizontal"
          ? "-top-4 left-[calc(-10px)] h-px w-[calc(100%+20px)]"
          : "-left-4 top-[calc(-40px)] h-[calc(100%+80px)] w-px"
      }`}
      style={{
        background:
          direction === "horizontal"
            ? "linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 50%, transparent 0, transparent)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 50%, transparent 0, transparent)",
        backgroundSize: direction === "horizontal" ? "5px 1px" : "1px 5px",
        mask: direction === "horizontal"
          ? "linear-gradient(to left, white 90%, transparent), linear-gradient(to right, white 90%, transparent), linear-gradient(black, black)"
          : "linear-gradient(to top, white 90%, transparent), linear-gradient(to bottom, white 90%, transparent), linear-gradient(black, black)",
        maskComposite: "exclude",
      }}
    />
  );

  const ImageCard = ({ src, alt }: { src: string; alt: string }) => (
    <div className="relative">
      <GridLine direction="horizontal" />
      <Image
        src={src}
        alt={alt}
        width={970}
        height={700}
        unoptimized
        className="aspect-[970/700] rounded-lg object-cover ring ring-gray-950/5 transition-shadow hover:shadow-2xl"
      />
    </div>
  );

  const Column = ({
    images,
    refProp,
  }: {
    images: string[];
    refProp: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div ref={refProp} className="flex flex-col items-start gap-8">
      <GridLine direction="vertical" />
      {images.map((src, idx) => (
        <ImageCard key={idx} src={src} alt={`Demo ${idx + 1}`} />
      ))}
    </div>
  );

  return (
    <div className="mt-15 flex h-[400px] w-full items-center justify-center overflow-hidden">
      <div className="mx-auto block h-[400px] overflow-hidden rounded-none max-sm:h-[400px]">
        <div className="flex size-full items-center justify-center">
          <div className="size-[1720px] shrink-0 scale-[0.35] sm:scale-50 lg:scale-75 xl:scale-100">
            <div
              className="relative top-96 right-[50%] grid size-full origin-top-left grid-cols-4 gap-8"
              style={{
                transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <Column images={col1Images} refProp={column1Ref} />
              <Column images={col2Images} refProp={column2Ref} />
              <Column images={col3Images} refProp={column3Ref} />
              <Column images={col4Images} refProp={column4Ref} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
