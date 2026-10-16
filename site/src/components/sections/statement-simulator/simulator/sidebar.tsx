"use client";

/**
 * Left sidebar (AppSidebar, simulator-spec §2): header, the five real nav items, Recents and the
 * account footer.
 *
 * The sidebar never changes width in the DOM. It is always 224 wide and sits *under* the main
 * surface; collapsing slides the main surface over it (see ./index.tsx), so every collapsed-state
 * element (logo button, nav icons, avatar) is centred at x = 32 in both states and never moves.
 * Labels fade; in the collapsed rail, nav items show right-side tooltips.
 */
import Image from "next/image";
import { useRef, useState } from "react";
import {
  ChartSpline,
  ChevronRight,
  Globe,
  History,
  House,
  LayoutPanelTop,
  LogOut,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { SIM_NAV_ITEMS, type SimRecentChat, type SimSidebar } from "@/content/simulator/types";
import { cn } from "@/lib/cn";
import { useTooltip } from "./layer";
import styles from "./sim.module.css";

const NAV_ICONS: Record<(typeof SIM_NAV_ITEMS)[number]["lucide"], LucideIcon> = {
  house: House,
  history: History,
  "chart-spline": ChartSpline,
  "layout-panel-top": LayoutPanelTop,
  globe: Globe,
};

const ROW = 36;
const ROW_GAP = 2;
const GROUPS: SimRecentChat["group"][] = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older"];

export interface SidebarProps {
  sidebar: SimSidebar;
  recents: SimRecentChat[];
  activeId: string;
  onPickChat: (id: string) => void;
  /** Visual collapsed state (labels hidden, rail tooltips on). */
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ sidebar, recents, activeId, onPickChat, collapsed, onToggle }: SidebarProps) {
  const [hoverNav, setHoverNav] = useState<number | null>(null);
  const [recentsTab, setRecentsTab] = useState(sidebar.recents_tab);
  const navTip = useTooltip("right", collapsed);
  const toggleTip = useTooltip("right");
  const [logoHot, setLogoHot] = useState(false);
  const activeNav = SIM_NAV_ITEMS.findIndex((n) => n.title === sidebar.active_nav);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);

  // The inactive toggle is inert, so keyboard focus follows the toggle to its counterpart.
  const toggle = () => {
    const active = document.activeElement;
    const hadFocus = active === collapseRef.current || active === expandRef.current;
    onToggle();
    if (hadFocus) requestAnimationFrame(() => (collapsed ? collapseRef : expandRef).current?.focus({ preventScroll: true }));
  };

  const labelFade = cn(
    "transition-[opacity,translate] duration-200 ease-out",
    collapsed ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100 delay-[60ms]",
  );

  return (
    <nav aria-label="App navigation" className="absolute inset-y-0 left-0 flex w-[224px] flex-col px-3 pb-3 pt-3">
      {/* Header (72px in the app; 52 here to align with the header band). */}
      <div className="relative flex h-[44px] shrink-0 items-center">
        <span className={cn("pl-2", labelFade)} aria-hidden={collapsed}>
          {/* Intrinsic size = the displayed size (2208 x 358 source), so next/image serves a ~93px / 2x asset.
              Eager: the frame comes into view by transform, which lazy loading does not always notice.
              Low priority: React does not preload low-priority images, so the page head carries no
              preload for a logo that sits far below the fold. */}
          <Image
            src="/brand/wordmark-ink.png"
            alt="ContHunt"
            width={93}
            height={15}
            loading="eager"
            fetchPriority="low"
            className="h-[15px] w-[93px]"
          />
        </span>
        <button
          type="button"
          ref={collapseRef}
          aria-label="Collapse sidebar"
          aria-expanded={!collapsed}
          // Only the active toggle exists for keyboards and assistive tech.
          inert={collapsed}
          onClick={toggle}
          {...toggleTip.bind("Collapse sidebar")}
          className={cn(
            "absolute right-0 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[8px] text-muted",
            "transition-[background-color,color,opacity] duration-150 hover:bg-paper hover:text-ink",
            "hover:shadow-[0_0_0_1px_rgb(15_15_15/0.06),0_1px_2px_rgb(15_15_15/0.06)]",
            collapsed ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <PanelLeftClose aria-hidden className="size-[17px]" />
        </button>
        {/* Collapsed: the mark swaps to PanelLeft on hover and expands (AppSidebar.tsx:538-545). */}
        <button
          type="button"
          ref={expandRef}
          aria-label="Expand sidebar"
          aria-expanded={!collapsed}
          inert={!collapsed}
          onClick={toggle}
          onPointerEnter={() => setLogoHot(true)}
          onPointerLeave={() => setLogoHot(false)}
          {...(collapsed ? toggleTip.bind("Expand sidebar") : {})}
          className={cn(
            "absolute left-0 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-[10px]",
            "transition-[opacity,background-color] duration-200 hover:bg-paper",
            collapsed ? "opacity-100 delay-100" : "pointer-events-none opacity-0",
          )}
        >
          <span className="relative grid size-5 place-items-center">
            <Image
              src="/brand/icon-ink.png"
              alt=""
              width={20}
              height={20}
              loading="eager"
              fetchPriority="low"
              className={cn("absolute size-5 transition-[opacity,scale] duration-200", logoHot ? "scale-75 opacity-0" : "opacity-100")}
            />
            <PanelLeft
              aria-hidden
              className={cn("absolute size-[17px] text-ink transition-[opacity,scale] duration-200", logoHot ? "opacity-100" : "scale-75 opacity-0")}
            />
          </span>
        </button>
      </div>

      {/* Nav (AppSidebar.tsx:43-49) with a gliding hover highlight (GlideMenu). */}
      <ul className="relative mt-3 flex flex-col" style={{ gap: ROW_GAP }} onPointerLeave={() => setHoverNav(null)}>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 rounded-[8px] bg-ink/[0.045] transition-[translate,opacity,width] duration-200 ease-out",
            hoverNav == null || hoverNav === activeNav ? "opacity-0" : "opacity-100",
          )}
          style={{
            height: ROW,
            width: collapsed ? 40 : "100%",
            translate: `0 ${(hoverNav ?? activeNav) * (ROW + ROW_GAP)}px`,
          }}
        />
        {SIM_NAV_ITEMS.map((item, i) => {
          const Icon = NAV_ICONS[item.lucide];
          const active = i === activeNav;
          return (
            <li key={item.title}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.title : undefined}
                onPointerEnter={() => setHoverNav(i)}
                onFocus={() => setHoverNav(i)}
                {...navTip.bind(item.title)}
                className={cn(
                  "relative flex w-full items-center rounded-[8px] text-left text-[14.5px] font-medium outline-none",
                  "transition-[color,background-color,box-shadow] duration-200 focus-visible:shadow-[0_0_0_2px_var(--accent)]",
                  active
                    ? "bg-paper text-ink shadow-[0_0_0_1px_rgb(15_15_15/0.05),0_1px_2px_rgb(15_15_15/0.07)]"
                    : "text-ink-2 hover:text-ink",
                )}
                style={{ height: ROW }}
              >
                <span className="grid w-10 shrink-0 place-items-center">
                  <Icon aria-hidden className={cn("size-[17px]", active ? "text-ink" : "text-muted")} strokeWidth={1.85} />
                </span>
                <span className={cn("truncate", labelFade)}>{item.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {navTip.node}
      {toggleTip.node}

      {/* Recents (AppSidebar.tsx:575-663), hidden when collapsed. */}
      <div className={cn("mt-7 flex min-h-0 flex-1 flex-col", labelFade)} aria-hidden={collapsed} inert={collapsed}>
        <div className="flex items-center justify-between px-2">
          <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">Recents</p>
          <div
            role="tablist"
            aria-label="Recents"
            className="flex rounded-[7px] bg-ink/[0.05] p-0.5"
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              const next = recentsTab === "chats" ? "boards" : "chats";
              setRecentsTab(next);
              e.currentTarget.querySelector<HTMLElement>(`[data-recents="${next}"]`)?.focus({ preventScroll: true });
            }}
          >
            {(["boards", "chats"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                data-recents={t}
                aria-selected={recentsTab === t}
                tabIndex={recentsTab === t ? 0 : -1}
                onClick={() => setRecentsTab(t)}
                className={cn(
                  "h-[20px] rounded-[5px] px-2 font-mono text-[11.5px] uppercase tracking-[0.04em] transition-[background-color,color,box-shadow] duration-150",
                  recentsTab === t ? "bg-paper text-ink shadow-[0_1px_2px_rgb(15_15_15/0.08)]" : "text-muted hover:text-ink-2",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {recentsTab === "chats" ? (
          recents.length === 0 ? (
            <p className="px-2 pt-3 text-[13.5px] text-muted">No active chats</p>
          ) : (
            <div key="chats" className={cn(styles.enter, "mt-2")}>
              {GROUPS.filter((g) => recents.some((r) => r.group === g)).map((group) => (
                <div key={group} className="mb-2">
                  <p className="px-2 pb-1 pt-1.5 text-[12.5px] text-muted">{group}</p>
                  <ul className="flex flex-col gap-px">
                    {recents
                      .filter((r) => r.group === group)
                      .map((chat) => {
                        const active = chat.id === activeId;
                        return (
                          <li key={chat.id} className="group/recent relative">
                            <button
                              type="button"
                              aria-current={active ? "true" : undefined}
                              onClick={() => onPickChat(chat.id)}
                              className={cn(
                                "flex h-8 w-full items-center gap-2 rounded-[8px] pl-2 pr-12 text-left text-[14px] outline-none transition-colors duration-150",
                                "focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]",
                                active ? "bg-ink/[0.06] text-ink" : "text-ink-2 hover:bg-ink/[0.035] hover:text-ink",
                              )}
                            >
                              <MessageSquare aria-hidden className={cn("size-3.5 shrink-0", active ? "text-ink-2" : "text-faint")} />
                              <span className={cn(styles.fadeRight, "min-w-0 flex-1 whitespace-nowrap")}>{chat.title}</span>
                            </button>
                            <span className="pointer-events-none absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/recent:pointer-events-auto group-hover/recent:opacity-100 group-focus-within/recent:opacity-100">
                              <button type="button" tabIndex={-1} aria-label="Rename chat" className="grid size-5 place-items-center rounded-[5px] text-muted hover:bg-paper hover:text-ink">
                                <Pencil aria-hidden className="size-3" />
                              </button>
                              <button type="button" tabIndex={-1} aria-label="Delete chat" className="grid size-5 place-items-center rounded-[5px] text-muted hover:bg-paper hover:text-ink">
                                <Trash2 aria-hidden className="size-3" />
                              </button>
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </div>
          )
        ) : (
          <p key="boards" className={cn(styles.enter, "px-2 pt-3 text-[13.5px] text-muted")}>
            No boards created
          </p>
        )}

        <button
          type="button"
          className="mt-1 flex h-7 items-center gap-1 self-start rounded-[7px] px-2 text-[13.5px] text-muted transition-colors duration-150 hover:bg-ink/[0.035] hover:text-ink"
        >
          View all
          <ChevronRight aria-hidden className="size-3.5" />
        </button>
      </div>

      {/* Account footer (SidebarUser.tsx:112-133). */}
      <div className="mt-auto flex h-[52px] shrink-0 items-center gap-2.5 border-t border-ink/[0.07] pt-3">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-[14.5px] font-semibold text-paper"
          aria-hidden
          style={{ marginLeft: 4 }}
        >
          {sidebar.account.initial}
        </span>
        <span className={cn("min-w-0 flex-1 leading-tight", labelFade)}>
          <span className="block truncate text-[13.5px] font-semibold text-ink">{sidebar.account.display_name}</span>
          <span className="block truncate text-[11.5px] font-bold uppercase tracking-[0.02em] text-muted">{sidebar.account.plan_label}</span>
        </span>
        <button
          type="button"
          aria-label="Log out"
          inert={collapsed}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-[8px] text-muted transition-[background-color,color,opacity] duration-150 hover:bg-paper hover:text-ink",
            collapsed ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <LogOut aria-hidden className="size-[15px]" />
        </button>
      </div>
    </nav>
  );
}
