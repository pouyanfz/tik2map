export interface ChipItem {
  id: string;
  label: string;
  color?: string;
  icon?: string;
}

interface ChipSelectProps {
  options: ChipItem[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function ChipSelect({ options, selected, onToggle }: ChipSelectProps) {
  return (
    <div className="chip-row">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        const style = opt.color
          ? isSelected
            ? { background: opt.color, borderColor: opt.color, color: "#fff" }
            : { borderColor: opt.color, color: opt.color }
          : undefined;

        return (
          <button
            type="button"
            key={opt.id}
            className={isSelected ? "chip chip--selected" : "chip"}
            style={style}
            onClick={() => onToggle(opt.id)}
          >
            {opt.icon ? `${opt.icon} ` : ""}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
