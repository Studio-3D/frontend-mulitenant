"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import { TikTokConfigTab } from "@/components/config-socials/TikTokConfigTab";
import FacebookConfigTab from "@/components/config-socials/FacebookConfigTab";
import InstagramConfigTab from "@/components/config-socials/InstagramConfigTab";
import WhatsAppConfigTab from "@/components/config-socials/WhatsAppConfigTab";
import LandingPageConfigTab from "@/components/config-socials/LandingPageConfigTab";
import { useAuth } from "@/context/AuthContext";
import { AlertCircleIcon, Loader, Facebook, Instagram, Linkedin, Video, Settings, MessageCircle } from "lucide-react";
import LinkedInConfigTab from "@/components/config-socials/LinkedInConfigTab";

export default function ConfigurationSocialsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("facebook");

  // Check if user has proper permissions
  if (user && user.role !== 1 && user.role !== 2&& user.role !== 10) {
    return (
      <div className="p-8 text-center">
        <AlertCircleIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Accès restreint</h2>
        <p className="text-gray-600">
          Vous n&apos;avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  // Show loading indicator if user not yet loaded
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Configure tabs for our existing Tabs component (removed webhook tab)
  const tabsConfig = [
    {
      id: "facebook",
      label: "Facebook",
      icon: <Facebook className="h-4 w-4 text-[#1877F2]" />
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: <Instagram className="h-4 w-4 text-[#E1306C]" />
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <Linkedin className="h-4 w-4 text-[#0A66C2]" />
    },
    {
      id: "tiktok",
      label: "TikTok",
      icon: <Video className="h-4 w-4 text-[#FF0050]" />
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4 text-[#25D366]" />
    },
    {
      id: "landing",
      label: "Landing Page",
      icon: <Settings className="h-4 w-4" />
    }
  ];

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "facebook":
        return <FacebookConfigTab />;

      case "instagram":
        return <InstagramConfigTab />;

      case "linkedin":
        return <LinkedInConfigTab />;

      case "tiktok":
        return <TikTokConfigTab />;

      case "whatsapp":
        return <WhatsAppConfigTab />;

      case "landing":
        return <LandingPageConfigTab />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuration des réseaux sociaux</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Tabs 
          tabs={tabsConfig}
          defaultTab="facebook"
          onTabChange={handleTabChange}
        />
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

