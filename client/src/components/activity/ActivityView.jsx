import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  FileText,
  MessageSquare,
  Star,
  Users,
  Folder,
  ArrowRight,
  Clock,
  Filter,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import api from '../../services/api';

export const ActivityView = () => {
  const [activities, setActivities] = useState([]);
  const [filterAction, setFilterAction] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.getAnalytics().then((res) => {
      setActivities(res.recentActivities || []);
    });
  }, []);

  const filteredActivities = activities.filter((act) => {
    if (filterAction === 'all') return true;
    return act.action === filterAction;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF]">
            Workspace Activity Log
          </h1>
          <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
            Audit trail of all document edits, comments, shares, and folder updates.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#F8F7FF] dark:bg-[#1C1A2E] p-1 rounded-xl border border-[#EAE8F0] dark:border-[#282440] text-xs">
          {['all', 'edited', 'created', 'commented', 'starred'].map((action) => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filterAction === action
                  ? 'bg-white dark:bg-[#282440] text-[#7657E8] dark:text-[#A78BFA] shadow-subtle'
                  : 'text-[#77738B]'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle divide-y divide-[#EAE8F0] dark:divide-[#282440]">
        {filteredActivities.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#77738B]">
            No activities recorded matching this filter.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div key={act._id} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Avatar src={act.userAvatar} name={act.userName} size="sm" />
                <div className="text-xs">
                  <div className="font-semibold text-[#242039] dark:text-[#F1EFFF]">
                    {act.userName}{' '}
                    <span className="font-normal text-[#77738B]">
                      {act.action} {act.targetType}
                    </span>
                  </div>
                  <div
                    onClick={() => act.targetType === 'document' && navigate(`/documents/${act.targetId}`)}
                    className="font-medium text-[#7657E8] cursor-pointer hover:underline mt-0.5"
                  >
                    "{act.targetTitle}"
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#77738B] mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {act.targetType === 'document' && (
                <button
                  onClick={() => navigate(`/documents/${act.targetId}`)}
                  className="p-1.5 rounded-lg text-[#77738B] hover:text-[#7657E8] transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityView;
