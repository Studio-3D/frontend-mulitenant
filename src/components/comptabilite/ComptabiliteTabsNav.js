'use client';

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
import SharedNavBar from '@/components/SharedNavBar';

const ComptabiliteTabsNav = () => {
  const tabs = [
    { 
      name: 'Tva Tranche', 
      path: '/comptabilite',
      icon: <FileText className="w-5 h-5" />
    },
    { 
      name: 'Tva Mensuelle', 
      path: '/comptabilite/mensuelle', 
      icon: <CreditCard className="w-5 h-5" />
    },
    { 
      name: 'Coefficient', 
      path: '/comptabilite/coefficient', 
      icon: <Percent className="w-5 h-5" />
    },
    { 
      name: 'Fournisseurs', 
      path: '/comptabilite/fournisseurs', 
      icon: <User className="w-5 h-5" />
    },
    { 
      name: 'Décomptes', 
      path: '/comptabilite/decomptes', 
      icon: <ArrowDownRight className="w-5 h-5" />
    },
    { 
      name: 'Factures', 
      path: '/comptabilite/factures', 
      icon: <Receipt className="w-5 h-5" />
    },
    { 
      name: 'CPS', 
      path: '/comptabilite/cps', 
      icon: <Circle className="w-5 h-5" />
    },
    { 
      name: 'Crédits', 
      path: '/comptabilite/credits', 
      icon: <Coins className="w-5 h-5" />
    }
  ];

  return <SharedNavBar items={tabs} />;
};

export default ComptabiliteTabsNav;
