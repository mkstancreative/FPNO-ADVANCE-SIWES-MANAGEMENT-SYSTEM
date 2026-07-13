import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}

export function ISRStarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const starsArray = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="isr-stars">
      {starsArray.map((n) => (
        <button
          key={n}
          type="button"
          className={`isr-star ${n <= (hovered || value) ? "isr-star--active" : ""}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={22}
            fill={n <= (hovered || value) ? "currentColor" : "none"}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="isr-star-label">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value] ||
            `${value}/${max}`}
        </span>
      )}
    </div>
  );
}
