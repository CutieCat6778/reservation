import { useState } from "react";
import { formatDateTime } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number | null;
  field: string;
  type?: string;
  onSave: (field: string, value: any) => void;
}

export default function EditableField({ label, value, field, type = "text", onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <strong>{label}:</strong>
        <input
          type={type}
          className="input input-sm input-bordered"
          value={type === "datetime-local" ? (tempValue as string)?.slice(0, 16) : tempValue ?? ""}
          onChange={(e) => setTempValue(e.target.value)}
          autoFocus
        />
        <button className="btn btn-sm btn-success" onClick={() => { onSave(field, tempValue); setEditing(false); }}>
          Speichern
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => { setEditing(false); setTempValue(value); }}>
          Abbrechen
        </button>
      </div>
    );
  }

  const displayValue = field === "reserveAt" ? formatDateTime(value as string) : value || "–";

  return (
    <p className="flex items-center gap-2">
      <strong>{label}:</strong>
      <span>{displayValue}</span>
      <button className="btn btn-sm btn-outline" onClick={() => { setEditing(true); setTempValue(value); }}>
        Bearbeiten
      </button>
    </p>
  );
}
