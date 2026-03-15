"use client";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  active: string;
  onNavigate: (id: string) => void;
  onLogout?: () => void;
};

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-.75m16.5-13.5v.75A2.25 2.25 0 0118 6.75H6A2.25 2.25 0 013.75 4.5V3.75M21.75 12v.75A2.25 2.25 0 0119.5 15H4.5A2.25 2.25 0 012.25 12.75V12" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview",   label: "Overview",        icon: <GridIcon /> },
  { id: "assets",     label: "Asset Inventory", icon: <ServerIcon /> },
  { id: "risks",      label: "Risk Register",   icon: <ClipboardIcon /> },
  { id: "settings",   label: "Settings",        icon: <CogIcon /> },
];

export default function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="flex md:flex-col w-full md:w-64 md:min-h-screen bg-white/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-slate-200 shrink-0">
      {/* Brand */}
      <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-slate-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-600 text-white">
          <ShieldIcon />
        </div>
        <div className="leading-none">
          <p className="text-sm font-semibold text-slate-900">RiskGuard</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">ISO 27005</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex md:block px-2 md:px-3 py-2 md:py-4 space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full md:w-full flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap
                transition-all duration-150 text-left
                ${isActive
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              <span className={isActive ? "text-white" : "text-slate-500"}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="hidden md:block px-5 py-4 border-t border-slate-200">
        {onLogout && (
          <button
            onClick={onLogout}
            className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-700 px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
          >
            Sign Out
          </button>
        )}
        <p className="text-[11px] text-slate-500 leading-relaxed">
          BSc.I.T. · Mumbai University<br />
          NEP 2020 · GRC Project
        </p>
      </div>
    </aside>
  );
}
