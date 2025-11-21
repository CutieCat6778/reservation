"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const tokenStr = localStorage.getItem("adminToken");
    if (!tokenStr) {
      setCheckingAuth(false); // no token → stop checking → render login
      return;
    }

    try {
      const { token, expire } = JSON.parse(tokenStr) as {
        token: string;
        expire: number;
      };

      if (!token || !expire || Date.now() > expire) {
        localStorage.removeItem("adminToken");
        setCheckingAuth(false); // expired → stop checking → render login
      } else {
        // valid token → redirect to dashboard
        router.replace("/admin/dashboard");
        // also stop showing loading, otherwise it'll stay stuck
        setCheckingAuth(false);
      }
    } catch {
      localStorage.removeItem("adminToken");
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // token missing or expired → render login form
  return <>{children}</>;
}

