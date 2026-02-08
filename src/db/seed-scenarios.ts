export interface PhysioScenario {
  id: string;
  name: string;
  email: string;
  clinicName: string;
  region: string;
  specialties: string[];
  capacity: "available" | "limited" | "waitlist";
  optedIn: boolean;
  previewMode: boolean;
  description: string;
  episodeCount: number;
  expectedSignalProfile: {
    outcomeTrajectory: "strong" | "moderate" | "emerging" | "mixed";
    clinicalDecision: "strong" | "moderate" | "emerging" | "mixed";
    patientPreference: "strong" | "moderate" | "emerging" | "mixed";
  };
}

export const physioScenarios: PhysioScenario[] = [
  {
    id: "physio-sarah",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    clinicName: "Momentum Physio",
    region: "North Sydney",
    specialties: ["sports", "MSK", "post-surgical"],
    capacity: "available",
    optedIn: false,
    previewMode: false,
    description:
      "Strong performer, not opted in — Ready to test the opt-in flow with good signals",
    episodeCount: 15,
    expectedSignalProfile: {
      outcomeTrajectory: "strong",
      clinicalDecision: "strong",
      patientPreference: "moderate",
    },
  },
  {
    id: "physio-james",
    name: "James Park",
    email: "james.park@example.com",
    clinicName: "Park Physio Practice",
    region: "North Sydney",
    specialties: ["MSK", "chronic pain", "elderly care"],
    capacity: "limited",
    optedIn: false,
    previewMode: false,
    description:
      "Good performer, not opted in — Demonstrates opportunity cost (invisible to system)",
    episodeCount: 12,
    expectedSignalProfile: {
      outcomeTrajectory: "strong",
      clinicalDecision: "moderate",
      patientPreference: "moderate",
    },
  },
  {
    id: "physio-maya",
    name: "Maya Patel",
    email: "maya.patel@example.com",
    clinicName: "Restore Health Clinic",
    region: "South Sydney",
    specialties: ["MSK", "sports", "rehabilitation"],
    capacity: "available",
    optedIn: false,
    previewMode: false,
    description:
      "Early data physio, not opted in — Test ramp-up with emerging signals",
    episodeCount: 8,
    expectedSignalProfile: {
      outcomeTrajectory: "emerging",
      clinicalDecision: "emerging",
      patientPreference: "emerging",
    },
  },
  {
    id: "physio-tom",
    name: "Tom Hughes",
    email: "tom.hughes@example.com",
    clinicName: "Hughes Physiotherapy",
    region: "East Melbourne",
    specialties: ["MSK", "neurological"],
    capacity: "waitlist",
    optedIn: false,
    previewMode: false,
    description:
      "Mixed signals physio, not opted in — Test opt-in with challenging cases",
    episodeCount: 14,
    expectedSignalProfile: {
      outcomeTrajectory: "mixed",
      clinicalDecision: "moderate",
      patientPreference: "strong",
    },
  },
  {
    id: "physio-aisha",
    name: "Aisha Rahman",
    email: "aisha.rahman@example.com",
    clinicName: "Rahman Physio Centre",
    region: "West Perth",
    specialties: ["MSK", "women's health", "pelvic floor"],
    capacity: "available",
    optedIn: false,
    previewMode: false,
    description:
      "Moderate performer, not opted in — Test opt-in flow with average signals",
    episodeCount: 10,
    expectedSignalProfile: {
      outcomeTrajectory: "moderate",
      clinicalDecision: "moderate",
      patientPreference: "moderate",
    },
  },
];

export interface GPScenario {
  id: string;
  name: string;
  practiceName: string;
  region: string;
}

export const gpScenarios: GPScenario[] = [
  {
    id: "gp-alice",
    name: "Alice Thompson",
    practiceName: "Highgate Medical Centre",
    region: "North Sydney",
  },
  {
    id: "gp-robert",
    name: "Robert Osei",
    practiceName: "Clapham Common Practice",
    region: "South Sydney",
  },
  {
    id: "gp-emma",
    name: "Emma Wilson",
    practiceName: "Stratford Health Partnership",
    region: "East Melbourne",
  },
];

export interface GPPatientNoteScenario {
  gpId: string;
  patientId: string;
  notes: string;
}

export const gpPatientNoteScenarios: GPPatientNoteScenario[] = [
  {
    gpId: "gp-alice",
    patientId: "patient-1",
    notes: "Patient presents with chronic lower back pain, 3 months duration. Conservative management attempted including NSAIDs and rest. Pain radiating to left leg. Recommending physiotherapy assessment for rehabilitation program.",
  },
  {
    gpId: "gp-alice",
    patientId: "patient-5",
    notes: "Right knee pain following recreational football injury 2 weeks ago. X-ray clear, no fracture. Mild swelling persists. Physio referral for assessment and rehabilitation.",
  },
  {
    gpId: "gp-alice",
    patientId: "patient-9",
    notes: "Shoulder impingement suspected. Patient reports pain with overhead activities. Occupation: office worker with prolonged computer use. Referral for physiotherapy and ergonomic assessment.",
  },
  {
    gpId: "gp-alice",
    patientId: "patient-13",
    notes: "Post-surgical rehabilitation needed. Patient 6 weeks post ACL reconstruction. Surgeon cleared for physio. Focus on strength and ROM restoration.",
  },
  {
    gpId: "gp-alice",
    patientId: "patient-17",
    notes: "Chronic neck pain with cervicogenic headaches. Stress-related muscle tension likely contributing. Physiotherapy for manual therapy and postural education recommended.",
  },
  {
    gpId: "gp-robert",
    patientId: "patient-2",
    notes: "Tennis elbow diagnosis. Patient is keen cyclist, symptoms aggravated by gripping handlebars. Needs physio input for tendon rehabilitation.",
  },
  {
    gpId: "gp-robert",
    patientId: "patient-6",
    notes: "Hip osteoarthritis, moderate severity. Patient wishes to delay surgical intervention. Referral for physiotherapy to maintain mobility and manage pain.",
  },
  {
    gpId: "gp-robert",
    patientId: "patient-10",
    notes: "Plantar fasciitis, right foot. Morning heel pain significant. Previous orthotics helpful but symptoms returning. Physio assessment for gait analysis and treatment.",
  },
  {
    gpId: "gp-emma",
    patientId: "patient-3",
    notes: "Recurring ankle instability following multiple sprains. Sports participation limited. Referral for proprioceptive training and strengthening program.",
  },
  {
    gpId: "gp-emma",
    patientId: "patient-7",
    notes: "Rotator cuff strain. Patient works in warehouse, overhead lifting required. Need physio assessment for return to work planning.",
  },
  {
    gpId: "gp-emma",
    patientId: "patient-11",
    notes: "Sciatica symptoms, L5 distribution. MRI pending but conservative management appropriate. Physio for McKenzie assessment and pain management.",
  },
];

export interface PatientProfile {
  name: string;
  dateOfBirth: string;
  region: string;
}

// Helper to generate realistic patient profiles
export function generatePatientProfiles(count: number): PatientProfile[] {
  const firstNames = [
    "John",
    "Mary",
    "David",
    "Sarah",
    "Michael",
    "Emma",
    "James",
    "Lisa",
    "Robert",
    "Anna",
    "William",
    "Sophie",
    "Thomas",
    "Emily",
    "Daniel",
    "Jessica",
    "Christopher",
    "Rachel",
    "Matthew",
    "Hannah",
    "Andrew",
    "Laura",
    "Richard",
    "Charlotte",
    "Mark",
    "Rebecca",
    "Paul",
    "Amy",
    "Steven",
    "Jennifer",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Thompson",
    "White",
    "Harris",
    "Clark",
    "Lewis",
    "Robinson",
    "Walker",
    "Young",
    "Allen",
    "King",
    "Wright",
    "Scott",
  ];
  const regions = ["North Sydney", "South Sydney", "East Melbourne", "West Perth"];

  const patients: PatientProfile[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length)];
    const year = 1950 + (i % 50);
    const month = String((i % 12) + 1).padStart(2, "0");
    const day = String(((i * 7) % 28) + 1).padStart(2, "0");

    patients.push({
      name: `${firstName} ${lastName}`,
      dateOfBirth: `${year}-${month}-${day}`,
      region: regions[i % regions.length],
    });
  }
  return patients;
}

export interface TransitionScenario {
  id: string;
  originPhysioId: string;
  destinationPhysioId: string;
  transitionType: "gp-referral" | "patient-booking" | "physio-handoff";
  /** The transition status to seed — determines how much of the flow is pre-populated */
  targetStatus:
    | "consent-pending"
    | "review-pending"
    | "released";
  description: string;
}

export const transitionScenarios: TransitionScenario[] = [
  {
    id: "transition-sarah-maya",
    originPhysioId: "physio-sarah",
    destinationPhysioId: "physio-maya",
    transitionType: "physio-handoff",
    targetStatus: "released",
    description:
      "Complete happy path — Sarah handed off to Maya, summary reviewed and released",
  },
  {
    id: "transition-james-sarah",
    originPhysioId: "physio-james",
    destinationPhysioId: "physio-sarah",
    transitionType: "gp-referral",
    targetStatus: "review-pending",
    description:
      "Summary generated and awaiting review by James",
  },
  {
    id: "transition-tom-james",
    originPhysioId: "physio-tom",
    destinationPhysioId: "physio-james",
    transitionType: "physio-handoff",
    targetStatus: "consent-pending",
    description:
      "Patient hasn't consented yet — Tom initiated handoff to James",
  },
  {
    id: "transition-maya-tom",
    originPhysioId: "physio-maya",
    destinationPhysioId: "physio-tom",
    transitionType: "patient-booking",
    targetStatus: "released",
    description:
      "Patient-initiated transition — Maya to Tom, summary released",
  },
];

export interface EpisodeTemplate {
  condition: string;
  isGpReferred: boolean;
  visitCount: number;
  status: "active" | "discharged" | "self-discharged" | "transferred";
  painProgression: number[]; // Pain scores over visits (0-10)
  functionProgression: number[]; // Function scores over visits (0-100)
  escalationVisits: number[]; // Which visit numbers had escalations
  adjustmentVisits: number[]; // Which visit numbers had treatment adjustments
}

// Generate realistic episode templates for each physio type
export function generateEpisodeTemplates(
  profile: PhysioScenario["expectedSignalProfile"],
  count: number
): EpisodeTemplate[] {
  const templates: EpisodeTemplate[] = [];
  const conditions = [
    "Lower back pain",
    "Knee osteoarthritis",
    "Shoulder impingement",
    "Ankle sprain",
    "Rotator cuff injury",
    "Hip pain",
    "Neck pain",
    "Tennis elbow",
    "Plantar fasciitis",
    "Post-ACL surgery",
  ];

  for (let i = 0; i < count; i++) {
    const condition = conditions[i % conditions.length];
    const isGpReferred = Math.random() > 0.4; // 60% GP referred
    const visitCount = 4 + Math.floor(Math.random() * 9); // 4-12 visits

    let status: EpisodeTemplate["status"] = "discharged";
    if (i === 0 && Math.random() > 0.5) status = "active"; // Some active episodes
    if (profile.outcomeTrajectory === "mixed" && Math.random() > 0.8)
      status = "self-discharged";

    // Generate pain progression
    const painProgression: number[] = [];
    let currentPain = 6 + Math.floor(Math.random() * 3); // Start 6-8
    for (let v = 0; v < visitCount; v++) {
      painProgression.push(currentPain);
      if (profile.outcomeTrajectory === "strong") {
        currentPain = Math.max(0, currentPain - 1 - Math.floor(Math.random() * 2));
      } else if (profile.outcomeTrajectory === "moderate") {
        currentPain = Math.max(1, currentPain - Math.floor(Math.random() * 2));
      } else if (profile.outcomeTrajectory === "emerging") {
        currentPain = Math.max(2, currentPain - Math.floor(Math.random() * 1.5));
      } else {
        // mixed
        currentPain = Math.max(
          1,
          currentPain + (Math.random() > 0.5 ? -1 : 0)
        );
      }
    }

    // Generate function progression
    const functionProgression: number[] = [];
    let currentFunction = 40 + Math.floor(Math.random() * 20); // Start 40-60
    for (let v = 0; v < visitCount; v++) {
      functionProgression.push(currentFunction);
      if (profile.outcomeTrajectory === "strong") {
        currentFunction = Math.min(95, currentFunction + 5 + Math.floor(Math.random() * 5));
      } else if (profile.outcomeTrajectory === "moderate") {
        currentFunction = Math.min(85, currentFunction + 3 + Math.floor(Math.random() * 4));
      } else if (profile.outcomeTrajectory === "emerging") {
        currentFunction = Math.min(75, currentFunction + 2 + Math.floor(Math.random() * 3));
      } else {
        // mixed
        currentFunction = Math.min(
          80,
          currentFunction + Math.floor(Math.random() * 3)
        );
      }
    }

    // Escalation visits (good decision-making = earlier escalations when needed)
    const escalationVisits: number[] = [];
    if (profile.clinicalDecision === "strong" && Math.random() > 0.7) {
      escalationVisits.push(2 + Math.floor(Math.random() * 2)); // Early escalation
    } else if (profile.clinicalDecision === "mixed" && Math.random() > 0.8) {
      escalationVisits.push(5 + Math.floor(Math.random() * 3)); // Late escalation
    }

    // Treatment adjustment visits
    const adjustmentVisits: number[] = [];
    if (profile.clinicalDecision !== "emerging") {
      const adjustmentCount =
        profile.clinicalDecision === "strong" ? 2 : 1;
      for (let a = 0; a < adjustmentCount; a++) {
        adjustmentVisits.push(2 + a * 3);
      }
    }

    templates.push({
      condition,
      isGpReferred,
      visitCount,
      status,
      painProgression,
      functionProgression,
      escalationVisits,
      adjustmentVisits,
    });
  }

  return templates;
}
