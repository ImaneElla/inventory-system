"use client";

import React, { createContext, useContext, useState, useEffect } from "react";


export type Lang = "en" | "fr";

export type AccentColor =
  | "indigo"
  | "pink"
  | "yellow"
  | "green"
  | "red"
  | "black";

interface AppPrefsContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  accent: AccentColor;
  setAccent: (a: AccentColor) => void;
  t: (key: string) => string;
}


const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.products": "Products",
    "nav.categories": "Categories",
    "nav.sales": "Sales",
    "nav.reports": "Reports",
    "nav.users": "Users",
    "nav.activityLogs": "Activity Logs",
    "nav.settings": "Settings",
    "nav.help": "Help",
    "nav.aiAssistant": "AI Assistant",
    // Header
    "header.searchPlaceholder": "Search anything...",
    "header.search": "Search...",
    "header.notifications": "Notifications",
    "header.markAllRead": "Mark all read",
    "header.noNotifications": "All caught up!",
    "header.theme": "Theme",
    "header.theme.light": "Light",
    "header.theme.dark": "Dark",
    "header.theme.system": "System",
    "header.signOut": "Sign Out",
    // Settings page
    "settings.title": "Settings",
    "settings.subtitle": "Manage your profile, notifications, and workspace preferences.",
    "settings.profile.title": "Account Profile",
    "settings.profile.subtitle": "Update your public identity",
    "settings.profile.fullName": "Full Name",
    "settings.profile.systemRole": "System Role",
    "settings.profile.changePhoto": "Change Photo",
    "settings.profile.save": "Save Changes",
    "settings.profile.saving": "Saving...",
    "settings.notifications.title": "Notifications",
    "settings.notifications.subtitle": "Control alerts shown in your dashboard",
    "settings.notifications.push": "Push Notifications",
    "settings.notifications.pushDesc": "Real-time browser alerts in the header",
    "settings.notifications.lowStock": "Low Stock Warnings",
    "settings.notifications.lowStockDesc": "Alerts when items hit threshold",
    "settings.notifications.emailReports": "Email Reports",
    "settings.notifications.emailReportsDesc": "Daily summary of operations (coming soon)",
    "settings.appearance.title": "Appearance",
    "settings.appearance.subtitle": "Personalize your view",
    "settings.appearance.displayTheme": "Display Theme",
    "settings.appearance.accentColor": "Accent Color",
    "settings.appearance.language": "Language",
    "settings.help.title": "Help & Support",
    "settings.help.subtitle": "Guides and quick answers",
    "settings.help.docs": "Documentation",
    "settings.help.docsDesc": "Step-by-step guides for every feature",
    "settings.help.faq": "Inventory FAQ",
    "settings.help.faqDesc": "Managing products, stock & sales",
    "settings.help.contact": "Contact Support",
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Real-time inventory & sales overview",
    "dashboard.totalProducts": "Total Products",
    "dashboard.totalRevenue": "Total Revenue",
    "dashboard.inventoryValue": "Inventory Value",
    "dashboard.criticalAlerts": "Critical Alerts",
    "dashboard.unitsInStock": "units in stock",
    "dashboard.completedOrders": "completed orders",
    "dashboard.purchaseValue": "Purchase value in stock",
    "dashboard.lowStockItems": "Low stock items",
    "dashboard.aiAssistant": "AI Assistant",
    "dashboard.openEmexa": "Open Emexa",
    "dashboard.addProduct": "Quick Add Product",
    "dashboard.newSale": "New Sale",
    "dashboard.trendTitle": "Inventory & Profit Trend",
    "dashboard.trendSubtitle": "Monthly inventory value and profit overview",
    "dashboard.expectedProfit": "Expected profit",
    "dashboard.expectedProfitDesc": "vs last month",
    "dashboard.mostSellers": "Most Sellers",
    "dashboard.topProducts": "Top products",
    "dashboard.mostActiveDay": "Most Active Day",
    "dashboard.salesByWeekday": "Sales by weekday",
    "dashboard.repeatCustomer": "Repeat Customer Rate",
    "dashboard.returningClients": "Returning clients",
    "dashboard.retentionOnTrack": "On track for strong retention",
    "dashboard.retentionEncourage": "Encourage repeat purchases",
    "dashboard.aiAssistantDesc": "Get smart restock tips and sales insights powered by your live inventory data.",
    // Emexa
    "emexa.placeholder": "Ask Emexa anything about your inventory...",
    "emexa.greeting": "Hey",
    "emexa.greetingDesc": "Your AI inventory assistant. Ask me anything about your stock, products, or sales.",
    "emexa.conversations": "Conversations",
    "emexa.newChat": "New Chat",
    "emexa.deleteConversation": "Delete Conversation",
    "emexa.deleteConfirm": "Are you sure you want to permanently clear this conversation thread? This action cannot be undone.",
    "emexa.cancel": "Cancel",
    "emexa.delete": "Delete",
    "emexa.deleting": "Deleting...",
    "emexa.noConversations": "No conversations yet.",
    "emexa.startChat": "Click \"New Chat\" to start.",
    "emexa.loading": "Loading conversation...",
    "emexa.suggestion1": "What products are low on stock?",
    "emexa.suggestion2": "Give me a sales summary.",
    "emexa.suggestion3": "How is overall inventory health?",
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.noData": "No data found",
  },
  fr: {
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.products": "Produits",
    "nav.categories": "Catégories",
    "nav.sales": "Ventes",
    "nav.reports": "Rapports",
    "nav.users": "Utilisateurs",
    "nav.activityLogs": "Journaux d'activité",
    "nav.settings": "Paramètres",
    "nav.help": "Aide",
    "nav.aiAssistant": "Assistant IA",
    // Header
    "header.searchPlaceholder": "Rechercher...",
    "header.search": "Rechercher...",
    "header.notifications": "Notifications",
    "header.markAllRead": "Tout marquer comme lu",
    "header.noNotifications": "Tout est à jour !",
    "header.theme": "Thème",
    "header.theme.light": "Clair",
    "header.theme.dark": "Sombre",
    "header.theme.system": "Système",
    "header.signOut": "Se déconnecter",
    // Settings page
    "settings.title": "Paramètres",
    "settings.subtitle": "Gérez votre profil, vos notifications et vos préférences d'espace de travail.",
    "settings.profile.title": "Profil du compte",
    "settings.profile.subtitle": "Mettez à jour votre identité publique",
    "settings.profile.fullName": "Nom complet",
    "settings.profile.systemRole": "Rôle système",
    "settings.profile.changePhoto": "Changer la photo",
    "settings.profile.save": "Enregistrer",
    "settings.profile.saving": "Enregistrement...",
    "settings.notifications.title": "Notifications",
    "settings.notifications.subtitle": "Contrôlez les alertes affichées dans votre tableau de bord",
    "settings.notifications.push": "Notifications push",
    "settings.notifications.pushDesc": "Alertes navigateur en temps réel dans l'en-tête",
    "settings.notifications.lowStock": "Avertissements de stock bas",
    "settings.notifications.lowStockDesc": "Alertes lorsque les articles atteignent le seuil",
    "settings.notifications.emailReports": "Rapports par e-mail",
    "settings.notifications.emailReportsDesc": "Résumé quotidien des opérations (bientôt disponible)",
    "settings.appearance.title": "Apparence",
    "settings.appearance.subtitle": "Personnalisez votre vue",
    "settings.appearance.displayTheme": "Thème d'affichage",
    "settings.appearance.accentColor": "Couleur d'accentuation",
    "settings.appearance.language": "Langue",
    "settings.help.title": "Aide et support",
    "settings.help.subtitle": "Guides et réponses rapides",
    "settings.help.docs": "Documentation",
    "settings.help.docsDesc": "Guides étape par étape pour chaque fonctionnalité",
    "settings.help.faq": "FAQ Inventaire",
    "settings.help.faqDesc": "Gestion des produits, stocks et ventes",
    "settings.help.contact": "Contacter le support",
    // Dashboard
    "dashboard.title": "Tableau de bord",
    "dashboard.subtitle": "Aperçu en temps réel de l'inventaire et des ventes",
    "dashboard.totalProducts": "Total produits",
    "dashboard.totalRevenue": "Chiffre d'affaires",
    "dashboard.inventoryValue": "Valeur du stock",
    "dashboard.criticalAlerts": "Alertes critiques",
    "dashboard.unitsInStock": "unités en stock",
    "dashboard.completedOrders": "commandes complétées",
    "dashboard.purchaseValue": "Valeur d'achat en stock",
    "dashboard.lowStockItems": "articles en stock bas",
    "dashboard.aiAssistant": "Assistant IA",
    "dashboard.openEmexa": "Ouvrir Emexa",
    "dashboard.addProduct": "Ajouter un produit",
    "dashboard.newSale": "Nouvelle vente",
    "dashboard.trendTitle": "Tendance de l'inventaire et des bénéfices",
    "dashboard.trendSubtitle": "Aperçu mensuel de la valeur du stock et des bénéfices",
    "dashboard.expectedProfit": "Bénéfice attendu",
    "dashboard.expectedProfitDesc": "par rapport au mois dernier",
    "dashboard.mostSellers": "Meilleures ventes",
    "dashboard.topProducts": "Top produits",
    "dashboard.mostActiveDay": "Jour le plus actif",
    "dashboard.salesByWeekday": "Ventes par jour de la semaine",
    "dashboard.repeatCustomer": "Taux de clients fidèles",
    "dashboard.returningClients": "Clients récurrents",
    "dashboard.retentionOnTrack": "En bonne voie pour une forte rétention",
    "dashboard.retentionEncourage": "Encouragez les achats répétés",
    "dashboard.aiAssistantDesc": "Obtenez des conseils de réapprovisionnement intelligents et des informations sur les ventes basées sur vos données en direct.",
    // Emexa
    "emexa.placeholder": "Demandez à Emexa tout sur votre inventaire...",
    "emexa.greeting": "Bonjour",
    "emexa.greetingDesc": "Votre assistante IA. Posez-moi des questions sur vos stocks, produits ou ventes.",
    "emexa.conversations": "Conversations",
    "emexa.newChat": "Nouvelle discussion",
    "emexa.deleteConversation": "Supprimer la conversation",
    "emexa.deleteConfirm": "Êtes-vous sûr de vouloir supprimer définitivement cette conversation ? Cette action est irréversible.",
    "emexa.cancel": "Annuler",
    "emexa.delete": "Supprimer",
    "emexa.deleting": "Suppression...",
    "emexa.noConversations": "Aucune conversation.",
    "emexa.startChat": "Cliquez sur « Nouvelle discussion » pour commencer.",
    "emexa.loading": "Chargement de la conversation...",
    "emexa.suggestion1": "Quels produits sont en stock bas ?",
    "emexa.suggestion2": "Donnez-moi un résumé des ventes.",
    "emexa.suggestion3": "Quel est l'état général du stock ?",
    // Common
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.add": "Ajouter",
    "common.search": "Rechercher",
    "common.loading": "Chargement...",
    "common.noData": "Aucune donnée",
  },
};


export const accentPalettes: Record<AccentColor, { light: string; dark: string; label: string; hex: string }> = {
  indigo: {
    label: "Indigo",
    hex: "#6366f1",
    light: "oklch(0.488 0.243 264.376)",
    dark:  "oklch(0.424 0.199 265.638)",
  },
  pink: {
    label: "Pink",
    hex: "#ec4899",
    light: "oklch(0.656 0.241 354.308)",
    dark:  "oklch(0.592 0.215 354.308)",
  },
  yellow: {
    label: "Yellow",
    hex: "#eab308",
    light: "oklch(0.795 0.184 86.047)",
    dark:  "oklch(0.717 0.169 86.047)",
  },
  green: {
    label: "Green",
    hex: "#22c55e",
    light: "oklch(0.723 0.219 149.579)",
    dark:  "oklch(0.652 0.198 149.579)",
  },
  red: {
    label: "Red",
    hex: "#ef4444",
    light: "oklch(0.638 0.245 27.325)",
    dark:  "oklch(0.577 0.221 27.325)",
  },
  black: {
    label: "Black",
    hex: "#18181b",
    light: "oklch(0.21 0.006 285.885)",
    dark:  "oklch(0.35 0.005 285.885)",
  },
};


const AppPrefsContext = createContext<AppPrefsContextValue>({
  lang: "en",
  setLang: () => {},
  accent: "indigo",
  setAccent: () => {},
  t: (k) => k,
});

export function useAppPrefs() {
  return useContext(AppPrefsContext);
}

export function AppPrefsProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string>("guest");
  const [lang, setLangState] = useState<Lang>("en");
  const [accent, setAccentState] = useState<AccentColor>("indigo");

  // Keep currentUserId updated from sessionStorage
  useEffect(() => {
    const checkUser = () => {
      const activeId = sessionStorage.getItem("userId") || "guest";
      if (activeId !== currentUserId) {
        setCurrentUserId(activeId);
      }
    };
    checkUser();
    const interval = setInterval(checkUser, 500);
    
    // Also listen to storage events (useful if switching tabs)
    window.addEventListener("storage", checkUser);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkUser);
    };
  }, [currentUserId]);

  // Load preferences whenever currentUserId changes
  useEffect(() => {
    const storedLang = localStorage.getItem(`imn_lang_${currentUserId}`) as Lang | null;
    const storedAccent = localStorage.getItem(`imn_accent_${currentUserId}`) as AccentColor | null;
    if (storedLang && (storedLang === "en" || storedLang === "fr")) {
      setLangState(storedLang);
    } else {
      setLangState("en"); // default
    }
    if (storedAccent && storedAccent in accentPalettes) {
      setAccentState(storedAccent);
      applyAccent(storedAccent);
    } else {
      setAccentState("indigo"); // default
      applyAccent("indigo");
    }
  }, [currentUserId]);

  // Observe class changes on html to re-apply the correct light/dark accent variant dynamically
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const activeAccent = root.getAttribute("data-accent") as AccentColor | null;
          if (activeAccent) {
            applyAccent(activeAccent);
          }
        }
      });
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(`imn_lang_${currentUserId}`, l);
  };

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
    localStorage.setItem(`imn_accent_${currentUserId}`, a);
    applyAccent(a);
  };

  const t = (key: string): string => {
    return translations[lang][key] ?? translations["en"][key] ?? key;
  };

  return (
    <AppPrefsContext.Provider value={{ lang, setLang, accent, setAccent, t }}>
      {children}
    </AppPrefsContext.Provider>
  );
}


function applyAccent(accent: AccentColor) {
  const palette = accentPalettes[accent];
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const value = isDark ? palette.dark : palette.light;
  root.style.setProperty("--primary", value);
  root.style.setProperty("--sidebar-primary", value);
  // Store accent name as data attribute so we can re-apply on theme toggle
  root.setAttribute("data-accent", accent);
}

// Export so theme toggles can re-apply after dark/light switch
export { applyAccent };
