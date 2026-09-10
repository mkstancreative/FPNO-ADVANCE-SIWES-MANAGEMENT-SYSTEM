import React, { useState, useRef, useEffect } from "react";
import "./SelectFilter.css";

export interface Option {
  value: string;
  label: string;
  /** Optional heading the option is listed under, e.g. its school. */
  group?: string;
}

/** Above this many options the dropdown gets a search box. */
const SEARCHABLE_THRESHOLD = 12;

interface SelectFilterProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const SelectFilter: React.FC<SelectFilterProps> = ({
  label,
  options,
  value,
  onChange,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setSearch("");
  };

  const toggleOpen = () => {
    setIsOpen((open) => !open);
    setSearch("");
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  const selectable = options.filter((opt) => opt.value !== "");
  const isSearchable = selectable.length > SEARCHABLE_THRESHOLD;
  const needle = search.trim().toLowerCase();
  const visible = needle
    ? selectable.filter(
        (opt) =>
          opt.label.toLowerCase().includes(needle) ||
          opt.group?.toLowerCase().includes(needle),
      )
    : selectable;

  // Keep options in the order given, but bunch each group under one heading.
  const groups: { name?: string; options: Option[] }[] = [];
  visible.forEach((opt) => {
    const last = groups[groups.length - 1];
    if (last && last.name === opt.group) {
      last.options.push(opt);
    } else {
      groups.push({ name: opt.group, options: [opt] });
    }
  });

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    options.find((opt) => opt.value === ""); // Attempt to find default
  const displayLabel = selectedOption ? selectedOption.label : "Select...";

  return (
    <div className="filter-container" data-name={name}>
      <label className="filter-label">{label}</label>
      <div
        className={`select-wrapper custom-select-wrapper ${isOpen ? "open" : ""}`}
        onClick={toggleOpen}
        tabIndex={0}
        ref={containerRef}
      >
        <div
          className={`filter-select custom-select-display ${!value ? "placeholder-active" : ""}`}
        >
          {displayLabel}
        </div>

        <div className="icon-group">
          {value && (
            <button type="button" className="clear-btn" onClick={handleClear}>
              ×
            </button>
          )}
          <span className={`chevron ${isOpen ? "open" : ""}`}></span>
        </div>

        {isOpen && (
          <div
            className="custom-options-list"
            onClick={(e) => e.stopPropagation()}
          >
            {isSearchable && (
              <input
                autoFocus
                type="text"
                className="custom-option-search"
                placeholder={`Search ${label.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
            {groups.length === 0 && (
              <div className="custom-option-empty">No matches</div>
            )}
            {groups.map((group, i) => (
              <div key={group.name ?? `group-${i}`}>
                {group.name && (
                  <div className="custom-option-group">{group.name}</div>
                )}
                {group.options.map((opt) => (
                  <div
                    key={opt.value}
                    className={`custom-option ${opt.value === value ? "selected" : ""}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectFilter;
