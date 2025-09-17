import { useRouter } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';

// Enhanced BreadCrumb component (backward compatible)
// Props (legacy): step, baseUrl, onNavigate
// Props (new): items: Array<{ label: string, href?: string, onClick?: () => void }>, onRoot?: { href?: string, onClick?: () => void }
export default function BreadCrumb({ step, baseUrl, onNavigate, items = [], onRoot }) {
  const router = useRouter();

  const handleLegacyClick = (url) => {
    if (onNavigate) onNavigate();
    if (url) router.push(url);
  };

  const handleNavigate = (href, onClick) => (e) => {
    e?.preventDefault?.();
    if (typeof onClick === 'function') onClick();
    if (href) router.push(href);
  };

  const useHierarchical = (items && items.length > 0) || onRoot;

  if (!useHierarchical) {
    // Legacy rendering
    return (
      <nav aria-label="breadcrumb" className="flex items-center space-x-2">
        <a
          href="#"
          onClick={() => handleLegacyClick(baseUrl)}
          className="text-gray-600 hover:text-gray-800 cursor-pointer flex items-center"
        >
          <Home className="w-5 h-5 mr-1" />
        </a>
        <span className="text-gray-800">{step}</span>
      </nav>
    );
  }

  // Hierarchical rendering
  return (
    <nav aria-label="breadcrumb" className="flex items-center text-sm">
      <a
        href={onRoot?.href || baseUrl || '#'}
        onClick={handleNavigate(onRoot?.href || baseUrl, onRoot?.onClick || onNavigate)}
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
      >
        <Home className="w-4 h-4" />
      </a>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const key = `${item.label}-${idx}`;
        return (
          <span key={key} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            {isLast || !item.href ? (
              <span className="font-medium text-gray-900">{item.label}</span>
            ) : (
              <a
                href={item.href}
                onClick={handleNavigate(item.href, item.onClick)}
                className="text-[#009FFF] hover:text-blue-700"
              >
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
