import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  CheckCircle2,
  Calendar,
  CreditCard,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Student, PaymentRecord } from '../types';
import { StorageService } from '../services/storageService';

interface PaymentHistoryPageProps {
  currentStudent: Student;
}

export const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = ({ currentStudent }) => {
  const [filter, setFilter] = useState<'all' | 'earnings' | 'spendings'>('all');
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  const allPayments = StorageService.getPayments();

  const userPayments = allPayments.filter((p) => {
    const isLearner = p.learnerId === currentStudent.id;
    const isMentor = p.mentorId === currentStudent.id;

    if (filter === 'earnings') return isMentor;
    if (filter === 'spendings') return isLearner;
    return isLearner || isMentor;
  });

  const filtered = userPayments.filter(
    (p) =>
      p.subject.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      p.learnerName.toLowerCase().includes(search.toLowerCase()) ||
      p.mentorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <Receipt className="w-4 h-4" />
            <span>Financial Records & Receipts</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Payment History & Invoices (₹)
          </h1>
          <p className="text-xs text-slate-500">
            View transaction receipts for sessions attended as a learner and earnings received as a mentor.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {(['all', 'earnings', 'spendings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                filter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Transactions' : tab === 'earnings' ? 'My Earnings (₹)' : 'My Spendings (₹)'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by transaction ID, subject, student name..."
          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Subject & Session</th>
                <th className="px-4 py-3 font-semibold">Peer Counterpart</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Amount (₹)</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No transactions match your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isEarned = item.mentorId === currentStudent.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">
                        {item.transactionId}
                        <div className="text-[10px] text-slate-400">{item.paidAt}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.subject}</div>
                        <div className="text-[11px] text-slate-500">Ref: {item.sessionId}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {isEarned ? (
                          <span>Learner: {item.learnerName}</span>
                        ) : (
                          <span>Mentor: {item.mentorName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{item.paymentMethod}</td>
                      <td className="px-4 py-3.5 font-mono">
                        {isEarned ? (
                          <div className="text-emerald-700 font-bold flex items-center gap-1">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            +₹{item.mentorEarnings}
                            <span className="text-[10px] text-slate-400 font-normal">
                              (Fee: ₹{item.platformFee})
                            </span>
                          </div>
                        ) : (
                          <div className="text-slate-900 font-bold flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                            -₹{item.amount}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">SkillMate Official Payment Receipt</h3>
                <p className="text-[11px] text-slate-500">Student Peer Learning System</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-semibold">{selectedReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono">{selectedReceipt.paidAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Learner:</span>
                <span className="font-semibold">{selectedReceipt.learnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mentor:</span>
                <span className="font-semibold">{selectedReceipt.mentorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold">{selectedReceipt.subject}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-emerald-700">₹{selectedReceipt.amount}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Receipt downloaded for TXN: ${selectedReceipt.transactionId}`)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
