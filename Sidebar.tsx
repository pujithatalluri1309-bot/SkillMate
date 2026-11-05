import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  Inbox,
  Calendar,
  Wallet,
  Receipt,
  History,
  Star,
  Shield,
  Database,
  FileCode,
  UserCheck,
  PlusCircle,
  Home,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';

interface SidebarProps {
  currentStudent: Student;
  activeTab: string;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentStudent,
  activeTab,
  onNavigate,
  isAdmin,
}) => {
  const requests = StorageService.getRequests();
  const pendingIncoming = requests.filter(
    (r) => r.mentorId === currentStudent.id && r.status === 'Pending'
  ).length;

  const sessions = StorageService.getSessions();
  const upcomingCount = sessions.filter(
    (s) => (s.learnerId === currentStudent.id || s.mentorId === currentStudent.id) && s.status === 'Scheduled'
  ).length;

  const studentSkills = StorageService.getSkillsByStudent(currentStudent.id);
  const hasDemoVideo = Boolean(StorageService.getVideoByStudent(currentStudent.id));

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'home', label: 'Platform Home', icon: Home },
        { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Student Profile', icon: UserCheck },
      ],
    },
    {
      group: 'Peer Learning',
      items: [
        { id: 'find-mentors', label: 'Find Mentors', icon: Users },
        {
          id: 'sessions',
          label: 'Scheduled Sessions',
          icon: Calendar,
          badge: upcomingCount > 0 ? `${upcomingCount}` : undefined,
        },
        { id: 'history', label: 'Learning History', icon: History },
        { id: 'feedback', label: 'Feedback & Reviews', icon: Star },
      ],
    },
    {
      group: 'Teaching & Mentoring',
      items: [
        {
          id: 'skills',
          label: 'My Skills & Pricing',
          icon: BookOpen,
          badge: studentSkills.length > 0 ? `${studentSkills.length}` : undefined,
        },
        {
          id: 'teaching-video',
          label: 'Teaching Demo Video',
          icon: Video,
          badge: hasDemoVideo ? 'Active' : 'Required',
          badgeColor: hasDemoVideo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
        },
        {
          id: 'requests',
          label: 'Learning Requests',
          icon: Inbox,
          badge: pendingIncoming > 0 ? `${pendingIncoming}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'earnings', label: 'Earnings & Wallet (₹)', icon: Wallet },
        { id: 'payments', label: 'Payment Receipts', icon: Receipt },
      ],
    },
    {
      group: 'DBMS Project Deliverables',
      items: [
        { id: 'database-studio', label: 'MySQL Schema & ER', icon: Database },
        { id: 'api-docs', label: 'REST APIs & Viva Guide', icon: FileCode },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: Shield }] : []),
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Student Badge Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <img
            src={currentStudent.avatarUrl}
            alt={currentStudent.fullName}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover border border-slate-200"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
              {currentStudent.fullName}
            </h4>
            <div className="text-[11px] text-slate-500 truncate">{currentStudent.department}</div>
            <div className="flex items-center gap-2 text-[10px] text-blue-600 font-medium mt-0.5">
              <span>{currentStudent.yearOfStudy}</span>
              <span>·</span>
              <span>{currentStudent.isMentor ? 'Mentor' : 'Learner'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((grp) => (
          <div key={grp.group}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
              {grp.group}
            </div>
            <div className="space-y-0.5">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => onNavigate('skills')}
          className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1.5 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Skill to Teach</span>
        </button>
      </div>
    </aside>
  );
};
