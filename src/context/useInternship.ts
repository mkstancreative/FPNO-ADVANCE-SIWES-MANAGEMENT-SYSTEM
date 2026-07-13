import { useContext } from "react";
import {
  InternshipContext,
  type InternshipContextType,
} from "./InternshipContextValue";

export function useInternship(): InternshipContextType {
  const ctx = useContext(InternshipContext);
  if (!ctx) {
    throw new Error("useInternship must be used within an InternshipProvider");
  }
  return ctx;
}
