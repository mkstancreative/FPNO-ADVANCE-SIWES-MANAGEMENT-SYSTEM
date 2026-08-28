import { useStudentDashboard } from "./useDashboard";
import { useAuth } from "../context/useAuth";
import { useInternship } from "../context/useInternship";

/**
 * Which fee a student actually owes. The two are mutually exclusive and the
 * backend enforces it — calling `/internships/initiate-payment` as a
 * self-registered student is rejected with "Self-registered students do not pay
 * an internship fee", so the track has to be known *before* any payment
 * endpoint is touched.
 *
 *   self-registered (external) → pays the certificate fee directly
 *   platform student           → pays the internship fee, which covers the
 *                                certificate ("covered")
 *
 * `selfRegistered` lives only on the student dashboard payload, so this reads
 * it from there using the same query params the dashboard page passes — the
 * cache entry is shared and no extra request is made when moving between them.
 */
export const useStudentFeeTrack = () => {
  const { user } = useAuth();
  const { selectedInternshipId } = useInternship();

  const { data, isLoading } = useStudentDashboard(
    { internshipId: selectedInternshipId ?? undefined },
    { enabled: user?.role === "student" && !user?.mustChangePassword },
  );

  const selfRegistered = data?.data?.student?.selfRegistered;

  return {
    isLoading,
    /** `undefined` until the dashboard resolves. */
    selfRegistered,
    /**
     * Strict equality on purpose: while the track is unknown, neither flag is
     * true, so no screen can fire a payment call it might have to apologise for.
     */
    paysInternshipFee: selfRegistered === false,
    paysCertificateFee: selfRegistered === true,
  };
};
