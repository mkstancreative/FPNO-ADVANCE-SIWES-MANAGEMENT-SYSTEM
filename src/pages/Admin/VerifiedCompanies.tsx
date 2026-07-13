import { useState } from "react";
import { Building2 } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import CompaniesTable from "../../components/admin/tables/CompaniesTable";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import { useVerifiedCompaniesSecure } from "../../hooks/useCompany";
import { useStates, useCities } from "../../hooks/useLocation";

interface FilterState {
  search: string;
  state: string;
  city: string;
  page: number;
  limit: number;
  status: "verified" | "pending_verification" | "rejected" | "";
}

export default function VerifiedCompanies() {
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    status: "verified",
    state: "",
    city: "",
    page: 1,
    limit: 10,
  });

  const params = {
    page: filter.page,
    limit: filter.limit,
    ...(filter.search ? { search: filter.search } : {}),
    ...(filter.state ? { state: filter.state } : {}),
    ...(filter.city ? { city: filter.city } : {}),
  };

  const { data: statesList } = useStates();
  const { data: citiesList } = useCities(filter.state);

  const { data: companiesResp, isLoading } = useVerifiedCompaniesSecure(params);

  // Apply status filter client-side
  const allCompanies = companiesResp?.data ?? [];
  const companies = filter.status
    ? allCompanies.filter((c) => c.verificationStatus === filter.status)
    : allCompanies;

  const meta = companiesResp
    ? {
        page: companiesResp.page,
        pages: companiesResp.pages,
        count: filter.status ? companies.length : companiesResp.total,
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
    setFilter({
      search: "",
      status: "verified",
      state: "",
      city: "",
      page: 1,
      limit: 10,
    });

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon teal">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="page-title">Verified Companies</h2>
            <p className="page-sub">
              All companies that have been verified and approved for student
              placement
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
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
          name="status"
          value={filter.status}
          onChange={(val) => setField("status", val as FilterState["status"])}
          label="Status"
          options={[
            { value: "", label: "All Statuses" },
            { value: "verified", label: "Verified" },
            { value: "pending_verification", label: "Pending" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        <SelectFilter
          name="state"
          value={filter.state}
          onChange={(val) => {
            setField("state", val as string);
            setField("city", "");
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
        />
      </div>
    </div>
  );
}
