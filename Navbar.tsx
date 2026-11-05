import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  ChevronDown,
  User,
  Shield,
  RefreshCw,
  Video,
  Database,
  DollarSign,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  currentStudent: Student;
  allStudents: Student[];
  onSelectStudent: (id: string) => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  allStudents,
  onSelectStudent,
  activeTab,
  onNavigate,
  isAdmin,
  onToggleAdmin,
  onResetData,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifications = StorageService.getNotifications(currentStudent.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead(currentStudent.id);
    setShowNotifMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group transition"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                SkillMate
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Peer Learning & Earning
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4–5 single-line clean nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('find-mentors')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'find-mentors' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Find Mentors
          </button>
          <button
            onClick={() => onNavigate('teaching-video')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'teaching-video' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-blue-600" />
            Teaching Demos
          </button>
          <button
            onClick={() => onNavigate('sessions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'sessions' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            My Sessions
          </button>
          <button
            onClick={() => onNavigate('earnings')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1 ${
              activeTab === 'earnings' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Earnings (₹)
          </button>
          <button
            onClick={() => onNavigate('database-studio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'database-studio' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            MySQL Studio
          </button>
        </nav>

        {/* Zone 3: Primary Action & User Profile controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notifications ({notifications.length})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          StorageService.markNotificationAsRead(n.id);
                          if (n.actionUrl) onNavigate(n.actionUrl);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                          !n.read ? 'bg-blue-50/50 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {n.createdAt.split(' ')[1] || 'Just now'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Account Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-left"
            >
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.fullName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentStudent.fullName}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {isAdmin ? 'Admin Mode' : currentStudent.isMentor ? 'Mentor & Learner' : 'Learner'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{currentStudent.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentStudent.collegeEmail}</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">
                    ID: {currentStudent.id} · {currentStudent.department}
                  </p>
                </div>

                <div className="px-2 py-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Switch Test Student Profile
                  </div>
                  {allStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectStudent(s.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition text-left ${
                        s.id === currentStudent.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={s.avatarUrl}
                          alt={s.fullName}
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="truncate max-w-[140px]">{s.fullName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {s.isMentor ? 'Mentor' : 'Learner'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-1.5 px-2">
                  <button
                    onClick={() => {
                      onToggleAdmin();
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition text-left ${
                      isAdmin ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>{isAdmin ? 'Exit Admin Mode' : 'Switch to Admin Console'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('register');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition text-left"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Register New Student Account</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Reset database to initial demo state? All local modifications will be restored.')) {
                        onResetData();
                        setShowUserMenu(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition text-left"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Demo Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-xs whitespace-nowrap shrink-0"
          >
            My Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};
