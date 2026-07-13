import { useState } from "react";
import { Building2 } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import VerifiedCompaniesTable from "../../components/shared/tables/VerifiedCompaniesTable";
import CompanyDetailModal from "../../components/student/modals/CompanyDetailModal";
import type { Company } from "../../api/types/company";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import { useStates, useCities } from "../../hooks/useLocation";

interface FilterState {
  search: string;
  state: string;
  city: string;
  page: number;
  limit: number;
}

export default function AvailableCompanies() {
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    state: "",
    city: "",
    page: 1,
    limit: 10,
  });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

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

  const { data: statesList } = useStates();
  const { data: citiesList } = useCities(filter.state);

  return (
    <>
      <div className="page-container">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon teal">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="page-title">Available Companies</h2>
              <p className="page-sub">
                Browse verified companies accepting IT students for placement
              </p>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="filter-wrapper">
          <SearchInput
            value={filter.search}
            onChange={(val) => setField("search", val)}
            placeholder="Search by name, industry…"
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
          <VerifiedCompaniesTable
            source="student"
            search={filter.search}
            state={filter.state}
            city={filter.city}
            page={filter.page}
            limit={filter.limit}
            onPageChange={(p) => setField("page", p)}
            onLimitChange={(l) =>
              setFilter((prev) => ({ ...prev, limit: l, page: 1 }))
            }
            onView={(c) => setSelectedCompany(c)}
          />
        </div>
      </div>

      {/* ── Company Detail Modal ── */}
      {selectedCompany && (
        <CompanyDetailModal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          company={selectedCompany}
        />
      )}
    </>
  );
}
