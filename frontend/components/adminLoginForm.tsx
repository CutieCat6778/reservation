"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN_ADMIN } from "@/graphql/mutations"; // your GraphQL mutation

export default function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loginAdmin, { loading }] = useMutation<{login: string}>(LOGIN_ADMIN);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Bitte Benutzername und Passwort eingeben.");
      return;
    }

    try {
      const { data } = await loginAdmin({
        variables: { username, password },
      });

      if (data?.login) {
        const token = data.login;
        const expireTime = Date.now() + 16 * 60 * 60 * 1000; // 16 hours in ms
        localStorage.setItem(
          "adminToken",
          JSON.stringify({ token, expire: expireTime })
        );

        // Optionally redirect to admin dashboard
        window.location.href = "/admin/dashboard";
      } else {
        setError("Ungültiger Benutzername oder Passwort.");
      }
    } catch (err: any) {
      setError(err.message || "Login fehlgeschlagen.");
    }
  };

  return (
    <form
      className="max-w-md mx-auto mt-12 p-8 bg-base-200 border border-base-300 rounded-box shadow-md"
      onSubmit={handleLogin}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="mb-4">Bitte warten…</p>}

      <label className="label">Benutzername</label>
      <input
        type="text"
        className="input w-full mb-4"
        placeholder="Benutzername"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <label className="label">Passwort</label>
      <input
        type="password"
        className="input w-full mb-6"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" className="btn btn-neutral w-full">
        Einloggen
      </button>
    </form>
  );
}

