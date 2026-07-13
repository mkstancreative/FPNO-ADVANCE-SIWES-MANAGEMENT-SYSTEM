/** Shared utility functions for the Report components */

export function gradeClass(grade: string): string {
  if (grade === "A" || grade === "A+") return "grade-a";
  if (grade === "B") return "grade-b";
  if (grade === "C") return "grade-c";
  return "grade-d";
}

export function formatBreakdownKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function maxForKey(key: string): number {
  const maxes: Record<string, number> = {
    logbookQuality: 30,
    logbookConsistency: 20,
    technicalSkills: 20,
    professionalGrowth: 15,
    challengesOvercome: 10,
    communication: 5,
  };
  return maxes[key] ?? 10;
}
