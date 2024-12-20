"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import NavMenu from "./NavMenu";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white shadow-md relative">
      <Link href="/" className="flex items-center space-x-2">
        {/* ロゴ画像はpublic/imagesに置いておく */}
        <Image
          src="/images/framvoice_rogo.png"
          alt="FRAMVOICE"
          width={120}
          height={40}
        />
      </Link>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="block lg:hidden p-2 rounded-md border border-gray-300"
        aria-label="Toggle menu"
      >
        <div className="space-y-1">
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </div>
      </button>
      <nav className="hidden lg:flex space-x-6 text-sm font-medium">
        <Link href="#top">HOME</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/asmr">ASMR</Link>
      </nav>
      {menuOpen && <NavMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
