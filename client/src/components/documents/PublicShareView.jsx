import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, Lock, ArrowLeft, Download, FileText } from 'lucide-react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';
import api from '../../services/api';

export const PublicShareView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicDocument(token)
      .then((res) => setDoc(res.document))
      .catch((err) => setError(err.message || 'Unable to load shared document'))
      .finally(() => setLoading(false));
  }, [token]);

  let plainContent = '';
  if (doc?.data) {
    if (typeof doc.data === 'string') {
      plainContent = doc.data;
    } else if (doc.data.ops) {
      plainContent = doc.data.ops
        .map((op) => (typeof op.insert === 'string' ? op.insert : ''))
        .join('');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#11101B] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE8F0] dark:border-[#282440]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7657E8] to-[#9D84F7] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              D
            </span>
            <span className="font-bold text-sm text-[#242039] dark:text-[#F1EFFF]">
              Docora Shared Document
            </span>
            <Badge variant="default" size="xs">
              <Globe className="w-3 h-3 text-[#7657E8]" /> Public View
            </Badge>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            Open Workspace
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#77738B]">
            Loading shared document...
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#191728] border border-rose-500/20 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
              Access Restricted
            </h3>
            <p className="text-xs text-[#77738B] max-w-sm mx-auto">{error}</p>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-premium space-y-6">
            <div>
              <span className="text-3xl mb-2 block">{doc.icon || '📄'}</span>
              <h1 className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF]">
                {doc.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#77738B] mt-2">
                <span>Shared by {doc.ownerName || 'Workspace Author'}</span>
                <span>•</span>
                <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE8F0] dark:border-[#282440] text-sm leading-relaxed whitespace-pre-wrap text-[#242039] dark:text-[#F1EFFF]">
              {plainContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicShareView;
