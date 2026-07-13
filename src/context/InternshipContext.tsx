import React, { useMemo, useState } from "react";
import { useMyInternshipHistory } from "../hooks/useInternships";
import { useAuth } from "./useAuth";
import {
  InternshipContext,
  type InternshipContextType,
} from "./InternshipContextValue";

function storageKey(userId: string) {
  return `siwes_selected_internship_${userId}`;
}

interface InternshipProviderProps {
  children: React.ReactNode;
}

export const InternshipProvider: React.FC<InternshipProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const { data, isLoading } = useMyInternshipHistory({ enabled: isStudent });
  const internships = useMemo(
    () => (isStudent ? (data?.data ?? []) : []),
    [data, isStudent],
  );
  const internshipIdsKey = useMemo(
    () => internships.map((i) => i._id).join(","),
    [internships],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const effectiveKey = isStudent ? `${user?.id ?? ""}:${internshipIdsKey}` : "";
  const [processedKey, setProcessedKey] = useState<string | null>(null);

  if (effectiveKey !== processedKey) {
    setProcessedKey(effectiveKey);
    if (!isStudent || !user || internships.length === 0) {
      setSelectedId(null);
    } else {
      const stored = sessionStorage.getItem(storageKey(user.id));
      const storedIsValid =
        !!stored && internships.some((i) => i._id === stored);
      if (storedIsValid) {
        setSelectedId(stored);
      } else {
        const current = internships.find((i) => i.isCurrent) ?? internships[0];
        setSelectedId(current._id);
      }
    }
  }

  const selectInternship = (id: string) => {
    setSelectedId(id);
    if (user) sessionStorage.setItem(storageKey(user.id), id);
  };

  const selectedInternship =
    internships.find((i) => i._id === selectedId) ?? null;

  const value: InternshipContextType = {
    internships,
    selectedInternshipId: selectedId,
    selectedInternship,
    isMultiple: internships.length > 1,
    isLoading: isStudent && isLoading,
    selectInternship,
  };

  return (
    <InternshipContext.Provider value={value}>
      {children}
    </InternshipContext.Provider>
  );
};
