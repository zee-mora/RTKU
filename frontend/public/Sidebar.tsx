import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut, Home, Users, Receipt, TrendingDown, FileBarChart2, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const navItems = [
        { to: '/master/rumah', label: 'Rumah', icon: Home },
        { to: '/master/penghuni', label: 'Penghuni', icon: Users },
        { to: '/master/iuran', label: 'Iuran', icon: Receipt },
        { to: '/master/pengeluaran', label: 'Pengeluaran', icon: TrendingDown },
        { to: '/master/laporan/keuangan', label: 'Laporan Keuangan', icon: FileBarChart2 },
    ];

    return (
        <>
            {/* Mobile overlay backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile hamburger toggle */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="
                    fixed top-4 left-4 z-50 md:hidden
                    flex items-center justify-center
                    h-10 w-10 rounded-xl
                    bg-emerald-600 text-white shadow-lg shadow-emerald-500/30
                    hover:bg-emerald-700 active:scale-95
                    transition-all duration-200
                "
                aria-label="Toggle sidebar"
            >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static z-40 top-0 left-0 h-full
                    flex flex-col
                    border-r border-emerald-100 bg-white/95 backdrop-blur-md shadow-xl
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                    ${isCollapsed ? 'md:w-[72px]' : 'w-64'}
                `}
                style={{ minHeight: '100vh' }}
            >
                {/* Desktop collapse toggle button — sits on the edge */}
                <button
                    onClick={() => setIsCollapsed(prev => !prev)}
                    className="
                        hidden md:flex
                        absolute -right-3 top-6
                        items-center justify-center
                        h-6 w-6 rounded-full
                        bg-emerald-600 text-white shadow-md shadow-emerald-400/40
                        hover:bg-emerald-700 hover:scale-110
                        active:scale-95
                        transition-all duration-200
                        z-10
                    "
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft
                        size={14}
                        className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
                    />
                </button>

                {/* Header / profile */}
                <div className={`
                    flex items-center gap-3 mx-3 mt-4 mb-2 px-3 py-3 rounded-xl
                    bg-emerald-50 border border-emerald-100
                    transition-all duration-300
                    ${isCollapsed ? 'justify-center px-2' : ''}
                `}>
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-emerald-200 ring-2 ring-white shadow-sm">
                        <img
                            src={user?.avatar || '/avatar.jpg'}
                            alt={user?.name || 'User'}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-emerald-900 leading-tight">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-emerald-500 font-medium">Admin</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 mt-2 space-y-0.5 overflow-y-auto">
                    {/* Dashboard */}
                    <NavLink
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                            transition-all duration-150
                            ${isCollapsed ? 'justify-center' : ''}
                            ${isActive
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                                : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900'
                            }
                        `}
                        title={isCollapsed ? 'Dashboard' : undefined}
                    >
                        <LayoutDashboard size={18} className="flex-shrink-0" />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>

                    {/* Section header */}
                    {!isCollapsed && (
                        <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                            Pengelolaan
                        </p>
                    )}
                    {isCollapsed && (
                        <div className="my-2 mx-3 border-t border-emerald-100" />
                    )}

                    {/* Sub-nav items */}
                    <div className={`space-y-0.5 ${!isCollapsed ? 'pl-2' : ''}`}>
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                    transition-all duration-150
                                    ${isCollapsed ? 'justify-center' : ''}
                                    ${isActive
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                                        : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900'
                                    }
                                `}
                                title={isCollapsed ? label : undefined}
                            >
                                <Icon size={16} className="flex-shrink-0" />
                                {!isCollapsed && <span>{label}</span>}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Footer / logout */}
                <div className="px-3 pb-4 pt-2 border-t border-emerald-100">
                    <button
                        type="button"
                        onClick={logout}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                            text-red-500 hover:bg-red-50 hover:text-red-600
                            transition-all duration-150 active:scale-[0.98]
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
