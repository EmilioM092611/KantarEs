"use client"

export const AUTH_KEY = "kantares_auth"
export const USER_KEY = "kantares_user"

export function setAuth(user: any) {
  localStorage.setItem(AUTH_KEY, "true")
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  // Dispatch custom event for immediate auth state updates
  window.dispatchEvent(new CustomEvent("kantares-auth-change"))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(USER_KEY)
  // Dispatch custom event for immediate auth state updates
  window.dispatchEvent(new CustomEvent("kantares-auth-change"))
}

export function getAuth() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_KEY)
}

export function getUser() {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export function isAuthenticated() {
  return !!getAuth()
}
