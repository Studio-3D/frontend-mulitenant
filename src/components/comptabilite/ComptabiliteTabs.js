'use client';
import React, { forwardRef } from 'react';
import { 
  FileText, 
  CreditCard, 
  Calendar, 
  User, 
  ArrowDownRight, 
  Receipt, 
  Circle, 
  Coins,
  Percent
} from 'lucide-react';

const ComptabiliteTabs = ({
  activeTab,
  onTabChange,
}) => {
  const getIcon = (type) => {
    const iconProps = { size: 16 };
    
    switch (type) {
      case 'file-text':
        return <FileText {...iconProps} />;
      case 'credit-card':
        return <CreditCard {...iconProps} />;
      case 'percent':
        return <Percent {...iconProps} />;
      case 'user':
        return <User {...iconProps} />;
      case 'arrow-down-right':
        return <ArrowDownRight {...iconProps} />;
      case 'receipt':
        return <Receipt {...iconProps} />;
      case 'circle':
        return <Circle {...iconProps} />;
      case 'coins':
        return <Coins {...iconProps} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'tva-tranche', label: 'Tva Tranche', icon: 'file-text' },
    { id: 'tva-mensuelle', label: 'Tva Mensuelle', icon: 'credit-card' },
    { id: 'coefficient', label: 'Coefficient', icon: 'percent' },
    { id: 'fournisseurs', label: 'Fournisseurs', icon: 'user' },
    { id: 'decomptes', label: 'Décomptes', icon: 'arrow-down-right' },
    { id: 'factures', label: 'Factures', icon: 'receipt' },
    { id: 'cps', label: 'CPS', icon: 'circle' },
    { id: 'credits', label: 'Crédits', icon: 'coins' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 w-full">
      {/* Use grid with 8 equal columns for 8 tabs */}
      <div className="grid grid-cols-8 w-full">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};

const TabButton = forwardRef(({ 
  label, 
  icon, 
  active, 
  onClick,
}, ref) => {
  const getIcon = (type) => {
    const iconProps = { size: 16 };
    
    switch (type) {
      case 'file-text':
        return <FileText {...iconProps} />;
      case 'credit-card':
        return <CreditCard {...iconProps} />;
      case 'percent':
        return <Percent {...iconProps} />;
      case 'user':
        return <User {...iconProps} />;
      case 'arrow-down-right':
        return <ArrowDownRight {...iconProps} />;
      case 'receipt':
        return <Receipt {...iconProps} />;
      case 'circle':
        return <Circle {...iconProps} />;
      case 'coins':
        return <Coins {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center justify-center px-2 py-4 text-sm font-medium border-b-2 transition-colors duration-200 relative w-full ${
        active 
          ? 'border-emerald-500 text-emerald-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-center flex-col sm:flex-row gap-1 sm:gap-2">
        {getIcon(icon)}
        <span className="whitespace-nowrap text-xs sm:text-sm">{label}</span>
      </div>
    </button>
  );
});

TabButton.displayName = 'TabButton';

export { ComptabiliteTabs };