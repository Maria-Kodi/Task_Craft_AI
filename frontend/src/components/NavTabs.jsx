import { Link } from 'react-router-dom';

const TABS = [
  { key: 'board', label: 'Workspace', to: '/dashboard' },
  { key: 'insights', label: 'Insights', to: '/insights' },
  { key: 'calendar', label: 'Calendar', to: '/calendar' },
  { key: 'craft', label: 'Craft AI', to: '/craft' },
];

/**
 * NavTabs — the shared top navigation used across every workspace page.
 * On narrow screens this becomes a horizontally swipeable strip instead
 * of disappearing — every page stays reachable on mobile.
 * Pass `active` as one of: 'board' | 'insights' | 'calendar' | 'craft'.
 */
export default function NavTabs({ active }) {
  return (
    <nav
      className="flex w-full items-center gap-1 overflow-x-auto overscroll-x-contain sm:w-auto sm:overflow-visible"
      style={{ scrollbarWidth: 'none' }}
    >
      {TABS.map((tab) =>
        tab.key === active ? (
          <span
            key={tab.key}
            className="text-[13px] font-medium text-white px-3 py-1.5 rounded-md bg-white/10 whitespace-nowrap shrink-0"
          >
            {tab.label}
          </span>
        ) : (
          <Link
            key={tab.key}
            to={tab.to}
            className="text-[13px] font-medium text-white/60 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
          >
            {tab.label}
          </Link>
        )
      )}
    </nav>
  );
}