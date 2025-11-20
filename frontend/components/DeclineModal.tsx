import { Reservation } from "@/lib/modelTypes";
import { emailTemplates } from "@/lib/emailTemplates";

interface Props {
  reservation: Reservation;
  selectedTemplate: string | null;
  onSelectTemplate: (key: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeclineModal({ reservation, selectedTemplate, onSelectTemplate, onConfirm, onClose }: Props) {
  const templates = emailTemplates(reservation);

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Reservierung ablehnen</h3>
        <div className="space-y-2">
          {Object.entries(templates).map(([key, t]) => (
            <label key={key} className="collapse collapse-arrow bg-base-200">
              <input
                type="radio"
                name="template"
                checked={selectedTemplate === key}
                onChange={() => onSelectTemplate(key)}
              />
              <div className="collapse-title font-medium">{t.title}</div>
              <div className="collapse-content">
                <div dangerouslySetInnerHTML={{ __html: `<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>${t.body}<p>Mit freundlichen Grüßen<br/>Ihr Yoake Team</p>` }} />
              </div>
            </label>
          ))}
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-error" onClick={onConfirm} disabled={!selectedTemplate}>
            Ablehnen bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}
