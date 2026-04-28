import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const linkBase = 'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <aside className="hidden md:flex md:w-64 shrink-0 border-r border-emerald-100 bg-white/90 backdrop-blur-md p-4 flex-col">
            {/* profile section */}
            <div className="flex flex-col items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-emerald-800 bg-emerald-100">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-emerald-200 ring-2 ring-white">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user?.name || 'User'}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <img
                            src="/avatar.jpg"
                            alt="Default Avatar"
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                <div className="text-center min-w-0">
                    <p className="truncate font-bold leading-tight">{user?.name || 'User'}</p>
                </div>
            </div>

            <nav className="space-y-1 mt-4">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `${linkBase} ${isActive ? 'bg-emerald-600 text-white' : 'text-emerald-800 hover:bg-emerald-50'}`
                    }
                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>
            </nav>

            <div className="mt-auto pt-4 border-t border-emerald-100">
                <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
