import { useState } from "react";
import styles from "./Avatar.module.css";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const AVATAR_COLORS = [
  "#1F6F5B",
  "#7CA982",
  "#4F6257",
  "#2E7D32",
  "#2563EB",
  "#B7791F",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = styles[size];
  const showImage = src && !imageError;

  const classNames = [styles.avatar, sizeClass].join(" ");
  const backgroundColor = showImage ? undefined : getColorFromName(name);

  return (
    <div
      className={classNames}
      style={{ backgroundColor }}
      role="img"
      aria-label={name}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={name}
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}
