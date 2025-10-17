import { Student } from "@/pages/Dashboard";

// List of 13 instructors
export const MOCK_INSTRUCTORS = [
  { name: "Prof. James Wilson", classTime: "Mon/Wed 10:00-11:30" },
  { name: "Dr. Lisa Anderson", classTime: "Tue/Thu 14:00-15:30" },
  { name: "Dr. Maria Rodriguez", classTime: "Mon/Wed 12:00-13:30" },
  { name: "Dr. Sarah Mitchell", classTime: "Fri 09:00-12:00" },
  { name: "Prof. Michael Chen", classTime: "Tue/Thu 16:00-17:30" },
  { name: "Dr. Jennifer Lopez", classTime: "Mon/Wed 15:00-16:30" },
  { name: "Prof. David Kim", classTime: "Tue/Thu 10:00-11:30" },
  { name: "Dr. Emily Brown", classTime: "Mon/Wed 18:00-19:30" },
  { name: "Prof. Robert Taylor", classTime: "Fri 13:00-16:00" },
  { name: "Dr. Amanda White", classTime: "Tue/Thu 12:00-13:30" },
  { name: "Daytime Gateway", classTime: "Mon/Tue/Wed/Thu 09:00-14:00" },
  { name: "Evening Gateway", classTime: "Mon/Tue/Wed/Thu 18:00-21:00" },
  { name: "Dr. Sarah Thompson", classTime: "Mon/Wed 13:30-15:00" },
];

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia",
  "Lucas", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Michael",
  "Emily", "Daniel", "Elizabeth", "Matthew", "Sofia", "David", "Avery",
  "Joseph", "Ella", "Jackson", "Scarlett", "Sebastian", "Grace", "Jack",
  "Chloe", "Aiden", "Victoria", "Owen", "Riley", "Samuel", "Aria", "Gabriel",
  "Lily", "Carter", "Aubrey", "Jayden", "Zoey", "John", "Penelope", "Luke",
  "Lillian", "Anthony", "Addison", "Isaac", "Layla", "Dylan", "Natalie",
  "Christopher", "Camila", "Joshua", "Hannah", "Andrew", "Brooklyn", "Ryan",
  "Zoe", "Nathan", "Nora", "Adrian", "Leah", "Christian", "Savannah"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz",
  "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris",
  "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan",
  "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos"
];

const CUNY_CAMPUSES = [
  "stu.bmcc.cuny.edu",
  "hunter.cuny.edu",
  "brooklyn.cuny.edu",
  "ccny.cuny.edu",
  "qc.cuny.edu",
  "lehman.cuny.edu",
  "csi.cuny.edu",
  "york.cuny.edu",
];

const TERM_STATUSES = [
  "TERM ACTIVE/BMCC",
  "TERM ACTIVE/NOT BMCC",
  "TERM NOT ACTIVE",
];

const CUNY_EXAMS = [
  "ACESL-COMP",
  "NOT TAKEN",
  "PASSED",
  "PENDING",
];

const TUITION_STATUSES = [
  "$45 Spring/Fall Benefit",
  "$18 Summer Benefit",
  "$180 In-State",
  "$320 Out-of-State",
  "Scholarship",
];

const SEMESTERS = [
  "Spring 2026",
  "Fall 2025",
  "Spring 2025",
  "Fall 2024",
];

const PAYMENTS: ("Paid" | "Not Paid")[] = ["Paid", "Not Paid"];
const CLASS_STATUSES: ("Enrolled" | "Dropped")[] = ["Enrolled", "Dropped"];

// Generate a random phone number
const generatePhone = () => {
  const area = Math.floor(Math.random() * 900) + 100;
  const mid = Math.floor(Math.random() * 900) + 100;
  const last = Math.floor(Math.random() * 9000) + 1000;
  return `${area}-${mid}-${last}`;
};

// Generate random score or 0
const generateScore = (max: number, allowZero: boolean = true) => {
  if (allowZero && Math.random() < 0.15) return 0; // 15% chance of 0
  return Math.floor(Math.random() * (max - 60)) + 60;
};

// Generate CUNY ID
const generateCunyId = (index: number) => {
  return `2345${String(6789 + index).padStart(4, '0')}`;
};

// Generate students for all instructors
export const generateMockStudents = (): Student[] => {
  const students: Student[] = [];
  let studentIndex = 0;

  MOCK_INSTRUCTORS.forEach((instructor, instructorIndex) => {
    // Generate 28 students per instructor
    for (let i = 0; i < 28; i++) {
      const firstName = FIRST_NAMES[studentIndex % FIRST_NAMES.length];
      const lastName = LAST_NAMES[studentIndex % LAST_NAMES.length];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentIndex}`;
      const campusEmail = CUNY_CAMPUSES[studentIndex % CUNY_CAMPUSES.length];

      // Special handling for Dr. Sarah Thompson - all students must be qualified
      const isThompsonInstructor = instructor.name === "Dr. Sarah Thompson";

      const termStatus = isThompsonInstructor
        ? "TERM ACTIVE/BMCC"
        : TERM_STATUSES[studentIndex % TERM_STATUSES.length];

      const cunyExam = isThompsonInstructor
        ? (i % 2 === 0 ? "ACESL-COMP" : "PASSED")
        : CUNY_EXAMS[studentIndex % CUNY_EXAMS.length];

      const isBMCC = campusEmail === "stu.bmcc.cuny.edu";

      // Some logic for realistic data
      const isActive = termStatus.includes("ACTIVE");
      const hasExam = cunyExam !== "NOT TAKEN";
      const currentSemester = SEMESTERS[studentIndex % SEMESTERS.length];

      // Dr. Sarah Thompson's students are all enrolled
      const classStatus: "Enrolled" | "Dropped" = isThompsonInstructor
        ? "Enrolled"
        : ((!isActive && Math.random() < 0.4) ? "Dropped" : "Enrolled");

      // Dr. Sarah Thompson's students have all paid
      const payment: "Paid" | "Not Paid" = isThompsonInstructor
        ? "Paid"
        : (classStatus === "Dropped" ? "Not Paid" : (Math.random() < 0.75 ? "Paid" : "Not Paid"));

      students.push({
        cunyId: generateCunyId(studentIndex),
        firstName,
        lastName,
        privateEmail: `${email}@gmail.com`,
        cunyEmail: `${email}@${campusEmail}`,
        phone: generatePhone(),
        startSemester: Math.floor(Math.random() * 5) + 1,
        instructor: instructor.name,
        classTime: instructor.classTime,
        termStatus,
        cunyExam,
        accuplacerScore: hasExam ? generateScore(120) : 0,
        essayScore: hasExam ? generateScore(100) : 0,
        essayLink: hasExam && Math.random() < 0.3 ? "https://example.com/essay" : "",
        michiganScore: hasExam ? generateScore(100) : 0,
        tuitionStatus: TUITION_STATUSES[studentIndex % TUITION_STATUSES.length],
        payment,
        currentSemester,
        notes: "",
        classStatus,
        instructorNotes: "",
        contactLog: [],
        history: [{
          timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          action: "Created",
          user: "admin"
        }],
        attendance: [],
        attendanceRules: [
          {
            id: "absence_threshold",
            name: "Absence Threshold",
            type: "absence_threshold",
            threshold: 3,
            isViolated: false
          },
          {
            id: "lateness_pattern",
            name: "Lateness Pattern",
            type: "lateness_pattern",
            threshold: 5,
            isViolated: false
          },
          {
            id: "consecutive_absences",
            name: "Consecutive Absences",
            type: "consecutive_absences",
            threshold: 2,
            isViolated: false
          },
          {
            id: "attendance_percentage",
            name: "Attendance Percentage",
            type: "attendance_percentage",
            threshold: 80,
            isViolated: false
          }
        ],
      });

      studentIndex++;
    }
  });

  return students;
};

export const initialMockStudents = generateMockStudents();
