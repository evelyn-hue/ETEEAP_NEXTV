"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";

type AuthContextType = {
  isLoggedIn: boolean;
  email: string;
  fullName: string;
  civil_status: string;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  verify: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [civil_status, setCivilStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    verify();
  }, []);

  const verify = async () => {
    setLoading(true);
    try {
      const response = await Fetch_to(api_link.jwt.verify);
      if (response.success) {
        const response_data = response.data.message.final_data.data[0];
        setEmail(response_data.email);
        setFullName(response_data.fullName ?? "");
        setCivilStatus(response_data.civil_status ?? "");
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setEmail("");
        setFullName("");
        setCivilStatus("");
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      setIsLoggedIn(false);
      setEmail("");
      setFullName("");
      setCivilStatus("");
    } finally {
      setLoading(false);
    }
  };

  const login = (userEmail: string) => {
    setEmail(userEmail);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setEmail("");
    setFullName("");
    setCivilStatus("");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, email, fullName, civil_status, loading, login, logout, verify }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
