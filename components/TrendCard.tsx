import React, { useState } from 'react';
import { TrendItem } from '../types';

interface TrendCardProps {
  item: TrendItem;
  onGenerate: (item: TrendItem) => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({ item, onGenerate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {item.category}
          </span>
          <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
             🔥 Viral Score: {item.viralityScore}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-brand-600 transition-colors">
          {item.headline}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {item.summary}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.hashtags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        {item.sources.length > 0 && (
          <div className="mb-4">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              {expanded ? 'Hide Sources' : `View ${item.sources.length} Sources`}
              <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expanded && (
              <ul className="mt-2 space-y-1">
                {item.sources.map((source, idx) => (
                  <li key={idx}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <span className="text-xs text-gray-400">Updated: {item.timestamp}</span>
          <button
            onClick={() => onGenerate(item)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Create Content
          </button>
        </div>
      </div>
    </div>
  );
};
