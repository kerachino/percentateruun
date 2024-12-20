"use client";
import Link from 'next/link';

interface NavMenuProps {
  onClose: () => void;
}

export default function NavMenu({onClose}:NavMenuProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col items-end">
      <div className="bg-white w-2/3 h-full p-4">
        <button onClick={onClose} className="mb-4 p-2 border border-gray-300 rounded">Close</button>
        <ul className="space-y-4 font-medium text-lg">
          <li><Link href="#top" onClick={onClose}>HOME</Link></li>
          <li><Link href="/blog" onClick={onClose}>Blog</Link></li>
          <li><Link href="/asmr" onClick={onClose}>ASMR</Link></li>
        </ul>
      </div>
    </div>
  );
}
