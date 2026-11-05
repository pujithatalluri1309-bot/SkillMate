export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';

export type SessionStatus = 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';

export type PayoutStatus = 'Pending' | 'Approved' | 'Transferred' | 'Rejected';

export interface Student {
  id: string; // e.g., 'STU-2024-001'
  fullName: string;
  collegeEmail: string;
  phone: string;
  department: string;
  yearOfStudy: string; // '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
  avatarUrl: string;
  bio: string;
  isMentor: boolean;
  isVerified: boolean;
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  popularTopics: string[];
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillName: string;
  category: string;
  level: SkillLevel;
  pricePerSession: number; // in INR (₹)
  description: string;
  yearsExperience: string;
  createdAt: string;
}

export interface VideoEvaluation {
  id: string;
  videoId: string;
  studentId: string;
  studentName: string;
  subjectKnowledge: number; // 1 to 5
  communicationSkills: number; // 1 to 5
  explanationClarity: number; // 1 to 5
  confidence: number; // 1 to 5
  practicalExamples: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface MentorVideo {
  id: string;
  studentId: string;
  subject: string;
  title: string;
  videoUrl: string; // file path or URL
  thumbnailUrl: string;
  durationMinutes: number;
  uploadedAt: string;
  status: 'Active' | 'Under Review' | 'Flagged';
  evaluations: VideoEvaluation[];
}

export interface LearningRequest {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  topicRequirements: string;
  preferredDate: string;
  preferredTime: string;
  price: number; // in INR (₹)
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface LearningSession {
  id: string;
  requestId: string;
  learnerId: string;
  learnerName: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  price: number;
  status: SessionStatus;
  meetingLink?: string;
  completedAt?: string;
  notes?: string;
}

export interface SessionFeedback {
  id: string;
  sessionId: string;
  learnerId: string;
  learnerName: string;
  mentorId: string;
  rating: number; // 1-5 overall
  communicationRating: number; // 1-5
  knowledgeRating: number; // 1-5
  clarityRating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string; // e.g. 'PAY-98432-IN'
  sessionId: string;
  learnerId: string;
  learnerName: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  amount: number; // gross in ₹
  platformFee: number; // e.g. 10%
  mentorEarnings: number; // net in ₹
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  transactionId: string;
  status: 'Success' | 'Failed' | 'Refunded';
  paidAt: string;
}

export interface PayoutRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  amount: number; // in ₹
  payoutMethod: 'UPI' | 'Bank Account';
  payoutDetails: string; // e.g., UPI ID or Account Number
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
  remarks?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'Request' | 'Session' | 'Payment' | 'Feedback' | 'System';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface PlatformSettings {
  platformCommissionPercent: number; // e.g. 10%
  allowInstantBooking: boolean;
  minSessionPrice: number;
  maxSessionPrice: number;
  requireVideoForMentor: boolean;
}
