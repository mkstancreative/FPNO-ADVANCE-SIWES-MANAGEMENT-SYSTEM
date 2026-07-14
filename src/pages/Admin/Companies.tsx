import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import { Layers, CheckCircle } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import CompaniesTable from "../../components/admin/tables/CompaniesTable";
import VerifyCompanies from "../../components/admin/forms/VerifyCompanies";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import type { Company, CompanyParams } from "../../api/types/company";
import { usePendingCompanies } from "../../hooks/useCompany";
import { useStates, useCities } from "../../hooks/useLocation";
import UnverifiedComapnyView from "../../components/admin/view/UnverifiedComapnyView";

interface FilterState {
  search: string;
  state: string;
  city: string;
  page: number;
  limit: number;
}

export default function Companies() {
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

  const { data: companiesResp, isLoading } = usePendingCompanies(params);

  const companies: Company[] = companiesResp?.data ?? [];
  const meta = companiesResp
    ? {
        page: companiesResp.page,
        pages: companiesResp.pages,
        count: companiesResp.total,
        limit: filter.limit,
        hasPrev: companiesResp.page > 1,
        hasNext: companiesResp.page < companiesResp.pages,
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
  const openVerify = (compList: Company[]) =>
    openModal(
      <VerifyCompanies
        isOpen
        onClose={() => {
          closeModal();
          setSelectedIds([]);
        }}
        companies={compList}
      />,
    );

    const openUnverifiedView = (company: Company) =>
    openModal(
      <UnverifiedComapnyView
        isOpen
        onClose={() => {
          closeModal();
          setSelectedIds([]);
        }}
        company={company}
      />,
    );

  const selectedCompanies = companies.filter((c) =>
    selectedIds.includes(c._id),
  );

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="page-title">Companies</h2>
            <p className="page-sub">Review and verify companies registrations</p>
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
                background: "#10b981",
              }}
              onClick={() => openVerify(selectedCompanies)}
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
          placeholder="Search by name, email…"
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
        <CompaniesTable
          data={companies}
          loading={isLoading}
          meta={meta}
          onPageChange={(p) => setField("page", p)}
          onLimitChange={(l) =>
            setFilter((prev) => ({ ...prev, limit: l, page: 1 }))
          }
          onVerify={(c) => openVerify([c])}
          onView={(c) => openUnverifiedView(c)}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
}
