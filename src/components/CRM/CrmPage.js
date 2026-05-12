"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { TabsNavigation } from "./TabsNavigation";
import { TabContent } from "./TabContent";
import Pusher from "pusher-js";
import FetchNotifMenu from "@/configs/FetchNotifMenu";
import { useProjet } from "../../context/ProjetContext";
import { useSearchParams, useRouter } from "next/navigation";
import { isCommercial } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";

export function CRMPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTab = searchParams.get("tab");
  const urlSubTab = searchParams.get("subtab"); // Add subtab parameter

  // Set initial state from URL parameters
  const [activeTab, setActiveTab] = useState(urlTab || "prospects");
  const [activeSubTab, setActiveSubTab] = useState({
    relance:
      urlSubTab && ["appels-relance", "visites-relance"].includes(urlSubTab)
        ? urlSubTab
        : "appels-relance",
    rdv:
      urlSubTab && ["appels-rdv", "visites-rdv"].includes(urlSubTab)
        ? urlSubTab
        : "appels-rdv",
    prospects: isCommercial(user?.role) ? "mes-prospects" : "tous-prospects",
  });

  // Use the project from context
  const { selectedProjet } = useProjet();

  // FIX: Initialize renderedTabs based on URL params
  const getInitialTabId = () => {
    if (urlTab === "relance" && urlSubTab) {
      return urlSubTab;
    } else if (urlTab === "rdv" && urlSubTab) {
      return urlSubTab;
    } else if (
      urlTab === "prospects" &&
      isCommercial(user?.role) &&
      urlSubTab
    ) {
      return urlSubTab;
    } else if (isCommercial(user?.role) && urlTab === "prospects") {
      return activeSubTab.prospects;
    } else {
      return urlTab || "prospects";
    }
  };

  const initialTabId = getInitialTabId();
  const renderedTabs = useRef({ [initialTabId]: true });

  // FIX: Update renderedTabs when tab or subtab changes
  useEffect(() => {
    let currentTab;

    if (activeTab === "relance" || activeTab === "rdv") {
      currentTab = activeSubTab[activeTab];
    } else if (activeTab === "prospects" && isCommercial(user?.role)) {
      currentTab = activeSubTab.prospects;
    } else {
      currentTab = activeTab;
    }

    if (currentTab && !renderedTabs.current[currentTab]) {
      renderedTabs.current[currentTab] = true;
    }
  }, [activeTab, activeSubTab, user?.role]);

  // Sync URL with tab state
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      handleTabChange(urlTab, true);
    }
    if (
      urlSubTab &&
      [
        "appels-relance",
        "visites-relance",
        "appels-rdv",
        "visites-rdv",
        "mes-prospects",
        "tous-prospects",
      ].includes(urlSubTab)
    ) {
      handleSubTabChangeFromUrl(urlSubTab);
    }
  }, [urlTab, urlSubTab]);

  // Handle subtab change from URL
  const handleSubTabChangeFromUrl = (subTabId) => {
    if (["appels-relance", "visites-relance"].includes(subTabId)) {
      setActiveTab("relance");
      setActiveSubTab((prev) => ({ ...prev, relance: subTabId }));
    } else if (["appels-rdv", "visites-rdv"].includes(subTabId)) {
      setActiveTab("rdv");
      setActiveSubTab((prev) => ({ ...prev, rdv: subTabId }));
    } else if (["mes-prospects", "tous-prospects"].includes(subTabId)) {
      setActiveTab("prospects");
      setActiveSubTab((prev) => ({ ...prev, prospects: subTabId }));
    }
  };

  // Update URL when tab/subtab changes
  const updateUrl = (tabId, subTabId = null) => {
    const params = new URLSearchParams();
    params.set("tab", tabId);

    // Add subtab parameter for dropdown tabs
    if (subTabId) {
      params.set("subtab", subTabId);
    } else if (tabId === "relance") {
      params.set("subtab", activeSubTab.relance);
    } else if (tabId === "rdv") {
      params.set("subtab", activeSubTab.rdv);
    } else if (tabId === "prospects" && isCommercial(user?.role)) {
      params.set("subtab", activeSubTab.prospects);
    }

    const newUrl = `?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  // Notification state
  const [notifications, setNotifications] = useState({
    prospects: 0,
    "mes-prospects": 0,
    "tous-prospects": 0,
    relance: 0,
    "appels-relance": 0,
    "visites-relance": 0,
    rdv: 0,
    "appels-rdv": 0,
    "visites-rdv": 0,
    freins: 0,
  });

  const pusher_key_NotifMenu =
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF_MENU;

  // Wrap fetchDataNotiMon in useCallback with project dependency
  const fetchDataNotiMon = useCallback(
    async (nb) => {
      if (!selectedProjet?.id) return;

      console.log(
        "Fetching notifications for project:",
        selectedProjet.id,
        "with nb:",
        nb,
      );

      await FetchNotifMenu(
        nb,
        selectedProjet.id,
        (appelsRelance) => {
          console.log("Appels Relance:", appelsRelance);
          setNotifications((prev) => ({
            ...prev,
            "appels-relance": appelsRelance,
          }));
        },
        (appelsRdv) => {
          console.log("Appels RDV:", appelsRdv);
          setNotifications((prev) => ({ ...prev, "appels-rdv": appelsRdv }));
        },
        (visitesRelance) => {
          console.log("Visites Relance:", visitesRelance);
          setNotifications((prev) => ({
            ...prev,
            "visites-relance": visitesRelance,
          }));
        },
        (visitesRdv) => {
          console.log("Visites RDV:", visitesRdv);
          setNotifications((prev) => ({ ...prev, "visites-rdv": visitesRdv }));
        },
        (freins) => {
          console.log("Freins:", freins);
          setNotifications((prev) => ({ ...prev, freins: freins }));
        },
      );
    },
    [selectedProjet],
  );

  // Reset notifications when project changes
  useEffect(() => {
    if (selectedProjet) {
      console.log(
        "Project changed, resetting notifications for:",
        selectedProjet.id,
      );
      setNotifications({
        relance: 0,
        "appels-relance": 0,
        "visites-relance": 0,
        rdv: 0,
        "appels-rdv": 0,
        "visites-rdv": 0,
        freins: 0,
      });

      // Fetch new notifications for the new project
      fetchDataNotiMon("D");
    }
  }, [selectedProjet, fetchDataNotiMon]);

  // Pusher setup - re-run when project changes
  useEffect(() => {
    if (!pusher_key_NotifMenu || !selectedProjet) return;

    console.log("Setting up Pusher for project:", selectedProjet.id);

    // Initial fetch
    fetchDataNotiMon("D");

    const pusher = new Pusher(pusher_key_NotifMenu, {
      cluster: "eu",
      encrypted: true,
    });

    const channel = pusher.subscribe("NotifMenu");

    channel.bind("NotifMenuEvent", (data) => {
      console.log("Pusher event received:", data);
      fetchDataNotiMon(data.NotifMenuId);
    });

    return () => {
      console.log("Cleaning up Pusher for project:", selectedProjet.id);
      channel.unbind("NotifMenuEvent");
      pusher.unsubscribe("NotifMenu");
      pusher.disconnect();
    };
  }, [selectedProjet, pusher_key_NotifMenu, fetchDataNotiMon]);

  // Calculate totals for main tabs
  useEffect(() => {
    const totalRelance =
      notifications["appels-relance"] + notifications["visites-relance"];
    const totalRdv = notifications["appels-rdv"] + notifications["visites-rdv"];

    setNotifications((prev) => ({
      ...prev,
      relance: totalRelance,
      rdv: totalRdv,
    }));
  }, [
    notifications["appels-relance"],
    notifications["visites-relance"],
    notifications["appels-rdv"],
    notifications["visites-rdv"],
  ]);

  const handleTabChange = (tabId, fromUrl = false) => {
    setActiveTab(tabId);

    // Set default subtab when switching to dropdown tabs
    if (
      tabId === "relance" ||
      tabId === "rdv" ||
      (tabId === "prospects" && isCommercial(user?.role))
    ) {
      if (!fromUrl) {
        let defaultSubTab;
        if (tabId === "relance") {
          defaultSubTab = "appels-relance";
          setActiveSubTab((prev) => ({ ...prev, relance: defaultSubTab }));
        } else if (tabId === "rdv") {
          defaultSubTab = "appels-rdv";
          setActiveSubTab((prev) => ({ ...prev, rdv: defaultSubTab }));
        } else if (tabId === "prospects") {
          defaultSubTab = "mes-prospects";
          setActiveSubTab((prev) => ({ ...prev, prospects: defaultSubTab }));
        }
        updateUrl(tabId, defaultSubTab);
      }
    } else {
      if (!fromUrl) {
        updateUrl(tabId);
      }
    }

    if (tabId === "relance" || tabId === "rdv") {
      const subtabId = tabId === "relance" ? "appels-relance" : "appels-rdv";

      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
      if (!renderedTabs.current[subtabId]) {
        renderedTabs.current = { ...renderedTabs.current, [subtabId]: true };
      }

      if (tabId === "relance" && activeSubTab.relance !== "appels-relance") {
        setActiveSubTab((prev) => ({ ...prev, relance: "appels-relance" }));
      } else if (tabId === "rdv" && activeSubTab.rdv !== "appels-rdv") {
        setActiveSubTab((prev) => ({ ...prev, rdv: "appels-rdv" }));
      }
    } else if (tabId === "prospects" && isCommercial(user?.role)) {
      // For commercial users, set default prospects sub-tab
      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
      if (activeSubTab.prospects !== "mes-prospects") {
        setActiveSubTab((prev) => ({ ...prev, prospects: "mes-prospects" }));
      }
    } else {
      // This handles visites, appels, pre-reservation, freins tabs
      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
    }
  };

  const handleSubTabChange = (parentTab, subTabId) => {
    setActiveSubTab((prev) => ({
      ...prev,
      [parentTab]: subTabId,
    }));

    // Update URL with subtab
    updateUrl(parentTab, subTabId);

    if (!renderedTabs.current[subTabId]) {
      renderedTabs.current = { ...renderedTabs.current, [subTabId]: true };
    }
  };

  // Show loading state if no project selected
  if (!selectedProjet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500">Aucun projet sélectionné</div>
          <div className="text-sm text-gray-400 mt-2">
            Veuillez sélectionner un projet pour afficher le CRM
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <TabsNavigation
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={handleTabChange}
        onSubTabChange={handleSubTabChange}
        notifications={notifications}
        userRole={user?.role}
      />
      <div className="">
        {/* Prospects tabs - handle both commercial and non-commercial users */}
        {isCommercial(user?.role) ? (
          <>
            {/* Commercial users see sub-tabs */}
            <div
              style={{
                display:
                  activeTab === "prospects" &&
                  activeSubTab.prospects === "mes-prospects"
                    ? "block"
                    : "none",
              }}
            >
              {renderedTabs.current["mes-prospects"] && (
                <TabContent id="mes-prospects" />
              )}
            </div>

            <div
              style={{
                display:
                  activeTab === "prospects" &&
                  activeSubTab.prospects === "tous-prospects"
                    ? "block"
                    : "none",
              }}
            >
              {renderedTabs.current["tous-prospects"] && (
                <TabContent id="tous-prospects" />
              )}
            </div>
          </>
        ) : (
          /* Non-commercial users see single prospects tab */
          <div
            style={{ display: activeTab === "prospects" ? "block" : "none" }}
          >
            {renderedTabs.current["prospects"] && <TabContent id="prospects" />}
          </div>
        )}

        <div style={{ display: activeTab === "visites" ? "block" : "none" }}>
          {renderedTabs.current["visites"] && <TabContent id="visites" />}
        </div>

        <div style={{ display: activeTab === "appels" ? "block" : "none" }}>
          {renderedTabs.current["appels"] && <TabContent id="appels" />}
        </div>

        <div
          style={{
            display: activeTab === "pre-reservation" ? "block" : "none",
          }}
        >
          {renderedTabs.current["pre-reservation"] && (
            <TabContent id="pre-reservation" />
          )}
        </div>

        {/* Relance subtabs */}
        <div
          style={{
            display:
              activeTab === "relance" &&
              activeSubTab.relance === "appels-relance"
                ? "block"
                : "none",
          }}
        >
          {renderedTabs.current["appels-relance"] && (
            <TabContent id="appels-relance" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === "relance" &&
              activeSubTab.relance === "visites-relance"
                ? "block"
                : "none",
          }}
        >
          {renderedTabs.current["visites-relance"] && (
            <TabContent id="visites-relance" />
          )}
        </div>

        {/* RDV subtabs */}
        <div
          style={{
            display:
              activeTab === "rdv" && activeSubTab.rdv === "appels-rdv"
                ? "block"
                : "none",
          }}
        >
          {renderedTabs.current["appels-rdv"] && <TabContent id="appels-rdv" />}
        </div>

        <div
          style={{
            display:
              activeTab === "rdv" && activeSubTab.rdv === "visites-rdv"
                ? "block"
                : "none",
          }}
        >
          {renderedTabs.current["visites-rdv"] && (
            <TabContent id="visites-rdv" />
          )}
        </div>

        <div style={{ display: activeTab === "freins" ? "block" : "none" }}>
          {renderedTabs.current["freins"] && <TabContent id="freins" />}
        </div>
      </div>
    </div>
  );
}
