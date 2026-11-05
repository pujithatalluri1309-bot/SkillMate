import React from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  DollarSign,
  Video,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Code,
  Database,
  Award,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';
import { POPULAR_CATEGORIES } from '../data/mockData';

interface HomePageProps {
  currentStudent: Student;
  onNavigate: (tab: string) => void;
  onSelectMentor: (mentor: Student) => void;
  onWatchVideo: (mentor: Student) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentStudent,
  onNavigate,
  onSelectMentor,
  onWatchVideo,
}) => {
  const allStudents = StorageService.getStudents();
  const mentors = allStudents.filter((s) => s.isMentor && s.status === 'Active');
  const allSessions = StorageService.getSessions();
  const completedSessions = allSessions.filter((s) => s.status === 'Completed').length;
  const allSkills = StorageService.getSkills();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>The Student-to-Student Learning Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Learn Together. <br />
                <span className="text-blue-600">Teach Together.</span> <br />
                Earn Together.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connect with verified college peers who excel in subjects and programming languages.
                Evaluate their teaching skills through short <strong>demonstration videos</strong>, book 1-on-1
                interactive sessions, and earn money by teaching what you know.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('find-mentors')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Find a Peer Mentor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('skills')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Become a Mentor & Earn</span>
                </button>
              </div>

              {/* Trust & Metric Strips */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {mentors.length}+
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Verified Mentors</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {allSkills.length}+
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Subjects & Skills</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {completedSessions + 18}+
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Sessions Completed</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-4/3 group">
                <img
                  src="/src/assets/images/hero_skillmate_learning_1793881608981.jpg"
                  alt="Students collaborating and peer tutoring in university lab"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>Peer Teaching Demonstration</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Video-Based Teaching Evaluation System
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Watch mentors explain real code and algorithms before booking your session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Value Pillars: Learn, Teach, Earn */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How SkillMate Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A complete ecosystem empowering college students to share knowledge, improve grades, and earn in Indian Rupees (₹).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Learn */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Learn from Top Peers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find classmates and seniors who have already aced your subjects. Get tailored 1-on-1 help
              on challenging assignments, semester lab exams, and coding viva.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Watch 2-5 min teaching demo videos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Filter by price in ₹ and genuine ratings</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Teach */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Teach What You Know</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every student can act as a mentor. Upload a short teaching demo video, register your
              proficient skills (Python, DBMS, Java), and set your own hourly session rates.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>5-criteria teaching rubric evaluation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Interactive live virtual classroom with whiteboard</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Earn */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Earn While Studying</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn money for every completed session. Transparent calculation: if you charge ₹100 per
              session and teach 10 students, you earn ₹1,000 gross. Withdraw directly to UPI or bank account.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant automated wallet credits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fast payout requests to your UPI ID</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Teaching Demonstration Video Feature Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 text-blue-300 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Special Platform Innovation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Video-Based Teaching Evaluation Framework
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Many students know a subject but struggle to explain it clearly. To solve this, SkillMate
                requires mentors to submit a 2–5 minute teaching demo video. Peers evaluate mentors
                across 5 structured pedagogical criteria:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-blue-400">1. Subject Knowledge</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Depth & conceptual accuracy</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-blue-400">2. Communication</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Pacing, tone & articulation</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-blue-400">3. Explanation Clarity</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Simplification of hard topics</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-blue-400">4. Confidence</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Command of technical viva</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-blue-400">5. Practical Examples</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Code execution & diagrams</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('teaching-video')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Explore Demo Videos & Rubrics
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl aspect-video group">
                <img
                  src="/src/assets/images/demo_video_thumbnail_algo_1793881609226.jpg"
                  alt="Student teaching Binary Search Trees demo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition">
                  <button
                    onClick={() => {
                      const sampleMentor = mentors[0] || allStudents[0];
                      onWatchVideo(sampleMentor);
                    }}
                    className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition transform group-hover:scale-105"
                  >
                    <Video className="w-6 h-6 ml-0.5" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded bg-black/70 backdrop-blur-xs text-xs font-semibold text-white">
                  Preview BST Insertion Demo (3.5 mins)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Student Mentors</h2>
            <p className="text-xs text-slate-500 mt-1">
              Top-rated peer tutors evaluated by student feedback and video reviews.
            </p>
          </div>
          <button
            onClick={() => onNavigate('find-mentors')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Mentors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.slice(0, 4).map((m) => {
            const skills = StorageService.getSkillsByStudent(m.id);
            const stats = StorageService.getMentorStats(m.id);
            const video = StorageService.getVideoByStudent(m.id);
            const primarySkill = skills[0];

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <img
                      src={m.avatarUrl}
                      alt={m.fullName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{stats.rating}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{m.fullName}</h3>
                    <p className="text-xs text-slate-500">{m.department}</p>
                    <p className="text-[11px] text-blue-600 font-medium">{m.yearOfStudy}</p>
                  </div>

                  {primarySkill && (
                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-slate-800 truncate">{primarySkill.skillName}</div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Level: {primarySkill.level}</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          ₹{primarySkill.pricePerSession}/hr
                        </span>
                      </div>
                    </div>
                  )}

                  {video && (
                    <button
                      onClick={() => onWatchVideo(m)}
                      className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>Watch Demo Video ({video.durationMinutes}m)</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectMentor(m)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Choose Mentor
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Subject Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Subjects & Topics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse peer tutoring across core engineering, computer science, and placements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('find-mentors')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer space-y-2.5"
            >
              <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{cat.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cat.popularTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DBMS Project Architecture Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
              <Database className="w-4 h-4" />
              <span>College DBMS Project Defense & Presentation Ready</span>
            </div>
            <h3 className="text-lg font-bold">12 Relational Tables, ACID Stored Procedures & ER Diagram</h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Includes full MySQL DDL scripts, constraints (PK/FK/CHECK), indexes, database views,
              complex SQL queries (JOIN, GROUP BY, HAVING), and sample data for your viva presentation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('database-studio')}
            className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-xl whitespace-nowrap transition shadow-xs"
          >
            Launch MySQL Studio
          </button>
        </div>
      </section>
    </div>
  );
};
