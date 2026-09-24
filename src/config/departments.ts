// Source: "List of Schools and Departments.xlsx" (institution register of
// schools, departments and HND specializations). Regenerate this file from the
// spreadsheet rather than hand-editing individual entries.

export type ProgramType = "ND" | "HND";

export interface DepartmentEntry {
  /** Department or specialization name, as the institution lists it. */
  name: string;
  /** Institution department code. Specializations share their base code. */
  code: string;
  /** School (faculty) the department sits under. */
  school: string;
  /** School code, e.g. "SICT". */
  schoolCode: string;
  /** Programmes the department admits into. */
  programs: ProgramType[];
  /** True for an HND specialization offered under a base department. */
  isSpecialization: boolean;
}

export interface School {
  name: string;
  code: string;
}

export const SCHOOLS: School[] = [
  { name: "Information & Communication Technology", code: "SICT" },
  { name: "Industrial & Applied Sciences", code: "SIAS" },
  { name: "Health & Technology", code: "SOHT" },
  { name: "Environmental Design & Technology", code: "SEDT" },
  { name: "Engineering Technology", code: "SET" },
  { name: "Business & Management Technology", code: "SBMT" },
  { name: "Agriculture & Agricultural Technology", code: "SAAT" },
];

export const DEPARTMENTS: DepartmentEntry[] = [
  {
    name: "Computer Science",
    code: "CS",
    school: "Information & Communication Technology",
    schoolCode: "SICT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Networking and Cloud Computing",
    code: "CS",
    school: "Information & Communication Technology",
    schoolCode: "SICT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Software and Web Development",
    code: "CS",
    school: "Information & Communication Technology",
    schoolCode: "SICT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Library and Information Science",
    code: "LIS",
    school: "Information & Communication Technology",
    schoolCode: "SICT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Mass Communication",
    code: "MC",
    school: "Information & Communication Technology",
    schoolCode: "SICT",
    programs: ["ND"],
    isSpecialization: false,
  },
  {
    name: "Journalism and Media Studies",
    code: "JMS",
    school: "Information & Communication Technology",
    schoolCode: "SICT",
    programs: ["HND"],
    isSpecialization: false,
  },
  {
    name: "Science Laboratory Technology",
    code: "ST",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Biology/Microbiology",
    code: "ST-MB",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Chemistry/Biochemistry",
    code: "ST-CH",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Environmental Biology",
    code: "ST-EVB",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Microbiology/Biochemistry",
    code: "ST-MBC",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Physics/Electronics",
    code: "ST-PHY",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Food Science and Technology",
    code: "FST",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Maths and Statistics",
    code: "STA",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Hospitality Management",
    code: "HMT",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Tourism Management Technology",
    code: "TMT",
    school: "Industrial & Applied Sciences",
    schoolCode: "SIAS",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Dispensing Opticianry",
    code: "DOP",
    school: "Health & Technology",
    schoolCode: "SOHT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Pharmaceutical Technology",
    code: "PMT",
    school: "Health & Technology",
    schoolCode: "SOHT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Arts and Design Technology",
    code: "AD",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Graphics",
    code: "AD",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Painting",
    code: "AD",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Ceramics",
    code: "AD",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Sculpture",
    code: "AD",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Textile",
    code: "AD",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Architectural Technology",
    code: "AR",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Building Technology",
    code: "BT",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Estate Management Technology",
    code: "EM",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Quantity Surveying Technology",
    code: "QS",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Urban and Regional Planning Technology",
    code: "URP",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Surveying and Geoinformatics Technology",
    code: "SUG",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Printing Technology",
    code: "PT",
    school: "Environmental Design & Technology",
    schoolCode: "SEDT",
    programs: ["ND"],
    isSpecialization: false,
  },
  {
    name: "Electrical/Electronics Engineering",
    code: "EE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Power",
    code: "EE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Instrumentation and Control",
    code: "EE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Telecommunication",
    code: "EE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Mechanical Engineering",
    code: "ME",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Power Plant Engineering",
    code: "ME",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Manufacturing Engineering",
    code: "ME",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Welding and Fabrication Engineering Tech",
    code: "WF",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND"],
    isSpecialization: false,
  },
  {
    name: "Agric/Bio-Environmental Engineering",
    code: "AE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Soil/Water Resources",
    code: "AE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Post Harvest",
    code: "AE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Farm Power and Machinery Engineering",
    code: "AE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Civil Engineering",
    code: "CE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Computer Engineering",
    code: "CTE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Chemical Engineering",
    code: "CHE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Mechatronics Engineering",
    code: "MCE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Metallurgical and Material Engineering",
    code: "MME",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Mineral and Petroleum Resources Engineering",
    code: "MPE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Mining Engineering",
    code: "MPE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Geological Engineering",
    code: "MPE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Petroleum Engineering",
    code: "MPE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Hydrology and Water Resources Management",
    code: "HWR",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND"],
    isSpecialization: false,
  },
  {
    name: "Water Resources Engineering Technology",
    code: "WRE",
    school: "Engineering Technology",
    schoolCode: "SET",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Accountancy",
    code: "AC",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Banking and Finance",
    code: "BF",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Business Administration and Management",
    code: "BAM",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Procurement and Supply Chain Management",
    code: "PSCM",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Marketing",
    code: "MK",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Cooperative Economics and Management",
    code: "CEM",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Office Technology and Management",
    code: "OTM",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Public Administration",
    code: "PA",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Taxation",
    code: "TXN",
    school: "Business & Management Technology",
    schoolCode: "SBMT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Agricultural Technology",
    code: "AGT",
    school: "Agriculture & Agricultural Technology",
    schoolCode: "SAAT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Agricultural Extension and Management",
    code: "AEM",
    school: "Agriculture & Agricultural Technology",
    schoolCode: "SAAT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Crop Production Technology",
    code: "CPT",
    school: "Agriculture & Agricultural Technology",
    schoolCode: "SAAT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Soil Science and Land Resources Management",
    code: "SST",
    school: "Agriculture & Agricultural Technology",
    schoolCode: "SAAT",
    programs: ["HND"],
    isSpecialization: true,
  },
  {
    name: "Fisheries Technology",
    code: "FIT",
    school: "Agriculture & Agricultural Technology",
    schoolCode: "SAAT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
  {
    name: "Animal Health and Production Technology",
    code: "AHT",
    school: "Agriculture & Agricultural Technology",
    schoolCode: "SAAT",
    programs: ["ND", "HND"],
    isSpecialization: false,
  },
];

/** Departments grouped by school, in institution order — ready for <optgroup>. */
export const DEPARTMENTS_BY_SCHOOL: {
  school: School;
  departments: DepartmentEntry[];
}[] = SCHOOLS.map((school) => ({
  school,
  departments: DEPARTMENTS.filter((d) => d.schoolCode === school.code),
}));

/** Flat list of every selectable department name. */
export const DEPARTMENT_NAMES: string[] = DEPARTMENTS.map((d) => d.name);

/** Look a department up by name, case- and whitespace-insensitively. */
export function findDepartment(name: string): DepartmentEntry | undefined {
  const needle = name.trim().toLowerCase();
  return DEPARTMENTS.find((d) => d.name.toLowerCase() === needle);
}

/** A department name the API reports that is not in the institution catalogue. */
export const OTHER_DEPARTMENTS_GROUP = "Other";

/**
 * Merge the institution catalogue with department names the API reports.
 * Catalogue names come first in institution order; anything the API knows about
 * that the catalogue doesn't (legacy or renamed departments) is appended, so a
 * department already attached to real records never becomes unselectable.
 */
export function mergeDepartmentNames(
  apiNames?: string[],
  /** Keep only catalogue departments admitting this programme. */
  program?: ProgramType,
): string[] {
  const known = new Set(DEPARTMENTS.map((d) => d.name.toLowerCase()));
  const extras = (apiNames ?? []).filter(
    (name) => name && !known.has(name.trim().toLowerCase()),
  );
  // Names the API reports but the catalogue does not know carry no programme
  // information, so they survive the filter rather than vanishing from a list
  // a real record may already point at.
  const catalogue = program
    ? DEPARTMENTS.filter((d) => d.programs.includes(program)).map((d) => d.name)
    : DEPARTMENT_NAMES;
  return [...catalogue, ...Array.from(new Set(extras))];
}

export interface DepartmentOption {
  value: string;
  label: string;
  /** School the department belongs to — rendered as a group heading. */
  group: string;
}

/**
 * Catalogue departments as grouped select options, plus any extra API names.
 *
 * Pass a `program` to narrow the list to departments that admit it — several
 * are ND-only, and the HND specializations exist only under HND.
 */
export function departmentOptions(
  apiNames?: string[],
  program?: ProgramType,
): DepartmentOption[] {
  return mergeDepartmentNames(apiNames, program).map((name) => ({
    value: name,
    label: name,
    group: findDepartment(name)?.school ?? OTHER_DEPARTMENTS_GROUP,
  }));
}
