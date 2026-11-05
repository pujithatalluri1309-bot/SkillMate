import React, { useState } from 'react';
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Smartphone,
  Send,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Student, PayoutRequest } from '../types';
import { StorageService } from '../services/storageService';

interface EarningsDashboardPageProps {
  currentStudent: Student;
  onNavigate: (tab: string) => void;
}

export const EarningsDashboardPage: React.FC<EarningsDashboardPageProps> = ({
  currentStudent,
  onNavigate,
}) => {
  const [payoutAmount, setPayoutAmount] = useState<number>(200);
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Account'>('UPI');
  const [payoutDetails, setPayoutDetails] = useState('pujitha@okhdfcbank');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const earnings = StorageService.calculateMentorEarnings(currentStudent.id);
  const settings = StorageService.getSettings();
  const allPayouts = StorageService.getPayouts().filter((p) => p.mentorId === currentStudent.id);
  const payments = StorageService.getPayments().filter(
    (p) => p.mentorId === currentStudent.id && p.status === 'Success'
  );

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      StorageService.requestPayout({
        amount: payoutAmount,
        payoutMethod,
        payoutDetails: payoutDetails.trim(),
      });

      setMessage({
        type: 'success',
        text: `Payout request for ₹${payoutAmount} submitted successfully! Admin will process transfer to ${payoutDetails}.`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit payout request.' });
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
          <Wallet className="w-4 h-4" />
          <span>Student Earning System (Requirement 10)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Mentor Earnings & Payout Wallet (₹)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track earned income from completed peer sessions, view platform commission breakdowns, and request withdrawals.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Available Balance</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">
            ₹{earnings.availableBalance}
          </div>
          <span className="text-[10px] text-slate-400">Ready for instant payout withdrawal</span>
        </div>

        {/* Total Net Earnings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Net Earned (Wallet)</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            ₹{earnings.netEarnings}
          </div>
          <span className="text-[10px] text-slate-400">After platform fee ({100 - settings.platformCommissionPercent}%)</span>
        </div>

        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Gross Session Bookings</span>
          <div className="text-2xl font-extrabold font-mono text-blue-600">
            ₹{earnings.grossEarnings}
          </div>
          <span className="text-[10px] text-slate-400">Across {earnings.paidSessionsCount} completed sessions</span>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Transferred Payouts</span>
          <div className="text-2xl font-extrabold font-mono text-indigo-700">
            ₹{earnings.transferredPayouts}
          </div>
          <span className="text-[10px] text-slate-400">
            Pending: ₹{earnings.pendingPayouts}
          </span>
        </div>
      </div>

      {/* Transparent Earning Calculation Formula Card (Requirement 10) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-900 tracking-wider">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Automated Earning Calculation Formula</span>
        </div>
        <p className="text-xs text-blue-900 leading-relaxed">
          SkillMate guarantees transparent calculations. When students enroll in your sessions at your set price:
        </p>

        <div className="p-4 bg-white rounded-xl border border-blue-200/80 text-xs font-mono text-slate-800 space-y-2 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span>Example: Mentor charges ₹100/session × 10 enrolled students:</span>
            <span className="font-bold text-slate-900">₹100 × 10 = ₹1,000 Gross</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Platform Commission ({settings.platformCommissionPercent}% configurable by Admin):</span>
            <span className="text-rose-600">-₹100</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-bold text-emerald-700">
            <span>Mentor Net Earning (Credited to Wallet):</span>
            <span>₹900</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Payout Request Form & Payout History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Request Payout Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
              Request Payout Withdrawal
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700">
              ₹{earnings.availableBalance} Available
            </span>
          </div>

          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Withdrawal Amount in INR (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min={100}
                  max={Math.max(100, earnings.availableBalance)}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full text-xs pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 font-mono font-bold"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Min: ₹100 · Max: Available Balance</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Payout Transfer Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('UPI')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    payoutMethod === 'UPI'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('Bank Account')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    payoutMethod === 'Bank Account'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Bank Account</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {payoutMethod === 'UPI' ? 'UPI Virtual Payment Address (VPA) *' : 'Bank A/C & IFSC *'}
              </label>
              <input
                type="text"
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder={payoutMethod === 'UPI' ? 'e.g. name@okhdfcbank' : 'A/C 1234567890 (IFSC: SBIN000123)'}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={earnings.availableBalance < 100}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Payout Request</span>
            </button>
          </form>
        </div>

        {/* Right: Payout Requests History */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Payout Transfer History ({allPayouts.length})
            </h3>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-blue-600 hover:underline"
            >
              View Payment Receipts
            </button>
          </div>

          {allPayouts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No payout withdrawal requests recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {allPayouts.map((po) => (
                <div
                  key={po.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">₹{po.amount}</span>
                      <span className="text-slate-400">via</span>
                      <span className="font-semibold text-slate-700">{po.payoutMethod}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          po.status === 'Transferred'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-sm">
                      Details: {po.payoutDetails}
                    </p>
                    {po.remarks && (
                      <p className="text-[10px] text-slate-400 italic">{po.remarks}</p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                    {po.requestedAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
