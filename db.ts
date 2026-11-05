import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export const dbConfig: DbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'skillmate_db',
};

// Data persistence file path for embedded persistent storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'skillmate_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 12 Schema Tables Type Definitions
export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'student' | 'mentor' | 'admin';
  createdAt: string;
}

export interface StudentProfileRecord {
  userId: string;
  department: string;
  yearOfStudy: string;
  bio: string;
  avatarUrl: string;
}

export interface MentorProfileRecord {
  userId: string;
  department: string;
  yearOfStudy: string;
  bio: string;
  qualifications: string;
  experienceYears: number;
  hourlyFee: number; // in INR (₹)
  avatarUrl: string;
  isVerified: boolean;
}

export interface SkillRecord {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface MentorSkillRecord {
  id: string;
  mentorId: string;
  skillId: string;
  skillName: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  description: string;
}

export interface VideoRecord {
  id: string;
  mentorId: string;
  subject: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationMinutes: number;
  uploadedAt: string;
  status: 'Active' | 'Under Review' | 'Flagged';
}

export interface MentorshipRequestRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  topicRequirements: string;
  preferredDate: string;
  preferredTime: string;
  offeredPrice: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  rejectionReason?: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  requestId: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
  subject: string;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  price: number;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
  completedAt?: string;
}

export interface PaymentRecord {
  id: string;
  sessionId: string;
  studentId: string;
  mentorId: string;
  amount: number;
  platformFee: number;
  mentorEarnings: number;
  paymentMethod: string;
  transactionId: string;
  status: 'Success' | 'Pending' | 'Failed';
  paidAt: string;
}

export interface EarningRecord {
  mentorId: string;
  totalGross: number;
  totalPlatformFees: number;
  totalNet: number;
  availableBalance: number;
  totalWithdrawn: number;
}

export interface ReviewRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  rating: number; // 1-5
  communicationRating: number;
  knowledgeRating: number;
  clarityRating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DatabaseState {
  users: UserRecord[];
  student_profiles: StudentProfileRecord[];
  mentor_profiles: MentorProfileRecord[];
  skills: SkillRecord[];
  mentor_skills: MentorSkillRecord[];
  videos: VideoRecord[];
  mentorship_requests: MentorshipRequestRecord[];
  sessions: SessionRecord[];
  payments: PaymentRecord[];
  earnings: Record<string, EarningRecord>;
  reviews: ReviewRecord[];
  notifications: NotificationRecord[];
  platformCommissionPercent: number;
}

// Initial Database Seeding
const INITIAL_DATABASE: DatabaseState = {
  platformCommissionPercent: 10,
  users: [
    {
      id: 'USR-ADMIN-01',
      fullName: 'Campus Administrator',
      email: 'admin@skillmate.edu.in',
      passwordHash: '$2a$10$Yn5bXgqg6N9kH3P5/5.s8O9uT59p87Q2i6Rk4HwS6h07y1sH8dMye', // admin123
      phone: '+91 98765 00000',
      role: 'admin',
      createdAt: '2024-01-01',
    },
    {
      id: 'USR-MENTOR-01',
      fullName: 'Pujitha Talluri',
      email: 'pujithatalluri1309@gmail.com',
      passwordHash: '$2a$10$Yn5bXgqg6N9kH3P5/5.s8O9uT59p87Q2i6Rk4HwS6h07y1sH8dMye', // admin123
      phone: '+91 98765 43210',
      role: 'mentor',
      createdAt: '2024-08-15',
    },
    {
      id: 'USR-MENTOR-02',
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@college.edu.in',
      passwordHash: '$2a$10$Yn5bXgqg6N9kH3P5/5.s8O9uT59p87Q2i6Rk4HwS6h07y1sH8dMye',
      phone: '+91 91234 56789',
      role: 'mentor',
      createdAt: '2024-07-10',
    },
    {
      id: 'USR-STUDENT-01',
      fullName: 'Arjun Reddy',
      email: 'arjun.reddy@college.edu.in',
      passwordHash: '$2a$10$Yn5bXgqg6N9kH3P5/5.s8O9uT59p87Q2i6Rk4HwS6h07y1sH8dMye',
      phone: '+91 97711 22334',
      role: 'student',
      createdAt: '2024-09-01',
    },
  ],
  student_profiles: [
    {
      userId: 'USR-STUDENT-01',
      department: 'Computer Science & Engineering',
      yearOfStudy: '1st Year',
      bio: 'First-year engineering student eager to master Data Structures, Algorithms, and DBMS.',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    },
  ],
  mentor_profiles: [
    {
      userId: 'USR-MENTOR-01',
      department: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
      bio: 'Passionate about Data Structures, Trees, and DBMS. Solved 450+ LeetCode problems and helped 30+ peers ace semester lab viva.',
      qualifications: 'B.Tech CSE, CGPA: 9.4/10, Certified MySQL Specialist',
      experienceYears: 2,
      hourlyFee: 200,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
    },
    {
      userId: 'USR-MENTOR-02',
      department: 'Information Technology',
      yearOfStudy: '4th Year',
      bio: 'Full-stack developer experienced in Java Spring Boot, REST APIs, and React. Mentored 40+ juniors in campus hackathons.',
      qualifications: 'B.Tech IT, Finalist Smart India Hackathon',
      experienceYears: 2,
      hourlyFee: 250,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
    },
  ],
  skills: [
    { id: 'SKL-01', name: 'Data Structures & Algorithms', category: 'Computer Science Core', description: 'Binary Search Trees, Graphs, Sorting, Recursion' },
    { id: 'SKL-02', name: 'DBMS & SQL', category: 'Computer Science Core', description: 'Normalization, Joins, Indexing, Transactions' },
    { id: 'SKL-03', name: 'Java & Spring Boot', category: 'Programming & Languages', description: 'OOP, Collections, REST Controllers, Spring Data JPA' },
    { id: 'SKL-04', name: 'Python for Data Science', category: 'AI, ML & Data Science', description: 'NumPy, Pandas, Matplotlib, Data Cleaning' },
  ],
  mentor_skills: [
    {
      id: 'MSK-01',
      mentorId: 'USR-MENTOR-01',
      skillId: 'SKL-01',
      skillName: 'Data Structures & Algorithms',
      level: 'Advanced',
      price: 200,
      description: 'Master Binary Trees, traversal orders, and recursion with step-by-step whiteboard drawings.',
    },
    {
      id: 'MSK-02',
      mentorId: 'USR-MENTOR-01',
      skillId: 'SKL-02',
      skillName: 'DBMS & SQL',
      level: 'Advanced',
      price: 180,
      description: 'Demystifying complex SQL INNER and OUTER joins, 3NF/BCNF normalization, and query tuning.',
    },
    {
      id: 'MSK-03',
      mentorId: 'USR-MENTOR-02',
      skillId: 'SKL-03',
      skillName: 'Java & Spring Boot',
      level: 'Advanced',
      price: 250,
      description: 'Build robust REST APIs with Spring Data JPA and MySQL in hands-on pair programming sessions.',
    },
  ],
  videos: [
    {
      id: 'VID-01',
      mentorId: 'USR-MENTOR-01',
      subject: 'Data Structures & Algorithms',
      title: 'Visualizing Binary Search Trees (BST) Insertion and Traversal',
      description: 'Short 3.5 minute demonstration of BST properties, step-by-step node placement and recursive traversal.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: '/src/assets/images/demo_video_thumbnail_algo_1793881609226.jpg',
      durationMinutes: 3.5,
      uploadedAt: '2024-09-01',
      status: 'Active',
    },
    {
      id: 'VID-02',
      mentorId: 'USR-MENTOR-02',
      subject: 'Java & Spring Boot',
      title: 'Building a RESTful Student API with Spring Data JPA in 4 Minutes',
      description: 'Hands-on live demonstration explaining @RestController, @Service, and repository mapping with MySQL.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: '/src/assets/images/hero_skillmate_learning_1793881608981.jpg',
      durationMinutes: 4.2,
      uploadedAt: '2024-09-05',
      status: 'Active',
    },
  ],
  mentorship_requests: [
    {
      id: 'REQ-101',
      studentId: 'USR-STUDENT-01',
      studentName: 'Arjun Reddy',
      studentEmail: 'arjun.reddy@college.edu.in',
      mentorId: 'USR-MENTOR-01',
      mentorName: 'Pujitha Talluri',
      subject: 'Data Structures & Algorithms',
      topicRequirements: 'Need help understanding Doubly Linked Lists and converting them to Binary Trees for upcoming semester lab test.',
      preferredDate: '2026-11-08',
      preferredTime: '17:00',
      offeredPrice: 200,
      status: 'Accepted',
      createdAt: '2026-11-03',
    },
  ],
  sessions: [
    {
      id: 'SESS-201',
      requestId: 'REQ-101',
      studentId: 'USR-STUDENT-01',
      studentName: 'Arjun Reddy',
      mentorId: 'USR-MENTOR-01',
      mentorName: 'Pujitha Talluri',
      subject: 'Data Structures & Algorithms',
      topic: 'Doubly Linked Lists & Trees Mastery',
      scheduledDate: '2026-11-08',
      scheduledTime: '17:00',
      durationMinutes: 60,
      price: 200,
      status: 'Completed',
      completedAt: '2026-11-04 18:00',
    },
  ],
  payments: [
    {
      id: 'PAY-89101-IN',
      sessionId: 'SESS-201',
      studentId: 'USR-STUDENT-01',
      mentorId: 'USR-MENTOR-01',
      amount: 200,
      platformFee: 20, // 10%
      mentorEarnings: 180,
      paymentMethod: 'UPI',
      transactionId: 'TXN_UPI_984512998',
      status: 'Success',
      paidAt: '2026-11-03 14:22',
    },
  ],
  earnings: {
    'USR-MENTOR-01': {
      mentorId: 'USR-MENTOR-01',
      totalGross: 200,
      totalPlatformFees: 20,
      totalNet: 180,
      availableBalance: 180,
      totalWithdrawn: 0,
    },
    'USR-MENTOR-02': {
      mentorId: 'USR-MENTOR-02',
      totalGross: 0,
      totalPlatformFees: 0,
      totalNet: 0,
      availableBalance: 0,
      totalWithdrawn: 0,
    },
  },
  reviews: [
    {
      id: 'REV-01',
      sessionId: 'SESS-201',
      studentId: 'USR-STUDENT-01',
      studentName: 'Arjun Reddy',
      mentorId: 'USR-MENTOR-01',
      rating: 5,
      communicationRating: 5,
      knowledgeRating: 5,
      clarityRating: 5,
      comment: 'Pujitha explained Binary Search Tree insertions with phenomenal clarity! Super helpful peer mentoring.',
      createdAt: '2026-11-04',
    },
  ],
  notifications: [
    {
      id: 'NOTIF-01',
      userId: 'USR-MENTOR-01',
      title: 'Payment Credited to Wallet',
      message: '₹180 net earnings added for completed session SESS-201 with Arjun Reddy.',
      type: 'payment',
      isRead: false,
      createdAt: '2026-11-04 18:05',
    },
  ],
};

// Database persistence helper
function loadDatabase(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
      return INITIAL_DATABASE;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return INITIAL_DATABASE;
  }
}

function saveDatabase(state: DatabaseState): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// MySQL pool connection attempt
let mysqlPool: mysql.Pool | null = null;
let isMySqlConnected = false;
let lastMySqlError = '';

export async function testMySqlConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    if (!mysqlPool) {
      mysqlPool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000,
      });
    }
    const connection = await mysqlPool.getConnection();
    await connection.ping();
    connection.release();
    isMySqlConnected = true;
    lastMySqlError = '';
    return { connected: true, message: `Connected to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}` };
  } catch (err: any) {
    isMySqlConnected = false;
    lastMySqlError = err.message || 'Connection failed';
    return {
      connected: false,
      message: `MySQL not reachable at ${dbConfig.host}:${dbConfig.port} (${err.code || err.message}). Fallback relational storage active.`,
    };
  }
}

// Initialize and probe MySQL on startup
testMySqlConnection().then((res) => {
  console.log(`[Database Engine Status]: ${res.message}`);
});

export const Db = {
  getEngineStatus() {
    return {
      isMySqlConnected,
      lastMySqlError,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
      },
      fallbackStorage: 'Active (data/skillmate_db.json)',
    };
  },

  getState(): DatabaseState {
    return loadDatabase();
  },

  updateState(updater: (state: DatabaseState) => void): DatabaseState {
    const state = loadDatabase();
    updater(state);
    saveDatabase(state);
    return state;
  },

  // Reset to initial clean state
  reset() {
    saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  },
};
