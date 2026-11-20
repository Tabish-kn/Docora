import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, FileText, Folder, ArrowRight, Tag } from 'lucide-react';
import { Badge } from '../common/Badge';
import api from '../../services/api';

export const SearchView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ documents: [], folders: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      const timer = setTimeout(() => {
        api.search(query).then((res) => {
          setResults(res);
          setLoading(false);
        });
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setResults({ documents: [], folders: [], total: 0 });
    }
  }, [query]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF]">
          Global Search & Discovery
        </h1>
        <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
          Find any document, section, tag, or folder across your entire workspace.
        </p>
      </div>

      {/* Big Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#77738B]" />
        <input
          autoFocus
          type="text"
          placeholder="Search by title, body text, or tags..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams({ q: e.target.value });
          }}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-sm text-[#242039] dark:text-[#F1EFFF] shadow-subtle focus:outline-none focus:border-[#7657E8]"
        />
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-[#77738B] uppercase tracking-wider">
            {results.total} Results Found
          </div>

          <div className="space-y-3">
            {results.documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/documents/${doc._id}`)}
                className="p-4 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/50 shadow-subtle cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-xl">{doc.icon || '📄'}</span>
                  <div className="truncate">
                    <h3 className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF]">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {(doc.tags || []).map((t, idx) => (
                        <Badge key={idx} variant="default" size="xs">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[#7657E8]" />
              </div>
            ))}

            {results.folders.map((fld) => (
              <div
                key={fld._id}
                onClick={() => navigate(`/folders?id=${fld._id}`)}
                className="p-4 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/50 shadow-subtle cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{fld.icon || '📁'}</span>
                  <div>
                    <h3 className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF]">
                      {fld.name}
                    </h3>
                    <span className="text-[10px] text-[#77738B]">Workspace Folder</span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[#7657E8]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
