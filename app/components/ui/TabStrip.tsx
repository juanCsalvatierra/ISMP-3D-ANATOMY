"use client";
import type { Tab, TabItem } from "../../hooks/useViewerTabs";

type Props = {
  tabs: TabItem[];
  activeTab: Tab;
  onTabChange: (id: Tab) => void;
};

export function TabStrip({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="tab-strip">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.badge && (
            <span
              className="tab-badge"
              style={
                tab.id === "labels"
                  ? { background: "var(--accent)" }
                  : tab.id === "info"
                  ? {
                      background: "transparent",
                      color: "var(--text-muted)",
                      fontSize: "0.5625rem",
                      maxWidth: "4rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                      padding: "0 0.25rem",
                      borderRadius: "0.25rem",
                    }
                  : {}
              }
            >
              {tab.id === "info" && tab.badge && tab.badge.length > 12
                ? tab.badge.slice(0, 12) + "…"
                : tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
