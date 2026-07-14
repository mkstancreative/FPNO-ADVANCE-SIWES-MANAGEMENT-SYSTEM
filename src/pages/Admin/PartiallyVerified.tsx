import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import { ShieldCheck, CheckCircle } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import PlacementsTable from "../../components/admin/tables/PlacementsTable";
import VerifyPlacements from "../../components/admin/forms/VerifyPlacements";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import type { PendingPlacement, CompanyParams } from "../../api/types/company";
import { usePartiallyVerifiedCompanies } from "../../hooks/useCompany";
import { useStates, useCities } from "../../hooks/useLocation";

interface FilterState {
  search: string;
  state: string;
  city: string;
  page: number;
  limit: number;
}

export default function PartiallyVerified() {
  const { openModal, closeModal } = useModal();

  const [filter, setFilter] = useState<FilterState>({
    search: "",
    state: "",
    city: "",
    page: 1,
    limit: 10,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const params: CompanyParams = {
    page: filter.page,
    limit: filter.limit,
    ...(filter.search ? { search: filter.search } : {}),
    ...(filter.state ? { state: filter.state } : {}),
    ...(filter.city ? { city: filter.city } : {}),
  };

  const { data: statesList } = useStates();
  const { data: citiesList } = useCities(filter.state);

  const { data: placementsResp, isLoading } =
    usePartiallyVerifiedCompanies(params);

  const placements: PendingPlacement[] = placementsResp?.data ?? [];
  const meta = placementsResp
    ? {
        page: placementsResp.page,
        pages: placementsResp.pages,
        count: placementsResp.total,
        limit: filter.limit,
        hasPrev: placementsResp.page > 1,
        hasNext: placementsResp.page < placementsResp.pages,
      }
    : null;

  const setField = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) =>
    setFilter((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));

  const handleReset = () =>
    setFilter({ search: "", state: "", city: "", page: 1, limit: 10 });

  // ── Modal openers ──────────────────────────────────────────────────────────
  const openVerify = (plList: PendingPlacement[]) =>
    openModal(
      <VerifyPlacements
        isOpen
        onClose={() => {
          closeModal();
          setSelectedIds([]);
        }}
        placements={plList}
      />,
    );

  const selectedPlacements = placements.filter((p) =>
    selectedIds.includes(p._id),
  );

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon purple">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="page-title">Partially Verified Companies</h2>
            <p className="page-sub">
              Verify clinical supervisors for onboarded companies
            </p>
          </div>
        </div>
        <div className="page-header-right">
          {selectedIds.length > 0 && (
            <button
              className="dash-btn dash-btn--primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#8b5cf6",
              }}
              onClick={() => openVerify(selectedPlacements)}
            >
              <CheckCircle size={15} />
              Verify Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* ── Search + Reset ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filter.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by student name, company, supervisor…"
          onClear={handleReset}
        />
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          name="state"
          value={filter.state}
          onChange={(val) => {
            setField("state", val as string);
            setField("city", ""); // reset city on state change
          }}
          label="State"
          options={[
            { value: "", label: "All States" },
            ...(statesList ?? []).map((s) => ({ value: s, label: s })),
          ]}
        />
        <SelectFilter
          name="city"
          value={filter.city}
          onChange={(val) => setField("city", val as string)}
          label="City"
          options={
            filter.state
              ? [
                  { value: "", label: "All Cities" },
                  ...(citiesList ?? []).map((c) => ({ value: c, label: c })),
                ]
              : [{ value: "", label: "Select State First" }]
          }
        />
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <PlacementsTable
          data={placements}
          loading={isLoading}
          meta={meta}
          onPageChange={(p) => setField("page", p)}
          onLimitChange={(l) =>
            setFilter((prev) => ({ ...prev, limit: l, page: 1 }))
          }
          onVerify={(p) => openVerify([p])}
          onView={(p) => {
            if (p.acceptanceLetterUrl) {
              window.open(
                `${import.meta.env.VITE_API_URL}${p.acceptanceLetterUrl}`,
                "_blank",
              );
            }
          }}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
}
