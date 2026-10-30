import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Plane } from 'lucide-react';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

// [UI COMPONENT] NotFound - Renders the NotFound view
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FCFBF8] pt-24 flex items-center justify-center relative overflow-hidden">

        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E2B87C]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#CACACB]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center px-6">
          <div className="relative inline-flex items-center justify-center w-40 h-40 mb-8 bg-[#0C0C34] rounded-full p-3 shadow-xl opacity-90">
            <img src="/logo.png" alt="Perennials Visa Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-[#3E3A35] mb-4 tracking-tighter">
            404
          </h1>
          <h2 className="text-xl md:text-2xl text-[#7A7369] mb-8 font-light max-w-lg mx-auto">
            It looks like this destination doesn't exist on our map.
          </h2>

          <Link to="/">
            <Button className="bg-[#E2B87C] text-[#000000] hover:bg-[#c9a16a]">
              Return Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
