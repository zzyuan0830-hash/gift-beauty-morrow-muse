"use client";
import { useEffect, useRef, useState } from "react";
import { trapDialogTab } from "@/lib/dialog-focus";
import type { Image } from "@/lib/types";
export default function Gallery({
  images,
  title,
  preview = false,
}: {
  images: Image[];
  title: string;
  preview?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null);
  const move = (d: number) =>
    setIndex((i) => (i + d + images.length) % images.length);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [open]);
  return (
    <div className="gallery">
      <button
        className="gallery-main"
        ref={opener}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
        aria-label={`Enlarge ${title} image`}
      >
        <img
          src={images[index].url}
          alt={images[index].altText || title}
          width="900"
          height="1100"
        />
        <span>View closer +</span>
      </button>
      <div className="gallery-stepper">
        <button
          type="button"
          aria-label="Show previous product image"
          onClick={() => move(-1)}
        >
          ←
        </button>
        <span>
          {index + 1} / {images.length}{" "}
          <span className="quiet">
            {index === 0 ? "Featured view" : "Alternate view"}
          </span>
        </span>
        <button
          type="button"
          aria-label="Show next product image"
          onClick={() => move(1)}
        >
          →
        </button>
      </div>
      <div className="thumbnails" aria-label="Product images">
        {images.map((im, i) => (
          <button
            key={im.url}
            aria-label={`View image ${i + 1}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          >
            <img
              src={im.url}
              alt={im.altText || `${title} view ${i + 1}`}
              width="120"
              height="120"
            />
          </button>
        ))}
      </div>
      {preview && (
        <p className="gallery-caption">
          AI-created concepts, not manufactured products. Additional views
          explore the design; small details may vary.
        </p>
      )}
      <dialog
        className="image-dialog"
        ref={dialog}
        aria-label={`${title} image viewer`}
        onClose={() => {
          setOpen(false);
          opener.current?.focus();
        }}
        onKeyDown={(e) => {
          trapDialogTab(e);
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        <button className="close" onClick={() => dialog.current?.close()}>
          Close ×
        </button>
        <img src={images[index].url} alt={images[index].altText || title} />
        <div className="gallery-controls">
          <button aria-label="Previous image" onClick={() => move(-1)}>
            ←
          </button>
          <span aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <button aria-label="Next image" onClick={() => move(1)}>
            →
          </button>
        </div>
      </dialog>
    </div>
  );
}
