import React from 'react';
import { NewsCategory } from '../types';

interface SidebarProps {
  activeCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const categories = Object.values(NewsCategory);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-lg">
            ⚡
          </span>
          TrendPulse
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
          News Feeds
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
              activeCategory === cat
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeCategory === cat ? 'bg-brand-500' : 'bg-gray-300'}`}></span>
            {cat}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white shadow-lg">
          <h3 className="text-sm font-semibold mb-1">Pro Membership</h3>
          <p className="text-xs text-gray-300 mb-3">Get advanced analytics & AI features.</p>
          <button className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-xs font-bold rounded text-white transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};
