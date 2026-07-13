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

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const remove = (t: string) => {
    onChange(tags.filter((x) => x !== t));
  };

  return (
    <div className="isr-field">
      <label className="isr-label">{label}</label>
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="isr-tag-add-btn" onClick={add}>
          + Add
        </button>
      </div>
    </div>
  );
}
