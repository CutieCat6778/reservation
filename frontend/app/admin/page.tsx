import AdminLoginForm from "@/components/adminLoginForm";

export default function AdminPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </main>
  );
}

