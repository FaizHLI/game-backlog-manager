// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useProfile } from '@/utils/supabase-hooks';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const { fetchProfile } = useProfile();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile data for the avatar
  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        const { data } = await fetchProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    getProfile();
  }, [user, fetchProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/library' },
    { label: 'Add Game', href: '/add-game' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            GameLog
          </Link>
          
          {isLoading ? (
            <div className="h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          ) : (
            <>
              <div className="hidden md:flex items-center space-x-4">
                {/* Show navigation only if user is authenticated */}
                {user && (
                  <>
                    {navItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === item.href
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    
                    <div className="flex items-center ml-4">
                      {/* User avatar and dropdown */}
                      <div className="relative group">
                        <button className="flex items-center focus:outline-none">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {profileData?.avatar_url ? (
                              <Image 
                                src={profileData.avatar_url} 
                                alt={profileData.username || user.email || "User"} 
                                width={32} 
                                height={32}
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                                {profileData?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {profileData?.username || user.email?.split('@')[0] || 'User'}
                          </span>
                        </button>
                        
                        {/* Dropdown menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Show authentication links if user is not authenticated */}
                {!user && (
                  <>
                    <Link
                      href="/login"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
              
              <div className="md:hidden">
                <button 
                  className="text-gray-700 dark:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && (
                <>
                  {/* User info for mobile */}
                  <div className="px-3 py-2 flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {profileData?.avatar_url ? (
                        <Image 
                          src={profileData.avatar_url} 
                          alt={profileData.username || user.email || "User"} 
                          width={32} 
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                          {profileData?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {profileData?.username || user.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  
                  {/* Nav items */}
                  {navItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        pathname === item.href
                          ? 'bg-indigo-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </>
              )}
              
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}