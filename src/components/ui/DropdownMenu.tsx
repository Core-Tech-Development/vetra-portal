import { useState, useRef, useEffect, useCallback, useId } from "react";
import type { ReactNode, KeyboardEvent } from "react";
import styles from "./DropdownMenu.module.css";

interface DropdownMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "end";
}

export function DropdownMenu({
  trigger,
  items,
  align = "start",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        setFocusedIndex(0);
      } else {
        setFocusedIndex(-1);
      }
      return !prev;
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  // Focus menu items
  useEffect(() => {
    if (!open || focusedIndex < 0) return;

    const menu = menuRef.current;
    if (!menu) return;

    const menuItems = Array.from(
      menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    );

    if (menuItems[focusedIndex]) {
      menuItems[focusedIndex].focus();
    }
  }, [open, focusedIndex]);

  const handleMenuKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const enabledIndices = items
        .map((item, i) => (!item.disabled ? i : -1))
        .filter((i) => i >= 0);

      if (enabledIndices.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const currentPos = enabledIndices.indexOf(focusedIndex);
        const nextPos = (currentPos + 1) % enabledIndices.length;
        setFocusedIndex(enabledIndices[nextPos]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentPos = enabledIndices.indexOf(focusedIndex);
        const prevPos =
          (currentPos - 1 + enabledIndices.length) % enabledIndices.length;
        setFocusedIndex(enabledIndices[prevPos]);
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedIndex(enabledIndices[0]);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusedIndex(enabledIndices[enabledIndices.length - 1]);
      }
    },
    [items, focusedIndex]
  );

  const handleItemClick = useCallback(
    (item: DropdownMenuItem) => {
      if (item.disabled) return;
      item.onClick();
      close();
    },
    [close]
  );

  const alignClass = align === "end" ? styles.alignEnd : styles.alignStart;

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className={`${styles.menu} ${alignClass}`}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => {
            const isDanger = item.variant === "danger";
            const classNames = [
              styles.menuItem,
              isDanger ? styles.menuItemDanger : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={index}
                type="button"
                role="menuitem"
                className={classNames}
                disabled={item.disabled}
                tabIndex={index === focusedIndex ? 0 : -1}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && (
                  <span className={styles.menuItemIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
