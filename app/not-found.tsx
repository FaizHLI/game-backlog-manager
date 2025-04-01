// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <div className="flex space-x-4">
        <Link 
          href="/" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </Link>
        <Link 
          href="/library" 
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Browse Library
        </Link>
      </div>
    </div>
  );
}