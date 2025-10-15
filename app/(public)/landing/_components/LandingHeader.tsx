"use client";

import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-6 py-6 lg:px-12">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="font-saprona text-3xl font-semibold text-neutrals-4 transition hover:text-white"
        >
          Merak
        </Link>

        <ul className="flex items-center gap-8 font-saprona text-xl text-white">
          <li>
            <Link href="/marketplace" className="transition hover:text-neutrals-4">
              Marketplace
            </Link>
          </li>
          <li>
            <Link href="/about" className="transition hover:text-neutrals-4">
              About Us
            </Link>
          </li>
          <li>
            <Link href="/login" className="transition hover:text-neutrals-4">
              Log In
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
