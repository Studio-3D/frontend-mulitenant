"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SharedNavBar({ items }) {
  const pathname = usePathname();
  
  // Check if path is active with improved matching for root paths
  const isActive = (path) => {
    // For root path like '/comptabilite', only match exactly
    if (path === '/comptabilite') {
      return pathname === path;
    }
    // For other paths, check if pathname starts with the path
    return pathname.startsWith(path);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <nav className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link 
            key={item.name}
            href={item.path}
            className={`flex items-center gap-2 px-4 py-3 rounded-md transition-colors ${
              isActive(item.path) 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
            {item.badge && (
              <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
