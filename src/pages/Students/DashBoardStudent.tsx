import { CheckCircle2, TrendingUp } from "lucide-react";
import { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStudentDashboard } from "../../hooks/useDashboard";
import {
  useCertificateStatus,
  useVerifyCertificatePayment,
} from "../../hooks/useCertificate";
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
import CustomConfirm from "../../components/ui/CustomConfirm";
import Certificate from "../../components/student/view/Certificate/Certificate";
import { CertificateStatusBanner } from "../../components/student/dashboard/CertificateStatusBanner";
import { StudentMetricsGrid } from "../../components/student/dashboard/StudentMetricsGrid";
import { ProgressSection } from "../../components/student/dashboard/ProgressSection";
import { FinalDetailsSection } from "../../components/student/dashboard/FinalDetailsSection";
import { NotificationsSection } from "../../components/student/dashboard/NotificationsSection";
import type { RRRData } from "../../api/types/certificate";
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
  const { openModal, closeModal } = useModal();
  const { mutate: verify } = useVerifyCertificatePayment();
  const { certRef, downloadingCert, certData, handleDownloadCert } =
    useCertificateDownload();
  const { reqRef, downloadingReq, handleDownloadReq } =
    useRequestFormDownload();

  // Auto-verify if returning from payment with orderId in URL
  useEffect(() => {
    const orderId = searchParams.get("orderId") || searchParams.get("RRR");
    const cert = certStatus?.data;
    if (orderId && cert && cert.paymentStatus === "pending") {
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

  const openPaymentModal = useMemo(
    () =>
      (data: RRRData, showVerify = true) => {
        const cleanOrderId = data.orderId?.trim().replace(/\s+$/, "");
        openModal(
          <PaymentVerificationModal
            isOpen
            onClose={closeModal}
            showVerify={showVerify}
            data={{
              rrr: data.rrr || "Pending",
              amount: data.amount || 4000,
              orderId: cleanOrderId,
              merchantId: data.merchantId,
              certificateId: data.certificateId,
            }}
          />,
        );
      },
    [openModal, closeModal],
  );

  const openRequestModal = useMemo(
    () => (requestId?: string) => {
      openModal(
        <CertificateRequestModal
          isOpen
          requestId={requestId}
          selfRegistered={resp?.data?.student?.selfRegistered !== false}
          internshipId={resp?.data?.internshipId ?? selectedInternshipId ?? undefined}
          batchId={resp?.data?.batch?._id ?? undefined}
          batchName={resp?.data?.batch?.name ?? undefined}
          batchSession={resp?.data?.batch?.session ?? undefined}
          placementCompany={resp?.data?.placement?.company ?? undefined}
          onClose={(rrrData) => {
            closeModal();
            if (rrrData && typeof rrrData === "object" && "rrr" in rrrData) {
              setTimeout(() => {
                openPaymentModal(rrrData as RRRData);
              }, 50);
            }
          }}
        />,
      );
    },
    [openModal, closeModal, openPaymentModal, resp, selectedInternshipId],
  );

  const openRejectionDetails = useMemo(
    () => (id: string, reason: string) => {
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

  const openPendingDetails = useMemo(
    () =>
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
                    <span style={{ fontWeight: 600 }}>#{data.requestId}</span>
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

        <CertificateStatusBanner
          certificate={certificate || null}
          loadingCert={loadingCert}
          downloadingCert={downloadingCert}
          onOpenRejection={openRejectionDetails}
          onOpenPayment={openPaymentModal}
          onOpenRequest={openRequestModal}
          onDownload={() =>
            handleDownloadCert(certificate?.canDownload || false)
          }
          onOpenPending={openPendingDetails}
        />

        <div>
          <SectionHead
            title="My Progress"
            sub="Real-time CIMS tracking"
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
            downloadingCert={downloadingCert}
            downloadingReq={downloadingReq}
            onDownloadCert={() =>
              handleDownloadCert(certificate?.canDownload || false)
            }
            onDownloadReq={handleDownloadReq}
            onOpenPayment={openPaymentModal}
            onOpenRequest={openRequestModal}
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
