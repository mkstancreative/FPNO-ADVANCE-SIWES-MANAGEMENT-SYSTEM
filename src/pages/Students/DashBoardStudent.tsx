import { CheckCircle2, TrendingUp } from "lucide-react";
import { useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStudentDashboard } from "../../hooks/useDashboard";
import {
  useCertificateFee,
  useCertificateStatus,
  useInitiateCertificatePayment,
  useVerifyCertificatePayment,
} from "../../hooks/useCertificate";
import {
  useInitiateInternshipPayment,
  useInternshipPaymentStatus,
} from "../../hooks/useInternshipPayment";
import {
  useCertificateDownload,
  useRequestFormDownload,
} from "../../hooks/useCertificateDownload";
import { useModal } from "../../context/ModalContext";
import {
  SectionHead,
  DashboardSkeleton,
  DashboardBanner,
  DashboardError,
} from "../../components/shared/dashboard/DashboardKit";
import "../../components/shared/dashboard/dashboard.css";
import { RequestForm } from "../../components/student/view/ITForm/RequestForm";
import { CertificateRequestModal } from "../../components/student/view/CertificateRequestModal";
import { PaymentVerificationModal } from "../../components/student/view/PaymentVerificationModal";
import VerifyRRRModal from "../../components/student/view/VerifyRRRModal";
import CustomConfirm from "../../components/ui/CustomConfirm";
import Certificate from "../../components/student/view/Certificate/Certificate";
import { CertificateStatusBanner } from "../../components/student/dashboard/CertificateStatusBanner";
import { InternshipFeeBanner } from "../../components/student/dashboard/InternshipFeeBanner";
import { StudentMetricsGrid } from "../../components/student/dashboard/StudentMetricsGrid";
import { ProgressSection } from "../../components/student/dashboard/ProgressSection";
import { FinalDetailsSection } from "../../components/student/dashboard/FinalDetailsSection";
import { NotificationsSection } from "../../components/student/dashboard/NotificationsSection";
import type {
  CertificateNextAction,
  RRRData,
} from "../../api/types/certificate";
import {
  isActionUnlocked,
  isFeeSettled,
} from "../../helpers/certificateFlow";
import { useStudentFeeTrack } from "../../hooks/useStudentFeeTrack";
import { fmt, ago } from "../../helpers/utilities";
import { useInternship } from "../../context/useInternship";
import { useAuth } from "../../context/useAuth";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashBoardStudent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedInternshipId } = useInternship();
  const { user } = useAuth();
  const canFetch = !user?.mustChangePassword;
  const { data: resp, isLoading: loadingStats } = useStudentDashboard(
    { internshipId: selectedInternshipId ?? undefined },
    { enabled: canFetch },
  );
  const { data: certStatus, isLoading: loadingCert } = useCertificateStatus({
    enabled: canFetch,
  });
  // Answers even when no request exists, where `/certificates/status` 404s —
  // this is what gives a fresh external student a way in.
  const { data: certFee, isLoading: loadingCertFee } = useCertificateFee({
    enabled: canFetch,
  });
  const internshipScope = useMemo(
    () => ({ internshipId: selectedInternshipId ?? undefined }),
    [selectedInternshipId],
  );
  // Self-registered students owe a certificate fee, not an internship fee, and
  // the internship endpoints reject them outright — so this gates the query as
  // well as the button. Shares the dashboard's cache entry, no extra request.
  const { paysInternshipFee } = useStudentFeeTrack();
  const { data: internshipPayment, isLoading: loadingInternshipPayment } =
    useInternshipPaymentStatus(internshipScope, {
      enabled: canFetch && paysInternshipFee,
    });
  const { openModal, closeModal } = useModal();
  const { mutate: verify } = useVerifyCertificatePayment();
  const { mutate: initiateCertPayment, isPending: startingCertPayment } =
    useInitiateCertificatePayment();
  const {
    mutate: initiateInternshipPayment,
    isPending: startingInternshipPayment,
  } = useInitiateInternshipPayment();
  const { certRef, downloadingCert, certData, handleDownloadCert } =
    useCertificateDownload();
  const { reqRef, downloadingReq, handleDownloadReq } =
    useRequestFormDownload();

  // Fallback for a Remita redirect that lands here instead of /payment/success.
  useEffect(() => {
    const orderId = searchParams.get("orderId") || searchParams.get("RRR");
    const cert = certStatus?.data;
    if (orderId && cert && !isFeeSettled(cert.paymentStatus)) {
      verify(
        { orderId: orderId, rrr: orderId },
        {
          onSuccess: (res) => {
            if (res.success) {
              setSearchParams({}, { replace: true });
            }
          },
        },
      );
    }
  }, [searchParams, certStatus, verify, setSearchParams]);

  const openPaymentModal = useCallback(
    (data: RRRData, flow: "certificate" | "internship" = "certificate") => {
      openModal(
        <PaymentVerificationModal
          isOpen
          flow={flow}
          scope={internshipScope}
          onClose={closeModal}
          data={{
            rrr: data.rrr || "Pending",
            amount: data.amount ?? 0,
            orderId: data.orderId?.trim() ?? "",
            merchantId: data.merchantId,
            certificateId: data.certificateId,
            internshipId: data.internshipId,
          }}
        />,
      );
    },
    [openModal, closeModal, internshipScope],
  );

  const selfRegistered = resp?.data?.student?.selfRegistered !== false;

  const openRequestModal = useCallback(
    (requestId?: string) => {
      openModal(
        <CertificateRequestModal
          isOpen
          requestId={requestId}
          selfRegistered={selfRegistered}
          internshipId={
            resp?.data?.internshipId ?? selectedInternshipId ?? undefined
          }
          batchId={resp?.data?.batch?._id ?? undefined}
          batchName={resp?.data?.batch?.name ?? undefined}
          batchSession={resp?.data?.batch?.session ?? undefined}
          placementCompany={resp?.data?.placement?.company ?? undefined}
          onClose={closeModal}
        />,
      );
    },
    [openModal, closeModal, resp, selectedInternshipId, selfRegistered],
  );

  /** Opens the student's own RRR check, on whichever flow they belong to. */
  const openVerifyRRR = useCallback(
    (defaultRRR?: string) => {
      openModal(<VerifyRRRModal defaultRRR={defaultRRR} onClose={closeModal} />);
    },
    [openModal, closeModal],
  );

  /** Raise a fresh internship order, then hand the RRR to the payment widget. */
  const startInternshipPayment = useCallback(() => {
    if (!paysInternshipFee) return;

    const existing = internshipPayment?.data;

    // The backend is telling us the money may already be in — send the student
    // to the check, not back to a payment screen they do not need.
    if (existing?.nextAction === "verify") {
      openVerifyRRR(existing.rrr);
      return;
    }

    // A live reference is reusable — only mint a new order when there is none.
    if (existing?.rrr && existing.nextAction !== "regenerate_rrr") {
      openPaymentModal(
        {
          rrr: existing.rrr,
          amount: existing.amount ?? 0,
          orderId: existing.orderId ?? "",
          merchantId: existing.merchantId,
          internshipId: existing.internshipId,
        },
        "internship",
      );
      return;
    }

    initiateInternshipPayment(internshipScope, {
      onSuccess: (res) => {
        if (res.success && res.data) openPaymentModal(res.data, "internship");
      },
    });
  }, [
    paysInternshipFee,
    internshipPayment,
    internshipScope,
    initiateInternshipPayment,
    openPaymentModal,
    openVerifyRRR,
  ]);

  /**
   * Certificate payment, step 1. Platform students never reach this — their
   * internship fee covers the certificate, so an unpaid one sends them to the
   * internship fee instead.
   */
  const startCertificatePayment = useCallback(() => {
    if (paysInternshipFee) {
      startInternshipPayment();
      return;
    }

    const existing = certStatus?.data;
    if (existing?.rrr && existing.rrr !== "Pending") {
      openPaymentModal(
        {
          rrr: existing.rrr,
          amount: existing.amount ?? 0,
          orderId: existing.orderId ?? "",
          merchantId: existing.merchantId,
          certificateId: existing.certificateId,
        },
        "certificate",
      );
      return;
    }

    initiateCertPayment(undefined, {
      onSuccess: (res) => {
        if (res.success && res.data) openPaymentModal(res.data, "certificate");
      },
    });
  }, [
    paysInternshipFee,
    startInternshipPayment,
    certStatus,
    initiateCertPayment,
    openPaymentModal,
  ]);

  const openRejectionDetails = useCallback(
    (id: string, reason: string) => {
      openModal(
        <CustomConfirm
          isOpen={true}
          onClose={closeModal}
          title="Request Rejected"
          message={`Your certificate request was not approved. Reason: "${reason}". Would you like to update your details and re-apply now?`}
          confirmText="Re-apply Now"
          variant="danger"
          onConfirm={() => {
            closeModal();
            setTimeout(() => openRequestModal(id), 50);
          }}
        />,
      );
    },
    [openModal, closeModal, openRequestModal],
  );

  const openPendingDetails = useCallback(
    (data: {
      requestId?: string;
      paymentStatus?: string;
      requestDate?: string;
    }) => {
      openModal(
        <CustomConfirm
          isOpen={true}
          onClose={closeModal}
          title="Request Pending Review"
          message={
            <div style={{ textAlign: "left", marginTop: "10px" }}>
              <p>
                Your certificate request has been received and is currently
                awaiting administrative review.
              </p>
              <div
                style={{
                  marginTop: "15px",
                  fontSize: "14px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Request ID:
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    #{data.requestId ? data.requestId.slice(-8).toUpperCase() : ""}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Payment Status:
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#10b981",
                      textTransform: "capitalize",
                    }}
                  >
                    {data.paymentStatus}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Request Date:
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {data.requestDate
                      ? new Date(data.requestDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )
                      : "Pending"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Current Status:
                  </span>
                  <span style={{ fontWeight: 600, color: "#f59e0b" }}>
                    Awaiting Approval
                  </span>
                </div>
              </div>
            </div>
          }
          confirmText="Got it"
          variant="info"
          onConfirm={closeModal}
        />,
      );
    },
    [openModal, closeModal],
  );

  /**
   * One dispatcher for every certificate CTA, so the banner and the KPI card
   * can never send the student to different screens for the same state.
   */
  const handleCertificateAction = useCallback(
    (action: CertificateNextAction) => {
      const cert = certStatus?.data;
      // Belt-and-braces: the banner and KPI card already withhold this action
      // before the IT is completed, so reaching here means something slipped.
      if (!isActionUnlocked(action, resp?.data?.student?.itStatus)) return;

      switch (action) {
        case "pay":
          startCertificatePayment();
          break;
        case "upload_documents":
        case "request_internship_certificate":
          openRequestModal();
          break;
        case "resubmit":
          openRejectionDetails(
            cert?.requestId || "",
            cert?.rejectionReason || "No reason provided",
          );
          break;
        case "download":
          handleDownloadCert(cert?.canDownload || false);
          break;
        case "await_approval":
        default:
          openPendingDetails(cert ?? {});
          break;
      }
    },
    [
      certStatus,
      resp,
      startCertificatePayment,
      openRequestModal,
      openRejectionDetails,
      openPendingDetails,
      handleDownloadCert,
    ],
  );

  if (!canFetch) return null;
  if (loadingStats) return <DashboardSkeleton cards={8} wide />;
  if (!resp?.data) return <DashboardError />;

  const certificate = certStatus?.data;

  const {
    student,
    placement,
    supervisors,
    progress,
    logbooks,
    evaluation,
    report,
    notifications,
  } = resp.data;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Hidden render targets for PDF export */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <Certificate
          ref={certRef}
          studentName={
            certData
              ? `${certData.user.firstName} ${certData.user.lastName}`
              : student.name
          }
          regNumber={
            certData?.student.registrationNumber || student.registrationNumber
          }
          department={certData?.student.department.name || student.department}
          program={certData?.student.program.type || student.program}
          level={
            certData
              ? certData.student.program.type === "HND"
                ? "HND"
                : "ND"
              : student.program.includes("HND")
                ? "HND"
                : "ND"
          }
          graduationDate={
            certData?.graduationDate || new Date().toLocaleDateString("en-GB")
          }
          graduationMonth={
            certData?.graduationMonth || certificate?.graduationMonth
          }
          graduationYear={
            certData?.graduationYear || certificate?.graduationYear
          }
          organizationName={
            certData?.placeOfIT || placement.company || certificate?.placeOfIT
          }
          serialNumber={certData?._id || certificate?.requestId || "3845"}
          certificateNumber={certificate?.certificateNumber}
          itStartDate={
            certData?.student.batch?.itPeriod?.startDate || progress.startDate
          }
          itEndDate={
            certData?.student.batch?.itPeriod?.endDate || progress.endDate
          }
          issueDate={
            certData?.issuedAt ||
            certificate?.issuedAt ||
            certData?.graduationDate ||
            certificate?.graduationDate
          }
          issuedAt={certData?.issuedAt || certificate?.issuedAt}
        />
        <div ref={reqRef}>
          <RequestForm />
        </div>
      </div>
      <div
        className={`db-page ${student.selfRegistered ? "self-reg-blur" : ""}`}
      >
        <DashboardBanner
          greeting="Welcome back 👋"
          name={student.name}
          meta={`${student.registrationNumber} · ${student.department} · ${student.program}`}
          badge={
            <>
              <CheckCircle2 size={12} /> {student.itStatus.replace(/_/g, " ")}
            </>
          }
          initials={initials}
          gradient="linear-gradient(135deg, #0d9488 100%)"
          avatarOverlay={
            <svg
              style={{
                position: "absolute",
                inset: -4,
                transform: "rotate(-90deg)",
              }}
              width={98}
              height={98}
              viewBox="0 0 98 98"
            >
              <circle
                cx={49}
                cy={49}
                r={44}
                fill="none"
                stroke="rgba(255,255,255,.2)"
                strokeWidth={5}
              />
              <circle
                cx={49}
                cy={49}
                r={44}
                fill="none"
                stroke="rgba(255,255,255,.7)"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={`${(progress.progressPercent / 100) * 276} 276`}
              />
            </svg>
          }
        />

        <InternshipFeeBanner
          payment={paysInternshipFee ? (internshipPayment?.data ?? null) : null}
          loading={loadingInternshipPayment}
          busy={startingInternshipPayment}
          onPay={startInternshipPayment}
        />

        <CertificateStatusBanner
          certificate={certificate || null}
          fee={certFee?.data ?? null}
          itStatus={student.itStatus}
          loadingCert={loadingCert || loadingCertFee}
          busy={downloadingCert || startingCertPayment}
          onAction={handleCertificateAction}
        />

        <div>
          <SectionHead
            title="My Progress"
            sub="Real-time SIWES tracking"
            icon={<TrendingUp size={16} />}
            color="teal"
          />
          <StudentMetricsGrid
            progress={progress}
            logbooks={logbooks}
            evaluation={evaluation}
            report={report}
            notifications={notifications}
            certificate={certificate || null}
            fee={certFee?.data ?? null}
            itStatus={student.itStatus}
            downloadingCert={downloadingCert}
            downloadingReq={downloadingReq}
            onDownloadReq={handleDownloadReq}
            onCertificateAction={handleCertificateAction}
          />
        </div>

        <ProgressSection
          progress={progress}
          evaluation={evaluation}
          fmt={fmt}
        />

        <FinalDetailsSection
          placement={placement}
          supervisors={supervisors}
          fmt={fmt}
        />

        <NotificationsSection notifications={notifications} ago={ago} />
      </div>
    </>
  );
}
