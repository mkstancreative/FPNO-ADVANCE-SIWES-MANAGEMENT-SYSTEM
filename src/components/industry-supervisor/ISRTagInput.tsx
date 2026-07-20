import { useState } from "react";
import { X } from "lucide-react";

interface TagProps {
  label: string;
  onRemove?: () => void;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}

export function ISRTag({
  label,
  onRemove,
  color,
  bgColor,
  borderColor,
}: TagProps) {
  return (
    <span
      className="isr-tag"
      style={{
        color,
        backgroundColor: bgColor,
        borderColor,
      }}
    >
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="isr-tag-close">
          <X size={12} />
        </button>
      )}
    </span>
  );
}

interface TagInputProps {
  label: string;
  tags: string[];
  placeholder: string;
  onChange: (tags: string[]) => void;
}

export function ISRTagInput({
  label,
  tags,
  placeholder,
  onChange,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTags = (text: string) => {
    const parts = text
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p !== "");

    if (parts.length > 0) {
      const uniqueNewParts = parts.filter((p) => !tags.includes(p));
      if (uniqueNewParts.length > 0) {
        onChange([...tags, ...uniqueNewParts]);
      }
    }
  };

  const handleInputChange = (value: string) => {
    // If user typed or pasted commas, process all complete words before the last comma
    if (value.includes(",")) {
      const lastCommaIndex = value.lastIndexOf(",");
      const completedText = value.substring(0, lastCommaIndex);
      const remainingText = value.substring(lastCommaIndex + 1);

      addTags(completedText);
      setInput(remainingText);
    } else {
      setInput(value);
    }
  };

  const handleAdd = () => {
    addTags(input);
    setInput("");
  };

  const remove = (t: string) => {
    onChange(tags.filter((x) => x !== t));
  };

  return (
    <div className="isr-field">
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <label className="isr-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
        <span
          style={{
            fontSize: "11px",
            color: "#64748b",
            opacity: 0.8,
            marginBottom: 4,
          }}
        >
          Enter items separated by commas (e.g. Skill A, Skill B) or press Enter
          to add.
        </span>
      </div>

      <div className="isr-tag-list">
        {tags.map((t) => (
          <ISRTag key={t} label={t} onRemove={() => remove(t)} />
        ))}
      </div>
      <div className="isr-tag-input-row">
        <input
          className="isr-input"
          value={input}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button type="button" className="isr-tag-add-btn" onClick={handleAdd}>
          + Add
        </button>
      </div>
    </div>
  );
}
