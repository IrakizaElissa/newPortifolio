"use client"

import { useEffect, useSyncExternalStore } from "react"
import { portfolioContent, type Language } from "@/data/portfolio-content"

const STORAGE_KEY = "portfolio-language"

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "fr" || value === "rw"
}

function getBrowserLanguage(): Language {
  if (typeof window === "undefined") {
    return "en"
  }

  const browserLanguage = window.navigator.language.toLowerCase()
  if (browserLanguage.startsWith("fr")) {
    return "fr"
  }
  if (browserLanguage.startsWith("rw")) {
    return "rw"
  }

  return "en"
}

let currentLanguage: Language = "en"
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function readStoredLanguage() {
  if (typeof window === "undefined") {
    return currentLanguage
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isLanguage(stored) ? stored : getBrowserLanguage()
}

function setGlobalLanguage(value: Language) {
  currentLanguage = value

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value)
  }

  emitChange()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentLanguage
}

export function usePortfolioLanguage() {
  const language = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    const initialLanguage = readStoredLanguage()
    if (initialLanguage !== currentLanguage) {
      currentLanguage = initialLanguage
      emitChange()
    }
  }, [])

  return {
    language,
    setLanguage: setGlobalLanguage,
    content: portfolioContent[language],
  }
}
