// The fixed 4-day plan. group: same letter = superset, null = standalone.
export const PLAN = {
  d1: { name: "Day 1", sub: "Chest, Shoulders + Quads", lifts: [
    { name: "Hack Squat", sets: 3, reps: "6-8", group: null },
    { name: "Bench Press", sets: 4, reps: "8-10", group: null },
    { name: "Incline DB Press", sets: 3, reps: "10-12", group: null },
    { name: "Seated DB Shoulder Press", sets: 3, reps: "10", group: "A" },
    { name: "DB Curl", sets: 3, reps: "12", group: "A" },
    { name: "Cable Lateral Raise", sets: 3, reps: "15", group: "B" },
    { name: "Cable Pushdown", sets: 3, reps: "12", group: "B" },
  ] },
  d2: { name: "Day 2", sub: "Back, Biceps + Hinge", lifts: [
    { name: "Hex Bar Deadlift", sets: 3, reps: "5-6", group: null },
    { name: "Chin-Ups", sets: 4, reps: "AMRAP", group: null },
    { name: "Chest-Supported Row", sets: 4, reps: "10", group: null },
    { name: "Straight Arm Pulldown", sets: 3, reps: "12", group: null },
    { name: "Incline DB Curl", sets: 3, reps: "12", group: "A" },
    { name: "Barbell Shrugs", sets: 3, reps: "15", group: "A" },
  ] },
  d3: { name: "Day 3", sub: "Chest, Shoulders, Triceps", lifts: [
    { name: "Incline Barbell Press", sets: 4, reps: "8-10", group: null },
    { name: "Dips", sets: 3, reps: "10", group: null },
    { name: "Seated DB Shoulder Press", sets: 4, reps: "10", group: null },
    { name: "Cable Chest Fly", sets: 3, reps: "12", group: "A" },
    { name: "Cable Lateral Raise", sets: 3, reps: "15", group: "A" },
    { name: "Reverse Grip Pushdown", sets: 3, reps: "12", group: null },
    { name: "Preacher Curl", sets: 3, reps: "12", group: null },
  ] },
  d4: { name: "Day 4", sub: "Back + Arms", lifts: [
    { name: "Lat Pulldown", sets: 4, reps: "10", group: null },
    { name: "Lawnmower Row", sets: 4, reps: "10", group: null },
    { name: "Cable Curl", sets: 3, reps: "12", group: "A" },
    { name: "Cable Pushdown", sets: 3, reps: "12", group: "A" },
    { name: "Seated Cable Row", sets: 3, reps: "12", group: "B" },
    { name: "Face Pull", sets: 3, reps: "15", group: "B" },
    { name: "Skull Crushers", sets: 3, reps: "12", group: "C" },
    { name: "EZ-bar Curl", sets: 3, reps: "12", group: "C" },
  ] },
};
