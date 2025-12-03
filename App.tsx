import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TrendCard } from './components/TrendCard';
import { ContentGenerator } from './components/ContentGenerator';
import { NewsCategory, TrendItem, Region } from './types';
import { fetchTrendingNews } from './services/geminiService';

function App() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(NewsCategory.BREAKING);
  const [activeRegion, setActiveRegion] = useState<Region>(Region.USA);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrendForGeneration, setSelectedTrendForGeneration] = useState<TrendItem | null>(null);

  // Filter & Sort State
  const [minViralScore, setMinViralScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'latest'>('score');

  useEffect(() => {
    loadTrends(activeCategory, activeRegion);
  }, [activeCategory, activeRegion]);

  const loadTrends = async (category: NewsCategory, region: Region) => {
    setLoading(true);
    setTrends([]); // clear current to show skeleton/loading
    try {
      const items = await fetchTrendingNews(category, region);
      setTrends(items);
    } catch (error) {
      console.error("Failed to load trends", error);
      // In a real app, handle error UI here
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and sorting
  const processedTrends = useMemo(() => {
    let result = [...trends];

    // Filter
    if (minViralScore > 0) {
      result = result.filter(t => t.viralityScore >= minViralScore);
    }

    // Sort
    if (sortBy === 'score') {
      result.sort((a, b) => b.viralityScore - a.viralityScore);
    } else {
      // Assuming 'latest' relies on the order fetched or timestamp, 
      // but since timestamp is 'now', we'll just keep original order or random.
      // Ideally we'd have a 'publishedAt' from the source, but for this demo:
      result.sort((a, b) => b.id.localeCompare(a.id)); // Simple placeholder sort
    }

    return result;
  }, [trends, minViralScore, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />

      <main className="md:pl-64 min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{activeCategory}</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                Powered by Gemini 2.5
              </span>
              <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-brand-200">
                AI
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Controls Toolbar */}
          <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Market Pulse</h3>
                  <p className="text-sm text-gray-500">
                    Real-time analysis from X, Threads, and Global News.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => loadTrends(activeCategory, activeRegion)}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh Feed
                  </button>
                </div>
             </div>
             
             <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Region Selector */}
                <div className="flex items-center gap-2">
                   <span className="text-xs font-semibold text-gray-500 uppercase">Region:</span>
                   <select 
                      value={activeRegion}
                      onChange={(e) => setActiveRegion(e.target.value as Region)}
                      className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 rounded-md bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                   >
                      {Object.values(Region).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                   </select>
                </div>

                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                {/* Viral Score Filter */}
                <div className="flex items-center gap-2">
                   <span className="text-xs font-semibold text-gray-500 uppercase">Viral Score:</span>
                   <select 
                      value={minViralScore}
                      onChange={(e) => setMinViralScore(Number(e.target.value))}
                      className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 rounded-md bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                   >
                      <option value={0}>All Trends</option>
                      <option value={50}>High Potential ({'>'}50)</option>
                      <option value={80}>Mega Viral ({'>'}80)</option>
                   </select>
                </div>

                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                {/* Sort Order */}
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-semibold text-gray-500 uppercase">Sort By:</span>
                   <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setSortBy('score')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortBy === 'score' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        Viral Score
                      </button>
                      <button
                        onClick={() => setSortBy('latest')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortBy === 'latest' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        Latest
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Feed Grid */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-64 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedTrends.map((item) => (
                <TrendCard 
                  key={item.id} 
                  item={item} 
                  onGenerate={setSelectedTrendForGeneration} 
                />
              ))}
              {processedTrends.length === 0 && !loading && (
                <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
                  <p className="text-lg font-medium">No trends match your filter.</p>
                  <p className="text-sm">Try lowering the Viral Score requirement.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Content Generator */}
      {selectedTrendForGeneration && (
        <ContentGenerator 
          selectedTrend={selectedTrendForGeneration} 
          onClose={() => setSelectedTrendForGeneration(null)} 
        />
      )}
    </div>
  );
}

export default App;