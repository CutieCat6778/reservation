interface Props {
  lastName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function GuestAuthModal({ lastName, onChange, onSubmit, loading }: Props) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card w-full max-w-md shadow-2xl bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl">Reservierung anmelden</h2>
          <p className="text-sm opacity-80">Bitte geben Sie den Nachnamen der Reservierung ein:</p>
          <input
            type="text"
            placeholder="Nachname"
            className="input input-bordered w-full mt-4"
            value={lastName}
            onChange={onChange}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
          <button
            className={`btn btn-primary mt-4 ${loading ? "loading" : ""}`}
            onClick={onSubmit}
            disabled={loading || !lastName.trim()}
          >
            Anmelden
          </button>
        </div>
      </div>
    </div>
  );
}
