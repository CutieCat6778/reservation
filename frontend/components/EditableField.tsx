// src/components/reservation/EditableField.tsx

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Reservation } from "@/lib/modelTypes";

type EditableFieldValue = string | number | null;

interface Props {
  label: string;
  value: EditableFieldValue;
  field: keyof Reservation;        // Wichtig: exakter Schlüssel
  type?: "text" | "number" | "datetime-local" | "email" | "tel";
  onSave: (field: keyof Reservation, value: EditableFieldValue) => void;
}

export default function EditableField({
  label,
  value,
  field,
  type = "text",
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState<EditableFieldValue>(value);

  // Sync tempValue wenn sich der externe Wert ändert
  if (!editing && tempValue !== value) {
    setTempValue(value);
  }

  const handleSave = () => {
    if (tempValue !== value) {
      onSave(field, tempValue);
    }
    setEditing(false);
  };

  const displayValue =
    field === "reserveAt" && typeof value === "string"
      ? formatDateTime(value)
      : value ?? "–";

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <strong>{label}:</strong>
        <input
          type={type}
          className="input input-sm input-bordered max-w-xs"
          value={
            type === "datetime-local" && typeof tempValue === "string"
              ? tempValue.slice(0, 16)
              : (tempValue ?? "")
          }
          onChange={(e) => {
            const val = type === "number" ? Number(e.target.value) || null : e.target.value;
            setTempValue(val);
          }}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button className="btn btn-sm btn-success" onClick={handleSave}>
          Speichern
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            setTempValue(value);
            setEditing(false);
          }}
        >
          Abbrechen
        </button>
      </div>
    );
  }

  return (
    <p className="flex flex-wrap items-center gap-2">
      <strong>{label}:</strong>
      <span>{displayValue}</span>
      <button className="btn btn-sm btn-outline" onClick={() => setEditing(true)}>
        Bearbeiten
      </button>
    </p>
  );
}
