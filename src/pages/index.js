import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Task Manager</title>
        <meta name="theme-color" content="#0a0a23" />
        <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js" async />
      </Head>
      
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4ade80] to-[#166534] overflow-hidden">
        
        {/* Glowing orb decoration */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#86efac] opacity-10 blur-[80px] animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#4ade80] opacity-10 blur-[80px] animate-float-delay"></div>
        
        <div className="relative text-center p-12 bg-[rgba(255,255,255,0.1)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.15)] shadow-2xl max-w-xl z-10 transition-all duration-500 hover:border-[rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(74,222,128,0.15)]">
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(134,239,172,0.05)] to-transparent rounded-2xl"></div>
            <div className="absolute inset-0 border border-[rgba(255,255,255,0.05)] rounded-2xl"></div>
          </div>
          
          <h1 className="text-5xl font-bold text-[#fff] mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#86efac] to-[#4ade80]">
            Task Manager
          </h1>
          <p className="text-[#fff]/80 mb-10 text-lg font-light max-w-md mx-auto">
            Maintain your tasks and get things done
          </p>
          
          <div className="flex justify-center gap-5">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-[rgba(134,239,172,0.15)] text-[#fff] rounded-lg hover:bg-[rgba(134,239,172,0.25)] transition-all duration-300 backdrop-blur-md border border-[rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(134,239,172,0.3)] font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 bg-transparent border-2 border-[#e6e6fa] text-[#e6e6fa] rounded-lg hover:bg-[rgba(230,230,250,0.1)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(230,230,250,0.3)] font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
              </svg>
              Register
            </Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 10s ease-in-out infinite 2s;
        }
      `}</style>
    </>
  );
}
