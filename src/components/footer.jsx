import Link from 'next/link';
import { Home, FileText, Shield } from 'lucide-react';
import { Github } from './icons/brands';

export default function Footer() {
  return (
    <footer className="mt-8 py-4 border-t">
      <div className="container mx-auto px-4 flex justify-center space-x-6">
        <Link href="/" className="text-sm text-gray-600 hover:underline flex items-center">
          <Home className="w-4 h-4 mr-1" />
          首页
        </Link>
        <Link href="/terms-of-service" className="text-sm text-gray-600 hover:underline flex items-center">
          <FileText className="w-4 h-4 mr-1" />
          用户协议
        </Link>
        <Link href="/privacy-policy" className="text-sm text-gray-600 hover:underline flex items-center">
          <Shield className="w-4 h-4 mr-1" />
          隐私政策
        </Link>
        <Link href="https://github.com/falconchen/cf-next-todo" className="text-sm text-gray-600 hover:underline flex items-center" target="_blank" rel="noopener noreferrer">
          <Github size={16} className="w-4 h-4 mr-1" />
           GitHub
        </Link>
 
      </div>
      
    </footer>
  );
}

