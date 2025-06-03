"use client"
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-background border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="yatra-one-text text-2xl text-purple">Lahara</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="text-body hover:text-green-hover flex items-center">
                Find Influencers
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="text-body hover:text-green-hover flex items-center">
                Find Sponsors
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="text-body hover:text-green-hover flex items-center">
                Why Us
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <Link href="/enterprise" className="text-body hover:text-green-hover">
              Enterprise
            </Link>
          </div>

          {/* Search and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-64 px-4 py-2 bg-gray-input text-gray-input-text rounded-full focus:outline-none focus:ring-2 focus:ring-purple"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-input-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            <Link href="/login" className="text-body hover:text-green-hover">
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-green-button text-white px-6 py-2 rounded-full hover:bg-green-hover transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-body hover:text-green-hover"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/find-influencers" className="text-body hover:text-green-hover">
                Find Influencers
              </Link>
              <Link href="/find-sponsors" className="text-body hover:text-green-hover">
                Find Sponsors
              </Link>
              <Link href="/why-us" className="text-body hover:text-green-hover">
                Why Us
              </Link>
              <Link href="/enterprise" className="text-body hover:text-green-hover">
                Enterprise
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 bg-gray-input text-gray-input-text rounded-full focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/login" className="text-body hover:text-green-hover">
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-button text-white px-6 py-2 rounded-full hover:bg-green-hover transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="hidden md:flex space-x-8 py-4">
          <Link href="/beauty-influencers" className="text-body hover:text-green-hover">
            Beauty Influencers
          </Link>
          <Link href="/design-development" className="text-body hover:text-green-hover">
            Design & Development
          </Link>
          <Link href="/story-tellers" className="text-body hover:text-green-hover">
            Story Tellers
          </Link>
          <Link href="/writers" className="text-body hover:text-green-hover">
            Writers
          </Link>
          <Link href="/artists" className="text-body hover:text-green-hover">
            Artists
          </Link>
          <div className="relative group">
            <button className="text-body hover:text-green-hover flex items-center">
              More
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 