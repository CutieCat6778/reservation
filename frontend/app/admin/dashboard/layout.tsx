"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children?: ReactNode;
};

export default function AdminDashboardLayout({ children }: Props) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const tokenStr = localStorage.getItem("adminToken");
    if (!tokenStr) {
      router.replace("/admin");
      return;
    }

    try {
      const { token, expire } = JSON.parse(tokenStr) as { token: string; expire: number };
      if (!token || !expire || Date.now() > expire) {
        localStorage.removeItem("adminToken");
        router.replace("/admin");
      } else {
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem("adminToken");
      router.replace("/admin");
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Bitte warten Sie</p>
      </div>
    );
  }

  return <>{children}</>;
}
