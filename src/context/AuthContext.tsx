"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";

type AuthContextType = {
  isLoggedIn: boolean;
  email: string;
  fullName: string;
  phone: string;
  civil_status: string;
  profilePicture: string;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  verify: () => Promise<void>
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [civil_status, setCivilStatus] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
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
        setPhone(response_data.phone ?? "");
        setCivilStatus(response_data.civil_status ?? "");
        setProfilePicture(response_data.profilePicture ?? "");
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setEmail("");
        setFullName("");
        setPhone("");
        setCivilStatus("");
        setProfilePicture("");
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      setIsLoggedIn(false);
      setEmail("");
      setFullName("");
      setPhone("");
      setCivilStatus("");
      setProfilePicture("");
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    await verify();
  };

  const login = (userEmail: string) => {
    setEmail(userEmail);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setEmail("");
    setFullName("");
    setPhone("");
    setCivilStatus("");
    setProfilePicture("");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, email, fullName, phone, civil_status, profilePicture, loading, login, logout, verify, refreshAuth }}>
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
