"use client";

import { useState, useEffect } from "react";

export function useAdminPreferences() {
  const [category, setCategory] = useState<"jee" | "neet">("jee");
  const [classType, setClassType] = useState<"11th" | "12th" | "dropper">("11th");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedCategory = localStorage.getItem('adminSidebarCategory') as "jee" | "neet" | null;
    const savedClass = localStorage.getItem('adminSidebarClass') as "11th" | "12th" | "dropper" | null;
    const savedCollapsed = localStorage.getItem('adminSidebarCollapsed');
    
    if (savedCategory) {
      setCategory(savedCategory);
    }
    if (savedClass) {
      setClassType(savedClass);
    }
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Update functions that also save to localStorage
  const updateCategory = (newCategory: "jee" | "neet") => {
    setCategory(newCategory);
    localStorage.setItem('adminSidebarCategory', newCategory);
  };

  const updateClassType = (newClass: "11th" | "12th" | "dropper") => {
    setClassType(newClass);
    localStorage.setItem('adminSidebarClass', newClass);
  };

  const updateSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(collapsed));
  };

  return {
    category,
    classType,
    sidebarCollapsed,
    updateCategory,
    updateClassType,
    updateSidebarCollapsed,
  };
}