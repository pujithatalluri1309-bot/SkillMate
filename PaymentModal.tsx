import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  Smartphone,
  Download,
} from 'lucide-react';
import { LearningSession, PaymentRecord } from '../types';
import { StorageService } from '../services/storageService';

interface PaymentModalProps {
  session: LearningSession;
  onClose: () => void;
  onPaymentSuccess: (payment: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  session,
  onClose,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<PaymentRecord | null>(null);

  const settings = StorageService.getSettings();
  const platformFee = Math.round((session.price * settings.platformCommissionPercent) / 100);
  const mentorEarnings = session.price - platformFee;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const payment = StorageService.processSandboxPayment({
          sessionId: session.id,
          learnerId: session.learnerId,
          mentorId: session.mentorId,
          amount: session.price,
          paymentMethod: method,
        });

        setIsProcessing(false);
        setCompletedPayment(payment);
        onPaymentSuccess(payment);
      } catch (e) {
        setIsProcessing(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                SkillMate Sandbox Checkout
              </h3>
              <p className="text-[11px] text-slate-500">
                Official Student Peer Learning Payment Sandbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {completedPayment ? (
            /* Success Receipt */
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Transaction verified and session booking confirmed.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {completedPayment.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session ID</span>
                  <span className="font-semibold text-slate-800">{session.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject</span>
                  <span className="font-semibold text-slate-800">{session.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mentor</span>
                  <span className="font-semibold text-slate-800">{session.mentorName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-700 font-mono">₹{completedPayment.amount}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>Mentor Credit: ₹{completedPayment.mentorEarnings}</span>
                  <span>Platform Fee ({settings.platformCommissionPercent}%): ₹{completedPayment.platformFee}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => alert(`Receipt downloaded for TXN: ${completedPayment.transactionId}`)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save Receipt
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  View My Sessions
                </button>
              </div>
            </div>
          ) : (
            /* Payment Input Form */
            <div className="space-y-5">
              {/* Session Pricing Summary */}
              <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Session Booking Fee
                  </span>
                  <span className="text-xl font-bold font-mono text-blue-800">₹{session.price}</span>
                </div>
                <div className="text-xs text-blue-900/80 space-y-1">
                  <div className="flex justify-between">
                    <span>Subject / Topic:</span>
                    <span className="font-semibold">{session.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mentor:</span>
                    <span className="font-semibold">{session.mentorName}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-blue-700 border-t border-blue-200/80 pt-1 mt-1">
                    <span>Mentor Share: ₹{mentorEarnings}</span>
                    <span>Platform Fee ({settings.platformCommissionPercent}%): ₹{platformFee}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Choose Payment Method (Test Sandbox)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('UPI')}
                    className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                      method === 'UPI'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('Card')}
                    className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                      method === 'Card'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span>Debit/Credit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('NetBanking')}
                    className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                      method === 'NetBanking'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 text-indigo-600" />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Method specific fields */}
              {method === 'UPI' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700">Enter UPI ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      Verify
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Supports: Google Pay · PhonePe · Paytm · BHIM UPI</span>
                  </div>
                </div>
              )}

              {method === 'Card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Card Number (Simulated)
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="789"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'NetBanking' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700">Select Bank</label>
                  <select className="w-full text-xs p-2.5 rounded-lg border border-slate-300">
                    <option>State Bank of India (SBI)</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Punjab National Bank</option>
                  </select>
                </div>
              )}

              {/* Safety notice */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Development sandbox environment. Real money is not charged. Mentor wallet will be credited automatically.
                </span>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
              >
                {isProcessing ? (
                  <span>Processing ₹{session.price} Sandbox Payment...</span>
                ) : (
                  <>
                    <span>Pay ₹{session.price} & Confirm Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
