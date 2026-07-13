import { createContext } from "react";
import type { Internship } from "../api/types/internship";

export interface InternshipContextType {
  internships: Internship[];
  selectedInternshipId: string | null;
  selectedInternship: Internship | null;
  /** True once there's more than one internship to choose between. */
  isMultiple: boolean;
  isLoading: boolean;
  /** Client-side viewing selector only — does not call PUT /internships/:id/set-current
   * (that endpoint is admin/coordinator-only). */
  selectInternship: (id: string) => void;
}

export const InternshipContext = createContext<
  InternshipContextType | undefined
>(undefined);
