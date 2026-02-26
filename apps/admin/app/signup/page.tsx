"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const INVITE_CODE = process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE || "";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  inviteCode?: string;
};

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!inviteCode.trim()) {
      errors.inviteCode = "Invite code is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    // Frontend invite code check
    if (inviteCode !== INVITE_CODE) {
      setFieldErrors((prev) => ({
        ...prev,
        inviteCode: "Invalid invite code",
      }));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          inviteCode,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error?.code === "INVALID_INVITE_CODE") {
          setFieldErrors((prev) => ({
            ...prev,
            inviteCode: "Invalid invite code",
          }));
        } else {
          setError(result.error?.message || "Registration failed");
        }
        setLoading(false);
        return;
      }

      // Store token and user data (same pattern as admin login)
      localStorage.setItem("capvista_admin_token", result.data.accessToken);
      localStorage.setItem(
        "capvista_admin_user",
        JSON.stringify(result.data.user)
      );

      router.push("/");
    } catch (err) {
      setError("Network error. Is the API running?");
      setLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#F9FAFB",
    border: `1px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
    borderRadius: 8,
    color: "#111827",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
  });

  const labelStyle = {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 8,
  };

  const errorTextStyle = {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F6F8FA",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 40,
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              backgroundColor: "#0A1F44",
              borderRadius: 8,
              fontSize: 20,
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            CV
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#0A1F44",
              margin: 0,
            }}
          >
            Capvista Admin
          </h1>
          <p style={{ color: "#6B7280", marginTop: 8, fontSize: 14 }}>
            Create your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 20,
                color: "#EF4444",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* First Name & Last Name side by side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
                style={inputStyle(!!fieldErrors.firstName)}
                placeholder="John"
              />
              {fieldErrors.firstName && (
                <p style={errorTextStyle}>{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
                style={inputStyle(!!fieldErrors.lastName)}
                placeholder="Doe"
              />
              {fieldErrors.lastName && (
                <p style={errorTextStyle}>{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              style={inputStyle(!!fieldErrors.email)}
              placeholder="admin@capvista.com"
            />
            {fieldErrors.email && (
              <p style={errorTextStyle}>{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              style={inputStyle(!!fieldErrors.password)}
              placeholder="Minimum 8 characters"
            />
            {fieldErrors.password && (
              <p style={errorTextStyle}>{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
              }}
              style={inputStyle(!!fieldErrors.confirmPassword)}
              placeholder="Re-enter your password"
            />
            {fieldErrors.confirmPassword && (
              <p style={errorTextStyle}>{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Invite Code */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setFieldErrors((prev) => ({ ...prev, inviteCode: undefined }));
              }}
              style={inputStyle(!!fieldErrors.inviteCode)}
              placeholder="Enter your invite code"
            />
            {fieldErrors.inviteCode && (
              <p style={errorTextStyle}>{fieldErrors.inviteCode}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: loading ? "#1A3A6B" : "#0A1F44",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            color: "#6B7280",
            fontSize: 13,
            marginTop: 24,
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#0A1F44",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
