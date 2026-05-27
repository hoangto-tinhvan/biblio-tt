"use client";

import { createContext, useContext } from "react";

export interface AuthUser {
  name: string; // full member name
}

interface AuthCtx {
  user: AuthUser | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthCtx>({ user: null, logout: () => {} });
export const useAuth = () => useContext(AuthContext);
