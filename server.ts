import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { Db, testMySqlConnection } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Setup directories for uploads
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'videos');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `teaching_demo_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|mkv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Please upload MP4, WebM, or MOV format.'));
    }
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// -------------------------------------------------------------------------------------
// AUTHENTICATION APIs
// -------------------------------------------------------------------------------------

// Register new Student or Mentor
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, phone, role, department, yearOfStudy } = req.body;

    if (!fullName || !email || !password || !phone || !role) {
      return res.status(400).json({ error: 'All registration fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const state = Db.getState();
    const existing = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'A student or mentor with this email already exists.' });
    }

    // Password hashing with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `USR-${role.toUpperCase()}-${Date.now().toString().slice(-5)}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      phone: phone.trim(),
      role: role as 'student' | 'mentor' | 'admin',
      createdAt: new Date().toISOString().split('T')[0],
    };

    Db.updateState((s) => {
      s.users.push(newUser);

      if (role === 'student') {
        s.student_profiles.push({
          userId: newUser.id,
          department: department || 'Computer Science & Engineering',
          yearOfStudy: yearOfStudy || '1st Year',
          bio: `Student at campus passionate about peer learning on SkillMate.`,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newUser.fullName)}`,
        });
      } else if (role === 'mentor') {
        s.mentor_profiles.push({
          userId: newUser.id,
          department: department || 'Computer Science & Engineering',
          yearOfStudy: yearOfStudy || '3rd Year',
          bio: `Mentor ready to guide peers and explain key subject concepts.`,
          qualifications: 'B.Tech Engineering, Peer Tutor',
          experienceYears: 1,
          hourlyFee: 150,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newUser.fullName)}`,
          isVerified: true,
        });

        // Initialize earnings
        s.earnings[newUser.id] = {
          mentorId: newUser.id,
          totalGross: 0,
          totalPlatformFees: 0,
          totalNet: 0,
          availableBalance: 0,
          totalWithdrawn: 0,
        };
      }

      s.notifications.push({
        id: `NOTIF-${Date.now()}`,
        userId: newUser.id,
        title: 'Welcome to SkillMate!',
        message: `Account created successfully as ${role}. Start browsing or set up your teaching profile.`,
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    });

    res.status(201).json({
      message: 'Account registered successfully.',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const state = Db.getState();
    const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Fetch profile
    let profile: any = null;
    if (user.role === 'student') {
      profile = state.student_profiles.find((p) => p.userId === user.id);
    } else if (user.role === 'mentor') {
      profile = state.mentor_profiles.find((p) => p.userId === user.id);
    }

    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const state = Db.getState();
  const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No user registered with this email.' });
  }

  if (newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    Db.updateState((s) => {
      const u = s.users.find((usr) => usr.id === user.id);
      if (u) u.passwordHash = passwordHash;
    });
    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  }

  res.json({ message: `Password reset link simulated for ${email}. You may set a new password.` });
});

// -------------------------------------------------------------------------------------
// MENTORS & SKILLS APIs
// -------------------------------------------------------------------------------------

// Get all mentors with skills, demo video and rating metrics
app.get('/api/mentors', (req: Request, res: Response) => {
  const state = Db.getState();
  const { search, category, maxPrice } = req.query;

  const mentorUsers = state.users.filter((u) => u.role === 'mentor');

  let results = mentorUsers.map((m) => {
    const profile = state.mentor_profiles.find((p) => p.userId === m.id);
    const skills = state.mentor_skills.filter((s) => s.mentorId === m.id);
    const video = state.videos.find((v) => v.mentorId === m.id && v.status === 'Active');
    const mentorReviews = state.reviews.filter((r) => r.mentorId === m.id);
    const avgRating =
      mentorReviews.length > 0
        ? Number((mentorReviews.reduce((sum, r) => sum + r.rating, 0) / mentorReviews.length).toFixed(1))
        : 5.0;

    return {
      id: m.id,
      fullName: m.fullName,
      email: m.email,
      phone: m.phone,
      department: profile?.department || 'Engineering',
      yearOfStudy: profile?.yearOfStudy || '3rd Year',
      bio: profile?.bio || '',
      qualifications: profile?.qualifications || '',
      experienceYears: profile?.experienceYears || 1,
      hourlyFee: profile?.hourlyFee || 150,
      avatarUrl: profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.fullName)}`,
      skills,
      video,
      stats: {
        rating: avgRating,
        reviewCount: mentorReviews.length,
        totalLearners: new Set(state.sessions.filter((s) => s.mentorId === m.id).map((s) => s.studentId)).size,
      },
    };
  });

  if (search) {
    const query = String(search).toLowerCase();
    results = results.filter(
      (m) =>
        m.fullName.toLowerCase().includes(query) ||
        m.department.toLowerCase().includes(query) ||
        m.skills.some((s) => s.skillName.toLowerCase().includes(query))
    );
  }

  if (category && category !== 'All') {
    results = results.filter((m) =>
      m.skills.some((s) => {
        const catalogSkill = state.skills.find((cs) => cs.id === s.skillId);
        return catalogSkill?.category === category;
      })
    );
  }

  if (maxPrice) {
    const priceLimit = Number(maxPrice);
    results = results.filter((m) => m.hourlyFee <= priceLimit || m.skills.some((s) => s.price <= priceLimit));
  }

  res.json(results);
});

// Get single mentor profile
app.get('/api/mentors/:id', (req: Request, res: Response) => {
  const state = Db.getState();
  const mentor = state.users.find((u) => u.id === req.params.id && u.role === 'mentor');
  if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

  const profile = state.mentor_profiles.find((p) => p.userId === mentor.id);
  const skills = state.mentor_skills.filter((s) => s.mentorId === mentor.id);
  const video = state.videos.find((v) => v.mentorId === mentor.id);
  const reviews = state.reviews.filter((r) => r.mentorId === mentor.id);

  res.json({
    id: mentor.id,
    fullName: mentor.fullName,
    email: mentor.email,
    phone: mentor.phone,
    profile,
    skills,
    video,
    reviews,
  });
});

// Mentor adds a teaching skill
app.post('/api/skills', (req: Request, res: Response) => {
  const { mentorId, skillName, category, level, price, description } = req.body;
  if (!mentorId || !skillName || !price) {
    return res.status(400).json({ error: 'Mentor ID, skill name, and price are required.' });
  }

  const newSkill = {
    id: `MSK-${Date.now().toString().slice(-5)}`,
    mentorId,
    skillId: `SKL-${Date.now().toString().slice(-4)}`,
    skillName,
    level: level || 'Intermediate',
    price: Number(price),
    description: description || '',
  };

  Db.updateState((s) => {
    s.mentor_skills.push(newSkill);
  });

  res.status(201).json(newSkill);
});

// Delete skill
app.delete('/api/skills/:id', (req: Request, res: Response) => {
  Db.updateState((s) => {
    s.mentor_skills = s.mentor_skills.filter((sk) => sk.id !== req.params.id);
  });
  res.json({ message: 'Skill deleted successfully.' });
});

// -------------------------------------------------------------------------------------
// REAL TEACHING DEMO VIDEO UPLOAD & PLAYBACK
// -------------------------------------------------------------------------------------

app.post('/api/videos/upload', upload.single('videoFile'), (req: Request, res: Response) => {
  try {
    const { mentorId, subject, title, description, durationMinutes, videoUrlPreset } = req.body;

    if (!mentorId || !subject || !title) {
      return res.status(400).json({ error: 'Mentor ID, subject, and video title are required.' });
    }

    let videoPath = videoUrlPreset;
    if (req.file) {
      videoPath = `/uploads/videos/${req.file.filename}`;
    }

    if (!videoPath) {
      videoPath = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    }

    const state = Db.getState();
    const existingVideoIndex = state.videos.findIndex((v) => v.mentorId === mentorId);

    let savedVideo: any;
    Db.updateState((s) => {
      const videoData = {
        id: `VID-${Date.now().toString().slice(-4)}`,
        mentorId,
        subject,
        title,
        description: description || '',
        videoUrl: videoPath,
        thumbnailUrl: '/src/assets/images/demo_video_thumbnail_algo_1793881609226.jpg',
        durationMinutes: Number(durationMinutes) || 3.5,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'Active' as const,
      };

      if (existingVideoIndex >= 0) {
        s.videos[existingVideoIndex] = { ...s.videos[existingVideoIndex], ...videoData };
        savedVideo = s.videos[existingVideoIndex];
      } else {
        s.videos.push(videoData);
        savedVideo = videoData;
      }
    });

    res.status(201).json({
      message: 'Teaching demonstration video uploaded successfully and saved in database.',
      video: savedVideo,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing video upload.' });
  }
});

// Delete uploaded video
app.delete('/api/videos/:id', (req: Request, res: Response) => {
  Db.updateState((s) => {
    s.videos = s.videos.filter((v) => v.id !== req.params.id);
  });
  res.json({ message: 'Demonstration video removed.' });
});

// -------------------------------------------------------------------------------------
// MENTORSHIP REQUESTS & SESSIONS
// -------------------------------------------------------------------------------------

// Student creates mentorship request
app.post('/api/requests', (req: Request, res: Response) => {
  const { studentId, mentorId, subject, topicRequirements, preferredDate, preferredTime, offeredPrice } = req.body;

  if (!studentId || !mentorId || !subject || !topicRequirements) {
    return res.status(400).json({ error: 'All request fields are required.' });
  }

  const state = Db.getState();
  const student = state.users.find((u) => u.id === studentId);
  const mentor = state.users.find((u) => u.id === mentorId);

  if (!student || !mentor) {
    return res.status(404).json({ error: 'Student or mentor account not found.' });
  }

  // Prevent duplicate pending request for same student & mentor
  const existingPending = state.mentorship_requests.find(
    (r) => r.studentId === studentId && r.mentorId === mentorId && r.status === 'Pending'
  );
  if (existingPending) {
    return res.status(409).json({ error: 'You already have an active pending request with this mentor.' });
  }

  const newRequest = {
    id: `REQ-${Date.now().toString().slice(-5)}`,
    studentId,
    studentName: student.fullName,
    studentEmail: student.email,
    mentorId,
    mentorName: mentor.fullName,
    subject,
    topicRequirements,
    preferredDate: preferredDate || new Date().toISOString().split('T')[0],
    preferredTime: preferredTime || '17:00',
    offeredPrice: Number(offeredPrice) || 150,
    status: 'Pending' as const,
    createdAt: new Date().toISOString().split('T')[0],
  };

  Db.updateState((s) => {
    s.mentorship_requests.unshift(newRequest);
    s.notifications.push({
      id: `NOTIF-${Date.now()}`,
      userId: mentorId,
      title: 'New Mentorship Request',
      message: `${student.fullName} requested a learning session on ${subject} (₹${offeredPrice}).`,
      type: 'request',
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
  });

  res.status(201).json(newRequest);
});

// Get requests
app.get('/api/requests', (req: Request, res: Response) => {
  const { userId, role } = req.query;
  const state = Db.getState();

  let list = state.mentorship_requests;
  if (role === 'student' && userId) {
    list = list.filter((r) => r.studentId === userId);
  } else if (role === 'mentor' && userId) {
    list = list.filter((r) => r.mentorId === userId);
  }

  res.json(list);
});

// Accept or Reject Request
app.patch('/api/requests/:id/status', (req: Request, res: Response) => {
  const { status, rejectionReason } = req.body;
  if (!status || !['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Accepted or Rejected.' });
  }

  let updatedRequest: any;
  let newSession: any;

  Db.updateState((s) => {
    const reqItem = s.mentorship_requests.find((r) => r.id === req.params.id);
    if (!reqItem) return;

    reqItem.status = status;
    if (rejectionReason) reqItem.rejectionReason = rejectionReason;
    updatedRequest = reqItem;

    if (status === 'Accepted') {
      newSession = {
        id: `SESS-${Date.now().toString().slice(-4)}`,
        requestId: reqItem.id,
        studentId: reqItem.studentId,
        studentName: reqItem.studentName,
        mentorId: reqItem.mentorId,
        mentorName: reqItem.mentorName,
        subject: reqItem.subject,
        topic: reqItem.topicRequirements,
        scheduledDate: reqItem.preferredDate,
        scheduledTime: reqItem.preferredTime,
        durationMinutes: 60,
        price: reqItem.offeredPrice,
        status: 'Scheduled' as const,
      };
      s.sessions.unshift(newSession);

      s.notifications.push({
        id: `NOTIF-${Date.now()}`,
        userId: reqItem.studentId,
        title: 'Mentorship Request Accepted!',
        message: `${reqItem.mentorName} accepted your session on ${reqItem.subject} for ${reqItem.preferredDate}.`,
        type: 'session',
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    } else {
      s.notifications.push({
        id: `NOTIF-${Date.now()}`,
        userId: reqItem.studentId,
        title: 'Mentorship Request Declined',
        message: `${reqItem.mentorName} declined your request. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
        type: 'request',
        isRead: false,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }
  });

  if (!updatedRequest) return res.status(404).json({ error: 'Request not found.' });
  res.json({ request: updatedRequest, session: newSession });
});

// Complete Session and Calculate Earnings in ₹
app.post('/api/sessions/complete', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID is required.' });

  let completedSession: any;
  let creditedAmount = 0;

  Db.updateState((s) => {
    const sess = s.sessions.find((ss) => ss.id === sessionId);
    if (!sess) return;

    sess.status = 'Completed';
    sess.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    completedSession = sess;

    // Platform fee calculation (e.g. 10%)
    const platformFee = Math.round((sess.price * s.platformCommissionPercent) / 100);
    const mentorNet = sess.price - platformFee;
    creditedAmount = mentorNet;

    // Record payment if not exists
    const existingPayment = s.payments.find((p) => p.sessionId === sessionId);
    if (!existingPayment) {
      s.payments.unshift({
        id: `PAY-${Date.now().toString().slice(-5)}-IN`,
        sessionId,
        studentId: sess.studentId,
        mentorId: sess.mentorId,
        amount: sess.price,
        platformFee,
        mentorEarnings: mentorNet,
        paymentMethod: 'UPI',
        transactionId: `TXN_UPI_${Date.now().toString().slice(-8)}`,
        status: 'Success',
        paidAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }

    // Update mentor earnings wallet
    if (!s.earnings[sess.mentorId]) {
      s.earnings[sess.mentorId] = {
        mentorId: sess.mentorId,
        totalGross: 0,
        totalPlatformFees: 0,
        totalNet: 0,
        availableBalance: 0,
        totalWithdrawn: 0,
      };
    }

    s.earnings[sess.mentorId].totalGross += sess.price;
    s.earnings[sess.mentorId].totalPlatformFees += platformFee;
    s.earnings[sess.mentorId].totalNet += mentorNet;
    s.earnings[sess.mentorId].availableBalance += mentorNet;

    // Notify mentor
    s.notifications.push({
      id: `NOTIF-${Date.now()}`,
      userId: sess.mentorId,
      title: 'Session Earnings Credited (₹)',
      message: `₹${mentorNet} net earnings credited to your wallet for completed session on ${sess.subject}.`,
      type: 'payment',
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
  });

  if (!completedSession) return res.status(404).json({ error: 'Session not found.' });

  res.json({
    message: 'Session completed successfully. Earnings credited.',
    session: completedSession,
    creditedAmount,
  });
});

// -------------------------------------------------------------------------------------
// DATABASE & SYSTEM HEALTH CHECK
// -------------------------------------------------------------------------------------

app.get('/api/db-status', async (req: Request, res: Response) => {
  const probe = await testMySqlConnection();
  const engineStatus = Db.getEngineStatus();
  const state = Db.getState();

  res.json({
    mysqlConnectivity: probe,
    engine: engineStatus,
    tableCounts: {
      users: state.users.length,
      student_profiles: state.student_profiles.length,
      mentor_profiles: state.mentor_profiles.length,
      skills: state.skills.length,
      mentor_skills: state.mentor_skills.length,
      videos: state.videos.length,
      mentorship_requests: state.mentorship_requests.length,
      sessions: state.sessions.length,
      payments: state.payments.length,
      reviews: state.reviews.length,
      notifications: state.notifications.length,
    },
  });
});

// -------------------------------------------------------------------------------------
// FRONTEND SERVER INTEGRATION (Vite Middlewares in Dev / Static Dist in Prod)
// -------------------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite Dev Server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillMate Full-Stack Server]: Running at http://localhost:${PORT}`);
  });
}

startServer();

export default app;
