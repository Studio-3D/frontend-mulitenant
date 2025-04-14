import { useRouter } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function BreadCrumb({ step, baseUrl }) {
  const router = useRouter();

  const handleClick = url => {
    router.push(url);
  };

  return (
    <nav aria-label="breadcrumb" className="flex items-center space-x-2">
      <a
        href="#"
        onClick={() => handleClick(baseUrl)}
        className="text-gray-600 hover:text-gray-800 cursor-pointer flex items-center"
      >
        <HomeIcon className="w-5 h-5 mr-1" />
      </a>
      <span className="text-gray-800">{step}</span>
    </nav>
  );
}
