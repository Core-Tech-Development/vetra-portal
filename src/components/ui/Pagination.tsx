import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

function buildPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | "ellipsis")[] {
  if (totalPages <= 1) return [];

  const totalSlots = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis slots

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages - 2,
  );

  const showLeftEllipsis = leftSiblingIndex > 1;
  const showRightEllipsis = rightSiblingIndex < totalPages - 2;

  const pages: (number | "ellipsis")[] = [];

  // Always show first page
  pages.push(0);

  if (showLeftEllipsis) {
    pages.push("ellipsis");
  } else {
    // Fill pages between first page and left sibling
    for (let i = 1; i < leftSiblingIndex; i++) {
      pages.push(i);
    }
  }

  // Pages around current
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push("ellipsis");
  } else {
    // Fill pages between right sibling and last page
    for (let i = rightSiblingIndex + 1; i < totalPages - 1; i++) {
      pages.push(i);
    }
  }

  // Always show last page
  pages.push(totalPages - 1);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const pages = useMemo(
    () => buildPageRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount],
  );

  if (totalPages <= 1) return null;

  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  return (
    <nav aria-label="Pagination" className={styles.pagination}>
      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      <div className={styles.desktopPages}>
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              className={[styles.button, isActive ? styles.active : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page + 1}`}
              aria-current={isActive ? "page" : undefined}
            >
              {page + 1}
            </button>
          );
        })}
      </div>

      <span className={styles.mobileInfo}>
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
