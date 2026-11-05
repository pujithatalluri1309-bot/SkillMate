import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Video,
  Calendar,
  Wallet,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Play,
  Search,
  Filter,
  Check,
  X,
  Upload,
  UserCheck,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';
import { POPULAR_CATEGORIES } from '../data/mockData';

interface DashboardPageProps {
  currentStudent: Student;
  currentRole: 'student' | 'mentor' | 'admin';
  onNavigate: (tab: string) => void;
  onSelectMentor: (mentor: Student) => void;
  onWatchVideo: (mentor: Student) => void;
  onStartSession: (session: any) => void;
  onSwitchRole: (role: 'student' | 'mentor') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentStudent,
  currentRole,
  onNavigate,
  onSelectMentor,
  onWatchVideo,
  onStartSession,
  onSwitchRole,
}) => {
  const [activeView, setActiveView] = useState<'student' | 'mentor'>(
    currentRole === 'mentor' ? 'mentor' : 'student'
  );

  // Student Search & Category filter state
  const [searchMentorQuery, setSearchMentorQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const earnings = StorageService.calculateMentorEarnings(currentStudent.id);
  const mentorStats = StorageService.getMentorStats(currentStudent.id);
  const studentSkills = StorageService.getSkillsByStudent(currentStudent.id);
  const mentorVideo = StorageService.getVideoByStudent(currentStudent.id);

  const allSessions = StorageService.getSessions();
  const learningSessions = allSessions.filter((s) => s.learnerId === currentStudent.id);
  const teachingSessions = allSessions.filter((s) => s.mentorId === currentStudent.id);

  const upcomingLearning = learningSessions.filter((s) => s.status === 'Scheduled');
  const upcomingTeaching = teachingSessions.filter((s) => s.status === 'Scheduled');

  const allRequests = StorageService.getRequests();
  const incomingRequests = allRequests.filter((r) => r.mentorId === currentStudent.id);
  const pendingIncoming = incomingRequests.filter((r) => r.status === 'Pending');
  const sentRequests = allRequests.filter((r) => r.learnerId === currentStudent.id);

  const allStudents = StorageService.getStudents();
  const availableMentors = allStudents
    .filter((s) => s.isMentor && s.id !== currentStudent.id && s.status === 'Active')
    .filter((m) => {
      const skills = StorageService.getSkillsByStudent(m.id);
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchMentorQuery.toLowerCase()) ||
        skills.some((sk) => sk.skillName.toLowerCase().includes(searchMentorQuery.toLowerCase()));
      const matchesCat =
        selectedCategory === 'All' ||
        skills.some((sk) => sk.category === selectedCategory);
      return matchesSearch && matchesCat;
    });

  const handleAcceptRequest = (requestId: string) => {
    StorageService.updateRequestStatus(requestId, 'Accepted');
    alert('Mentorship request accepted! Scheduled session created.');
  };

  const handleRejectRequest = (requestId: string) => {
    StorageService.updateRequestStatus(requestId, 'Rejected', 'Mentor is unavailable at requested slot.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Role Switcher */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
            <span>{currentStudent.department}</span>
            <span>·</span>
            <span>{currentStudent.yearOfStudy}</span>
            <span>·</span>
            <span className="capitalize">{activeView} Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentStudent.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {activeView === 'student'
              ? 'Find mentors, evaluate teaching demo videos, and manage your booked learning sessions.'
              : 'Manage your teaching profile, upload demonstration videos, accept student requests, and track earnings.'}
          </p>
        </div>

        {/* Dashboard View Switcher Button */}
        <div className="bg-blue-900/40 p-1.5 rounded-2xl border border-white/20 backdrop-blur-xs flex items-center shrink-0">
          <button
            onClick={() => {
              setActiveView('student');
              onSwitchRole('student');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeView === 'student'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-white hover:text-blue-100'
            }`}
          >
            Student Dashboard
          </button>
          <button
            onClick={() => {
              setActiveView('mentor');
              onSwitchRole('mentor');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeView === 'mentor'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-white hover:text-blue-100'
            }`}
          >
            Mentor Dashboard
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STUDENT DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeView === 'student' && (
        <div className="space-y-8">
          {/* Quick Metrics for Learner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => onNavigate('sessions')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer space-y-1"
            >
              <span className="text-[11px] font-bold uppercase text-slate-400">Scheduled Sessions</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">{upcomingLearning.length}</div>
              <span className="text-xs text-blue-600 font-semibold">Join Virtual Classroom</span>
            </div>

            <div
              onClick={() => onNavigate('requests')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer space-y-1"
            >
              <span className="text-[11px] font-bold uppercase text-slate-400">Sent Mentorship Requests</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">{sentRequests.length}</div>
              <span className="text-xs text-slate-500">
                {sentRequests.filter((r) => r.status === 'Accepted').length} Accepted · {sentRequests.filter((r) => r.status === 'Pending').length} Pending
              </span>
            </div>

            <div
              onClick={() => onNavigate('history')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer space-y-1"
            >
              <span className="text-[11px] font-bold uppercase text-slate-400">Completed Sessions</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                {learningSessions.filter((s) => s.status === 'Completed').length}
              </div>
              <span className="text-xs text-emerald-600 font-semibold">View Learning History</span>
            </div>
          </div>

          {/* Mentor Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  Find a Peer Mentor
                </h3>
                <p className="text-xs text-slate-500">
                  Search by name or subject, watch teaching demonstration videos, and send requests.
                </p>
              </div>

              <button
                onClick={() => onNavigate('find-mentors')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Browse Full Catalog →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchMentorQuery}
                  onChange={(e) => setSearchMentorQuery(e.target.value)}
                  placeholder="Search mentors by name, subject (e.g. Python, DBMS, Java, DSA)..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="All">All Categories</option>
                  <option value="Computer Science Core">Computer Science Core</option>
                  <option value="Programming & Languages">Programming & Languages</option>
                  <option value="AI, ML & Data Science">AI & Data Science</option>
                </select>
              </div>
            </div>

            {/* Mentor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {availableMentors.slice(0, 3).map((m) => {
                const skills = StorageService.getSkillsByStudent(m.id);
                const stats = StorageService.getMentorStats(m.id);
                const video = StorageService.getVideoByStudent(m.id);

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.fullName}</h4>
                            <p className="text-[11px] text-slate-500">{m.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{stats.rating}</span>
                        </div>
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-slate-100 text-xs flex justify-between">
                        <span className="font-semibold text-slate-800 truncate">
                          {skills[0]?.skillName || 'Programming'}
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          ₹{skills[0]?.pricePerSession || 150}/hr
                        </span>
                      </div>

                      {video && (
                        <button
                          onClick={() => onWatchVideo(m)}
                          className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          <span>Watch Teaching Demo Video ({video.durationMinutes}m)</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectMentor(m)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                    >
                      Select Mentor
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Mentorship Requests Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                My Sent Mentorship Requests & Status
              </h3>
              <button
                onClick={() => onNavigate('requests')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View Details
              </button>
            </div>

            {sentRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                You haven't sent any mentorship requests yet. Select a mentor above to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.subject}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">Mentor: {req.mentorName}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5 line-clamp-1">{req.topicRequirements}</p>
                      <span className="text-[11px] text-slate-400 font-mono">
                        📅 {req.preferredDate} at {req.preferredTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          req.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="font-mono font-bold text-emerald-700">₹{req.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENTOR DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeView === 'mentor' && (
        <div className="space-y-8">
          {/* Mentor Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigate('earnings')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase">Total Earnings (₹)</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-700">₹{earnings.netEarnings}</div>
              <span className="text-[10px] text-slate-400">Net after 10% platform fee</span>
            </div>

            <div
              onClick={() => onNavigate('earnings')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase">Available Balance</span>
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900">₹{earnings.availableBalance}</div>
              <span className="text-[10px] text-blue-600 font-semibold">Ready for UPI withdrawal</span>
            </div>

            <div
              onClick={() => onNavigate('requests')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase">Pending Requests</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-600">{pendingIncoming.length}</div>
              <span className="text-[10px] text-slate-400">{incomingRequests.length} total received</span>
            </div>

            <div
              onClick={() => onNavigate('feedback')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase">Teaching Rating</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                {mentorStats.rating} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
              <span className="text-[10px] text-slate-400">{mentorStats.reviewCount} student evaluations</span>
            </div>
          </div>

          {/* Pending Student Requests with Accept / Reject (Requirement 4 & 6) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Student Mentorship Requests ({pendingIncoming.length} Pending)
                </h3>
                <p className="text-xs text-slate-500">
                  Students requesting 1-on-1 peer learning sessions with you.
                </p>
              </div>
              <button
                onClick={() => onNavigate('requests')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            {pendingIncoming.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No pending mentorship requests currently.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingIncoming.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.subject}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-blue-700">{req.learnerName}</span>
                        <span className="text-slate-400">({req.learnerEmail})</span>
                      </div>
                      <p className="text-slate-600">{req.topicRequirements}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>📅 {req.preferredDate}</span>
                        <span>⏰ {req.preferredTime}</span>
                        <span className="font-bold text-emerald-700">Fee: ₹{req.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two Columns: Teaching Demo Video & Registered Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Teaching Demonstration Video (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    Teaching Demonstration Video
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your 2–5 min demonstration video shown to prospective learners.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('teaching-video')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {mentorVideo ? 'Manage' : 'Upload'}
                </button>
              </div>

              {mentorVideo ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 group">
                    <img
                      src={mentorVideo.thumbnailUrl}
                      alt={mentorVideo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button
                        onClick={() => onWatchVideo(currentStudent)}
                        className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
                      >
                        <Play className="w-5 h-5 ml-0.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
                      {mentorVideo.durationMinutes} min
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{mentorVideo.title}</h4>
                    <p className="text-[11px] text-slate-500">{mentorVideo.subject}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2 bg-amber-50 rounded-xl border border-amber-200">
                  <Video className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="text-xs font-bold text-amber-900">Upload Your Teaching Demo</h4>
                  <p className="text-[11px] text-amber-800">
                    Upload an MP4 clip to prove pedagogical clarity and get student bookings.
                  </p>
                  <button
                    onClick={() => onNavigate('teaching-video')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    Upload Video File
                  </button>
                </div>
              )}
            </div>

            {/* Right: Registered Teaching Skills (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    My Teaching Skills & Fees
                  </h3>
                  <p className="text-xs text-slate-500">Skills you teach and your hourly pricing in INR (₹).</p>
                </div>
                <button
                  onClick={() => onNavigate('skills')}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Skill
                </button>
              </div>

              {studentSkills.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No skills registered yet. Add subjects to start earning!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentSkills.map((sk) => (
                    <div
                      key={sk.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{sk.skillName}</div>
                        <div className="text-[11px] text-slate-500">Level: {sk.level}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700">₹{sk.pricePerSession}/hr</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
