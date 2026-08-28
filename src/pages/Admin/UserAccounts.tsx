import { useEffect, useState } from "react";
import { KeyRound, Search, UsersRound } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import type { Column } from "../../components/ui/GeneralTable/GeneralTable";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import Spinner from "../../components/ui/Spinner/Spinner";
import AdminResetUserPassword from "../../components/admin/forms/AdminResetUserPassword";
import AdminVerifyRRR from "../../components/admin/forms/AdminVerifyRRR";
import { useModal } from "../../context/ModalContext";
import { useAdminUserLookup } from "../../hooks/useAdminUsers";
import type { AdminUserLookupItem } from "../../api/types/adminUser";
import AddButton from "../../components/ui/AddButton/AddButton";
import ResetButton from "../../components/ui/ResetButton/ResetButton";

/** Long enough that typing a reg number does not fire a request per keystroke. */
const DEBOUNCE_MS = 350;
const MIN_QUERY = 2;

export default function UserAccounts() {
  const { openModal, closeModal } = useModal();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // The lookup is a live search, so debounce before handing it to the hook.
  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  const canSearch = query.length >= MIN_QUERY;
  const {
    data,
    isFetching,
    isError,
    error,
  } = useAdminUserLookup(query, canSearch);

  const users: AdminUserLookupItem[] = data?.data ?? [];

  const openReset = (user: AdminUserLookupItem) =>
    openModal(
      <AdminResetUserPassword isOpen onClose={closeModal} user={user} />,
    );

  const columns: Column<AdminUserLookupItem>[] = [
    {
      header: "User",
      render: (u) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>
            {u.name || `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || "—"}
          </span>
          <span style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>
            {u.email}
          </span>
        </div>
      ),
    },
    {
      header: "Reg. Number",
      render: (u) => u.registrationNumber || "—",
    },
    {
      header: "Role",
      render: (u) => <StatusBadge status={u.role} />,
    },
    {
      header: "Status",
      render: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {u.isActive !== undefined ? (
            <StatusBadge status={u.isActive ? "active" : "inactive"} />
          ) : (
            "—"
          )}
          {u.mustChangePassword && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 7px",
                borderRadius: 4,
                background: "#fef3c7",
                color: "#92400e",
                fontWeight: 600,
              }}
            >
              Reset Pending
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      render: (u) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            className="ua-reset-btn"
            onClick={() => openReset(u)}
            disabled={u.canReset === false}
            title={
              u.canReset === false
                ? "Password reset is not available for this user"
                : "Reset this user's password"
            }
          >
            <KeyRound size={14} />
            Reset Password
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon teal">
            <UsersRound size={20} />
          </div>
          <div>
            <h2 className="page-title">User Accounts</h2>
            <p className="page-sub">
              Find any account and reset its sign-in password
            </p>
          </div>
        </div>

        <div className="page-header-right">
          <AddButton text="Verify RRR" onClick={() => openModal(<AdminVerifyRRR isOpen onClose={closeModal} />)} />
        </div>
      </div>

      <div className="filter-wrapper ua-filter-wrapper">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Search by name, email, or registration number…"
        />
        <ResetButton onClick={() => { setSearch(""); }} />
      </div>

      <div className="table-wrapper" style={{ marginTop: 24 }}>
        {!canSearch ? (
          <div className="ua-empty">
            <div className="ua-empty-icon">
              <Search size={26} />
            </div>
            <h3>Search for a user</h3>
            <p>
              Type at least {MIN_QUERY} characters — a name, an email address, or
              a registration number — to look up an account.
            </p>
          </div>
        ) : isError ? (
          <div className="ua-empty">
            <div className="ua-empty-icon ua-empty-icon--error">
              <Search size={26} />
            </div>
            <h3>Lookup failed</h3>
            <p>
              {(error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Could not search users. Please try again."}
            </p>
          </div>
        ) : isFetching && users.length === 0 ? (
          <div className="ua-empty">
            <Spinner size={24} color="var(--color-accent)" />
            <p style={{ marginTop: 12 }}>Searching…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="ua-empty">
            <div className="ua-empty-icon">
              <UsersRound size={26} />
            </div>
            <h3>No users found</h3>
            <p>
              Nothing matched “{query}”. Try a different spelling, or search by
              email instead.
            </p>
          </div>
        ) : (
          <>
            <div className="ua-result-count">
              {users.length} {users.length === 1 ? "account" : "accounts"} found
              {isFetching && (
                <span style={{ marginLeft: 8 }}>
                  <Spinner size={11} color="var(--color-accent)" />
                </span>
              )}
            </div>
            <GeneralTable<AdminUserLookupItem>
              data={users}
              columns={columns}
              loading={false}
            />
          </>
        )}
      </div>

      <style>{`
        .ua-filter-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: nowrap;
        }
        .ua-filter-wrapper .search-box {
          flex: 1;
          width: auto;
          margin-bottom: 0;
        }
        .ua-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          font-size: 12.5px;
          font-weight: 600;
          border-radius: 7px;
          cursor: pointer;
          color: var(--color-accent);
          background: var(--color-accent-soft);
          border: 1px solid var(--color-accent);
          transition: background 0.15s, color 0.15s;
        }
        .ua-reset-btn:hover:not(:disabled) {
          background: var(--color-accent);
          color: #fff;
        }
        .ua-reset-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: var(--color-bg-secondary);
          color: var(--color-text-muted);
          border-color: var(--color-border);
        }
        .ua-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 56px 24px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }
        .ua-empty-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          color: var(--color-accent);
          background: var(--color-accent-soft);
        }
        .ua-empty-icon--error {
          color: #ef4444;
          background: #fee2e2;
        }
        .ua-empty h3 {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .ua-empty p {
          margin: 0;
          max-width: 430px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--color-text-muted);
        }
        .ua-result-count {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
