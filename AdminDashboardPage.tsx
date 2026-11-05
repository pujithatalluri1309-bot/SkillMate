import React, { useState } from 'react';
import {
  Shield,
  Users,
  Video,
  DollarSign,
  TrendingUp,
  Settings,
  CheckCircle2,
  XCircle,
  Sliders,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'videos' | 'payouts' | 'settings'>('overview');

  const allStudents = StorageService.getStudents();
  const allVideos = StorageService.getVideos();
  const allSessions = StorageService.getSessions();
  const allRequests = StorageService.getRequests();
  const allPayments = StorageService.getPayments();
  const allPayouts = StorageService.getPayouts();
  const allSkills = StorageService.getSkills();
  const settings = StorageService.getSettings();

  const [commissionPct, setCommissionPct] = useState(settings.platformCommissionPercent);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Calculations
  const totalStudents = allStudents.length;
  const totalMentors = allStudents.filter((s) => s.isMentor).length;
  const completedSessions = allSessions.filter((s) => s.status === 'Completed').length;
  const totalGrossRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPlatformRevenue = allPayments.reduce((sum, p) => sum + p.platformFee, 0);

  const handleToggleStudentStatus = (studentId: string) => {
    const student = StorageService.getStudentById(studentId);
    if (student) {
      student.status = student.status === 'Active' ? 'Suspended' : 'Active';
      StorageService.saveStudent(student);
      alert(`Student ${student.fullName} status updated to ${student.status}.`);
    }
  };

  const handleApprovePayout = (payoutId: string) => {
    try {
      StorageService.updatePayoutStatus(
        payoutId,
        'Transferred',
        `Transferred by Admin via IMPS on ${new Date().toISOString().split('T')[0]}.`
      );
      alert('Payout approved and marked as transferred to mentor account!');
    } catch (err: any) {
      alert(err.message || 'Failed to update payout.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings({
      platformCommissionPercent: Number(commissionPct),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
            <Shield className="w-4 h-4" />
            <span>Campus Administrator Panel (Requirement 13)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            SkillMate Platform Governance
          </h1>
          <p className="text-xs text-slate-500">
            Monitor platform health, verify students, review demo videos, and manage INR revenue & payouts.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {(['overview', 'students', 'videos', 'payouts', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Registered Students</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{totalStudents}</div>
              <span className="text-xs text-blue-600 font-semibold">{totalMentors} Active Mentors</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Completed Sessions</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{completedSessions}</div>
              <span className="text-xs text-emerald-600 font-semibold">{allRequests.length} Total Requests</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Platform Revenue</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-700">₹{totalPlatformRevenue}</div>
              <span className="text-xs text-slate-400">Gross Bookings: ₹{totalGrossRevenue}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Teaching Videos Uploaded</span>
              <div className="text-3xl font-extrabold font-mono text-indigo-700">{allVideos.length}</div>
              <span className="text-xs text-slate-400">Verified & active</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Registered Skills Catalog</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{allSkills.length}</div>
              <span className="text-xs text-slate-400">Across 6 academic domains</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Configured Commission</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{settings.platformCommissionPercent}%</div>
              <span className="text-xs text-blue-600 font-semibold">90% net to student mentors</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Student Account Management</h3>
            <span className="text-xs text-slate-500">{allStudents.length} students enrolled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student ID</th>
                  <th className="px-4 py-3 font-semibold">Full Name & Email</th>
                  <th className="px-4 py-3 font-semibold">Department & Year</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-600">{s.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      <div className="text-slate-400">{s.collegeEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.department} · {s.yearOfStudy}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700">
                        {s.isMentor ? 'Mentor & Learner' : 'Learner'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStudentStatus(s.id)}
                        className="px-2.5 py-1 rounded text-xs font-semibold hover:bg-slate-100 transition"
                      >
                        {s.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Mentor Teaching Video Moderation</h3>
          <p className="text-xs text-slate-500">
            Review uploaded teaching demonstration videos submitted by aspiring student mentors.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allVideos.map((v) => (
              <div key={v.id} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">{v.title}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {v.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Subject: {v.subject} · Duration: {v.durationMinutes} min
                </div>
                <div className="text-[11px] text-slate-400">
                  {v.evaluations.length} Peer Rubric Reviews
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Mentor Payout Approvals & Disbursement</h3>
            <span className="text-xs text-slate-500">{allPayouts.length} total payout requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Payout ID</th>
                  <th className="px-4 py-3 font-semibold">Mentor</th>
                  <th className="px-4 py-3 font-semibold">Amount (₹)</th>
                  <th className="px-4 py-3 font-semibold">Transfer Details</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPayouts.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-600">{po.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{po.mentorName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">₹{po.amount}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {po.payoutMethod}: {po.payoutDetails}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          po.status === 'Transferred'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {po.status === 'Pending' ? (
                        <button
                          onClick={() => handleApprovePayout(po.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                        >
                          Approve & Transfer
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Platform Commission & Financial Settings (Requirement 10 & 13)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Configure the percentage retained by the campus platform to maintain infrastructure and student lab equipment.
          </p>

          {settingsSaved && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved! Active commission updated.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Platform Commission Rate</span>
                <span className="font-mono text-blue-600 font-bold">{commissionPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={commissionPct}
                onChange={(e) => setCommissionPct(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Zero Fee)</span>
                <span>Mentor keeps {100 - commissionPct}% net</span>
                <span>25% Max</span>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Save Platform Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
