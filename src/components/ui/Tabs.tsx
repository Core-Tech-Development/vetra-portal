import { createContext, useContext, useRef, useCallback } from "react";
import type { ReactNode, KeyboardEvent } from "react";
import styles from "./Tabs.module.css";

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext(): TabsContextType {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs compound components must be used within <Tabs>");
  }
  return ctx;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ value, onChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={styles.tabs}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
}

export function TabList({ children }: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list) return;

    const tabs = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex = -1;

    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex >= 0) {
      e.preventDefault();
      tabs[nextIndex].focus();
    }
  }, []);

  return (
    <div
      ref={listRef}
      role="tablist"
      className={styles.tabList}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps) {
  const { value: activeValue, onChange } = useTabsContext();
  const isActive = value === activeValue;

  const classNames = [styles.tab, isActive ? styles.tabActive : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      role="tab"
      type="button"
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive}
      className={classNames}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  activeValue: string;
  children: ReactNode;
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
  if (value !== activeValue) return null;

  return (
    <div role="tabpanel" className={styles.tabPanel}>
      {children}
    </div>
  );
}
