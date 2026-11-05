import {
  Student,
  StudentSkill,
  MentorVideo,
  VideoEvaluation,
  LearningRequest,
  LearningSession,
  SessionFeedback,
  PaymentRecord,
  PayoutRequest,
  NotificationItem,
  PlatformSettings,
} from '../types';

import {
  INITIAL_STUDENTS,
  INITIAL_STUDENT_SKILLS,
  INITIAL_MENTOR_VIDEOS,
  INITIAL_LEARNING_REQUESTS,
  INITIAL_SESSIONS,
  INITIAL_FEEDBACK,
  INITIAL_PAYMENTS,
  INITIAL_PAYOUTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLATFORM_SETTINGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'skillmate_current_user_id',
  STUDENTS: 'skillmate_students',
  SKILLS: 'skillmate_skills',
  VIDEOS: 'skillmate_videos',
  REQUESTS: 'skillmate_requests',
  SESSIONS: 'skillmate_sessions',
  FEEDBACK: 'skillmate_feedback',
  PAYMENTS: 'skillmate_payments',
  PAYOUTS: 'skillmate_payouts',
  NOTIFICATIONS: 'skillmate_notifications',
  SETTINGS: 'skillmate_settings',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
}

export const StorageService = {
  // Current Student / User Session
  getCurrentStudentId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'STU-2024-001';
  },

  setCurrentStudentId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, id);
  },

  getCurrentStudent(): Student {
    const id = this.getCurrentStudentId();
    const students = this.getStudents();
    return students.find((s) => s.id === id) || students[0];
  },

  // Students
  getStudents(): Student[] {
    return getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  },

  saveStudent(student: Student): Student {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }
    setStored(STORAGE_KEYS.STUDENTS, students);
    return student;
  },

  registerStudent(params: {
    studentId: string;
    fullName: string;
    collegeEmail: string;
    phone: string;
    department: string;
    yearOfStudy: string;
    bio?: string;
  }): Student {
    const students = this.getStudents();
    const existing = students.find((s) => s.id === params.studentId || s.collegeEmail === params.collegeEmail);
    if (existing) {
      throw new Error('A student with this Student ID or College Email already exists.');
    }

    const newStudent: Student = {
      id: params.studentId,
      fullName: params.fullName,
      collegeEmail: params.collegeEmail,
      phone: params.phone,
      department: params.department,
      yearOfStudy: params.yearOfStudy,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(params.fullName)}`,
      bio: params.bio || `Student in ${params.department}, ${params.yearOfStudy}. Excited to learn and share skills on SkillMate.`,
      isMentor: false,
      isVerified: true,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    students.push(newStudent);
    setStored(STORAGE_KEYS.STUDENTS, students);
    this.setCurrentStudentId(newStudent.id);
    return newStudent;
  },

  // Skills
  getSkills(): StudentSkill[] {
    return getStored<StudentSkill[]>(STORAGE_KEYS.SKILLS, INITIAL_STUDENT_SKILLS);
  },

  getSkillsByStudent(studentId: string): StudentSkill[] {
    return this.getSkills().filter((s) => s.studentId === studentId);
  },

  addSkill(skill: Omit<StudentSkill, 'id' | 'createdAt'>): StudentSkill {
    const skills = this.getSkills();
    const newSkill: StudentSkill = {
      ...skill,
      id: `SKILL-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    skills.push(newSkill);
    setStored(STORAGE_KEYS.SKILLS, skills);

    // If student was not marked as mentor, mark them as mentor
    const student = this.getStudentById(skill.studentId);
    if (student && !student.isMentor) {
      student.isMentor = true;
      this.saveStudent(student);
    }

    return newSkill;
  },

  updateSkill(skill: StudentSkill): StudentSkill {
    const skills = this.getSkills();
    const idx = skills.findIndex((s) => s.id === skill.id);
    if (idx >= 0) {
      skills[idx] = skill;
      setStored(STORAGE_KEYS.SKILLS, skills);
    }
    return skill;
  },

  deleteSkill(skillId: string): void {
    const skills = this.getSkills().filter((s) => s.id !== skillId);
    setStored(STORAGE_KEYS.SKILLS, skills);
  },

  // Videos
  getVideos(): MentorVideo[] {
    return getStored<MentorVideo[]>(STORAGE_KEYS.VIDEOS, INITIAL_MENTOR_VIDEOS);
  },

  getVideoByStudent(studentId: string): MentorVideo | undefined {
    return this.getVideos().find((v) => v.studentId === studentId);
  },

  saveVideo(videoData: Omit<MentorVideo, 'id' | 'uploadedAt' | 'evaluations'>): MentorVideo {
    const videos = this.getVideos();
    const existingIndex = videos.findIndex((v) => v.studentId === videoData.studentId);
    let savedVideo: MentorVideo;

    if (existingIndex >= 0) {
      savedVideo = {
        ...videos[existingIndex],
        ...videoData,
        uploadedAt: new Date().toISOString().split('T')[0],
      };
      videos[existingIndex] = savedVideo;
    } else {
      savedVideo = {
        ...videoData,
        id: `VID-${Date.now().toString().slice(-4)}`,
        uploadedAt: new Date().toISOString().split('T')[0],
        evaluations: [],
      };
      videos.push(savedVideo);
    }

    setStored(STORAGE_KEYS.VIDEOS, videos);

    // Ensure student is mentor
    const student = this.getStudentById(videoData.studentId);
    if (student && !student.isMentor) {
      student.isMentor = true;
      this.saveStudent(student);
    }

    return savedVideo;
  },

  deleteVideo(studentId: string): void {
    const videos = this.getVideos().filter((v) => v.studentId !== studentId);
    setStored(STORAGE_KEYS.VIDEOS, videos);
  },

  addVideoEvaluation(
    videoId: string,
    evalData: Omit<VideoEvaluation, 'id' | 'videoId' | 'createdAt'>
  ): VideoEvaluation {
    const videos = this.getVideos();
    const video = videos.find((v) => v.id === videoId);
    if (!video) throw new Error('Video not found');

    const newEval: VideoEvaluation = {
      ...evalData,
      id: `EVAL-${Date.now().toString().slice(-5)}`,
      videoId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    video.evaluations.unshift(newEval);
    setStored(STORAGE_KEYS.VIDEOS, videos);

    // Notify mentor
    this.addNotification({
      recipientId: video.studentId,
      title: 'New Video Evaluation Feedback',
      message: `${evalData.studentName} evaluated your demo video on ${video.subject} with ${evalData.subjectKnowledge}/5 knowledge score.`,
      type: 'Feedback',
      actionUrl: 'teaching-video',
    });

    return newEval;
  },

  // Learning Requests
  getRequests(): LearningRequest[] {
    return getStored<LearningRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_LEARNING_REQUESTS);
  },

  createLearningRequest(params: {
    mentorId: string;
    subject: string;
    topicRequirements: string;
    preferredDate: string;
    preferredTime: string;
    price: number;
  }): LearningRequest {
    const current = this.getCurrentStudent();
    const mentor = this.getStudentById(params.mentorId);
    if (!mentor) throw new Error('Mentor not found');

    const requests = this.getRequests();
    const newReq: LearningRequest = {
      id: `REQ-${Date.now().toString().slice(-5)}`,
      learnerId: current.id,
      learnerName: current.fullName,
      learnerEmail: current.collegeEmail,
      mentorId: mentor.id,
      mentorName: mentor.fullName,
      subject: params.subject,
      topicRequirements: params.topicRequirements,
      preferredDate: params.preferredDate,
      preferredTime: params.preferredTime,
      price: params.price,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    requests.unshift(newReq);
    setStored(STORAGE_KEYS.REQUESTS, requests);

    // Send notification to mentor
    this.addNotification({
      recipientId: mentor.id,
      title: 'New Peer Learning Request',
      message: `${current.fullName} (${current.department}) requested a session on ${params.subject} for ₹${params.price}.`,
      type: 'Request',
      actionUrl: 'requests',
    });

    return newReq;
  },

  updateRequestStatus(requestId: string, status: 'Accepted' | 'Rejected', reason?: string): LearningRequest {
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    req.status = status;
    if (reason) req.rejectionReason = reason;
    setStored(STORAGE_KEYS.REQUESTS, requests);

    if (status === 'Accepted') {
      // Create scheduled session automatically
      this.createSessionFromRequest(req);
      this.addNotification({
        recipientId: req.learnerId,
        title: 'Learning Request Accepted!',
        message: `${req.mentorName} accepted your session for ${req.subject} on ${req.preferredDate} at ${req.preferredTime}. Proceed to payment to confirm.`,
        type: 'Session',
        actionUrl: 'sessions',
      });
    } else {
      this.addNotification({
        recipientId: req.learnerId,
        title: 'Learning Request Declined',
        message: `${req.mentorName} was unavailable for this time slot. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'Request',
        actionUrl: 'requests',
      });
    }

    return req;
  },

  // Sessions
  getSessions(): LearningSession[] {
    return getStored<LearningSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  },

  createSessionFromRequest(req: LearningRequest): LearningSession {
    const sessions = this.getSessions();
    const newSession: LearningSession = {
      id: `SESS-${Date.now().toString().slice(-4)}`,
      requestId: req.id,
      learnerId: req.learnerId,
      learnerName: req.learnerName,
      mentorId: req.mentorId,
      mentorName: req.mentorName,
      subject: req.subject,
      topic: req.topicRequirements,
      scheduledDate: req.preferredDate,
      scheduledTime: req.preferredTime,
      durationMinutes: 60,
      price: req.price,
      status: 'Scheduled',
      meetingLink: `https://skillmate.edu/classroom/${req.id.toLowerCase()}`,
    };

    sessions.unshift(newSession);
    setStored(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  },

  completeSession(sessionId: string): LearningSession {
    const sessions = this.getSessions();
    const sess = sessions.find((s) => s.id === sessionId);
    if (!sess) throw new Error('Session not found');

    sess.status = 'Completed';
    sess.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setStored(STORAGE_KEYS.SESSIONS, sessions);

    // Update associated request status to completed
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === sess.requestId);
    if (req) {
      req.status = 'Completed';
      setStored(STORAGE_KEYS.REQUESTS, requests);
    }

    // Record earnings for mentor if not already recorded
    const payments = this.getPayments();
    const existingPayment = payments.find((p) => p.sessionId === sessionId);
    if (!existingPayment) {
      const settings = this.getSettings();
      const platformFee = Math.round((sess.price * settings.platformCommissionPercent) / 100);
      const mentorEarnings = sess.price - platformFee;

      const newPayment: PaymentRecord = {
        id: `PAY-${Date.now().toString().slice(-5)}-IN`,
        sessionId,
        learnerId: sess.learnerId,
        learnerName: sess.learnerName,
        mentorId: sess.mentorId,
        mentorName: sess.mentorName,
        subject: sess.subject,
        amount: sess.price,
        platformFee,
        mentorEarnings,
        paymentMethod: 'UPI',
        transactionId: `TXN_SIM_${Date.now().toString().slice(-8)}`,
        status: 'Success',
        paidAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      payments.unshift(newPayment);
      setStored(STORAGE_KEYS.PAYMENTS, payments);
    }

    // Notify learner to leave feedback
    this.addNotification({
      recipientId: sess.learnerId,
      title: 'Session Completed - Share Feedback',
      message: `Your learning session on ${sess.subject} with ${sess.mentorName} is completed. Please rate your experience!`,
      type: 'Feedback',
      actionUrl: 'feedback',
    });

    // Notify mentor about completed earnings
    this.addNotification({
      recipientId: sess.mentorId,
      title: 'Session Completed - Earnings Credited',
      message: `Session with ${sess.learnerName} marked complete. Net earnings of ₹${sess.price * 0.9} added to wallet!`,
      type: 'Payment',
      actionUrl: 'earnings',
    });

    return sess;
  },

  // Payments
  getPayments(): PaymentRecord[] {
    return getStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },

  processSandboxPayment(params: {
    sessionId: string;
    learnerId: string;
    mentorId: string;
    amount: number;
    paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  }): PaymentRecord {
    const settings = this.getSettings();
    const platformFee = Math.round((params.amount * settings.platformCommissionPercent) / 100);
    const mentorEarnings = params.amount - platformFee;

    const learner = this.getStudentById(params.learnerId);
    const mentor = this.getStudentById(params.mentorId);
    const session = this.getSessions().find((s) => s.id === params.sessionId);

    const payment: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-5)}-IN`,
      sessionId: params.sessionId,
      learnerId: params.learnerId,
      learnerName: learner?.fullName || 'Student Learner',
      mentorId: params.mentorId,
      mentorName: mentor?.fullName || 'Student Mentor',
      subject: session?.subject || 'Peer Tutoring Session',
      amount: params.amount,
      platformFee,
      mentorEarnings,
      paymentMethod: params.paymentMethod,
      transactionId: `TXN_${params.paymentMethod.toUpperCase()}_${Date.now().toString().slice(-8)}`,
      status: 'Success',
      paidAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    const payments = this.getPayments();
    payments.unshift(payment);
    setStored(STORAGE_KEYS.PAYMENTS, payments);

    return payment;
  },

  // Payouts
  getPayouts(): PayoutRequest[] {
    return getStored<PayoutRequest[]>(STORAGE_KEYS.PAYOUTS, INITIAL_PAYOUTS);
  },

  requestPayout(params: {
    amount: number;
    payoutMethod: 'UPI' | 'Bank Account';
    payoutDetails: string;
  }): PayoutRequest {
    const student = this.getCurrentStudent();
    const earnings = this.calculateMentorEarnings(student.id);

    if (params.amount > earnings.availableBalance) {
      throw new Error(`Requested amount ₹${params.amount} exceeds available balance of ₹${earnings.availableBalance}.`);
    }

    if (params.amount < 100) {
      throw new Error('Minimum payout request amount is ₹100.');
    }

    const payouts = this.getPayouts();
    const newPayout: PayoutRequest = {
      id: `PO-${Date.now().toString().slice(-5)}`,
      mentorId: student.id,
      mentorName: student.fullName,
      amount: params.amount,
      payoutMethod: params.payoutMethod,
      payoutDetails: params.payoutDetails,
      status: 'Pending',
      requestedAt: new Date().toISOString().split('T')[0],
      remarks: 'Pending administrator verification and bank transfer.',
    };

    payouts.unshift(newPayout);
    setStored(STORAGE_KEYS.PAYOUTS, payouts);

    this.addNotification({
      recipientId: student.id,
      title: 'Payout Request Submitted',
      message: `Your withdrawal request of ₹${params.amount} to ${params.payoutMethod} has been submitted for admin processing.`,
      type: 'Payment',
      actionUrl: 'earnings',
    });

    return newPayout;
  },

  updatePayoutStatus(payoutId: string, status: 'Approved' | 'Transferred' | 'Rejected', remarks?: string): PayoutRequest {
    const payouts = this.getPayouts();
    const payout = payouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error('Payout request not found');

    payout.status = status;
    payout.processedAt = new Date().toISOString().split('T')[0];
    if (remarks) payout.remarks = remarks;
    setStored(STORAGE_KEYS.PAYOUTS, payouts);

    this.addNotification({
      recipientId: payout.mentorId,
      title: `Payout Request ${status}`,
      message: `Your payout of ₹${payout.amount} has been ${status.toLowerCase()}. ${remarks || ''}`,
      type: 'Payment',
      actionUrl: 'earnings',
    });

    return payout;
  },

  // Feedback
  getFeedback(): SessionFeedback[] {
    return getStored<SessionFeedback[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
  },

  getFeedbackForMentor(mentorId: string): SessionFeedback[] {
    return this.getFeedback().filter((f) => f.mentorId === mentorId);
  },

  submitFeedback(data: Omit<SessionFeedback, 'id' | 'createdAt'>): SessionFeedback {
    const allFeedback = this.getFeedback();
    const existing = allFeedback.find((f) => f.sessionId === data.sessionId && f.learnerId === data.learnerId);
    if (existing) {
      throw new Error('You have already submitted feedback for this learning session.');
    }

    const newFeedback: SessionFeedback = {
      ...data,
      id: `FB-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    allFeedback.unshift(newFeedback);
    setStored(STORAGE_KEYS.FEEDBACK, allFeedback);

    this.addNotification({
      recipientId: data.mentorId,
      title: 'New Session Review & Rating Received',
      message: `${data.learnerName} rated your session ${data.rating} ★: "${data.comment.slice(0, 60)}..."`,
      type: 'Feedback',
      actionUrl: 'feedback',
    });

    return newFeedback;
  },

  // Notifications
  getNotifications(recipientId: string): NotificationItem[] {
    const list = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return list.filter((n) => n.recipientId === recipientId);
  },

  addNotification(item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): NotificationItem {
    const list = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const notif: NotificationItem = {
      ...item,
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    list.unshift(notif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    return notif;
  },

  markNotificationAsRead(id: string): void {
    const list = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsAsRead(recipientId: string): void {
    const list = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list.forEach((n) => {
      if (n.recipientId === recipientId) n.read = true;
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  // Settings
  getSettings(): PlatformSettings {
    return getStored<PlatformSettings>(STORAGE_KEYS.SETTINGS, INITIAL_PLATFORM_SETTINGS);
  },

  updateSettings(settings: Partial<PlatformSettings>): PlatformSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Aggregated Calculations & Earning Math
  calculateMentorEarnings(mentorId: string) {
    const payments = this.getPayments().filter((p) => p.mentorId === mentorId && p.status === 'Success');
    const grossEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const platformFeesPaid = payments.reduce((sum, p) => sum + p.platformFee, 0);
    const netEarnings = payments.reduce((sum, p) => sum + p.mentorEarnings, 0);

    const payouts = this.getPayouts().filter((p) => p.mentorId === mentorId);
    const transferredPayouts = payouts
      .filter((p) => p.status === 'Transferred')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayouts = payouts
      .filter((p) => p.status === 'Pending' || p.status === 'Approved')
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = Math.max(0, netEarnings - transferredPayouts - pendingPayouts);

    return {
      grossEarnings,
      platformFeesPaid,
      netEarnings,
      transferredPayouts,
      pendingPayouts,
      availableBalance,
      paidSessionsCount: payments.length,
    };
  },

  getMentorStats(mentorId: string) {
    const sessions = this.getSessions().filter((s) => s.mentorId === mentorId);
    const completedSessions = sessions.filter((s) => s.status === 'Completed');
    const feedbackList = this.getFeedbackForMentor(mentorId);

    const avgRating =
      feedbackList.length > 0
        ? Number((feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1))
        : 5.0;

    const uniqueLearners = new Set(sessions.map((s) => s.learnerId)).size;

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      rating: avgRating,
      reviewCount: feedbackList.length,
      totalLearners: uniqueLearners,
    };
  },

  // Reset to initial demo database state
  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.SKILLS);
    localStorage.removeItem(STORAGE_KEYS.VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.PAYOUTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    this.setCurrentStudentId('STU-2024-001');
  },
};
