import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  HardDrive,
  FileText,
  Folder,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Activity,
  Layers,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .getAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportReport = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docora_workspace_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Analytics report downloaded', 'success');
  };

  const summary = data?.summary || {
    totalDocuments: 4,
    totalFolders: 4,
    totalFiles: 3,
    starredDocuments: 3,
    sharedDocuments: 2,
    documentsThisMonth: 4,
    storageUsedBytes: 4823449600,
    storageLimitBytes: 21474836480,
    storageUsagePercentage: 24,
    activeMembers: 4,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF]">
            Workspace Analytics & Insights
          </h1>
          <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
            Real-time usage metrics, document growth, and collaboration activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5 text-[#7657E8]" />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
          <span className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC]">
            Total Workspace Documents
          </span>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-2">
            {summary.totalDocuments}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{summary.documentsThisMonth} this month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
          <span className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC]">
            Organized Folders
          </span>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-2">
            {summary.totalFolders}
          </div>
          <div className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-2">
            Across 4 categories
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
          <span className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC]">
            Cloud Storage Used
          </span>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-2">
            {(summary.storageUsedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB
          </div>
          <div className="w-full h-1.5 bg-[#EAE8F0] dark:bg-[#282440] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-[#7657E8] rounded-full"
              style={{ width: `${summary.storageUsagePercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-[#77738B] mt-1 flex justify-between">
            <span>{summary.storageUsagePercentage}% allocated</span>
            <span>20 GB Limit</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
          <span className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC]">
            Active Team Members
          </span>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-2">
            {summary.activeMembers}
          </div>
          <div className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-2">
            Collaborating in real-time
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Document & Edit Volume Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
                Monthly Document Creation & Edit Volume
              </h3>
              <p className="text-[11px] text-[#77738B]">Last 6 months progression</p>
            </div>
            <Badge variant="default" size="xs">
              Live Data
            </Badge>
          </div>

          <div className="h-48 flex items-end gap-6 justify-between pt-6 px-2">
            {(data?.monthlyTrends || []).map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  {/* Documents bar */}
                  <div
                    className="w-1/2 bg-[#7657E8] rounded-t-md transition-all hover:bg-[#6544D7]"
                    style={{ height: `${Math.min(100, item.documents * 5 + 20)}%` }}
                    title={`${item.documents} Documents`}
                  />
                  {/* Edits bar */}
                  <div
                    className="w-1/2 bg-[#F1A34A] rounded-t-md transition-all hover:bg-amber-600"
                    style={{ height: `${Math.min(100, item.edits * 1.5 + 15)}%` }}
                    title={`${item.edits} Edits`}
                  />
                </div>
                <span className="text-[11px] font-medium text-[#77738B]">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#EAE8F0] dark:border-[#282440] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7657E8]" />
              <span className="text-[#77738B]">Documents Created</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F1A34A]" />
              <span className="text-[#77738B]">Edits & Updates</span>
            </div>
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
                Document Distribution by Format
              </h3>
              <Badge variant="neutral" size="xs">
                Asset Types
              </Badge>
            </div>

            <div className="space-y-3.5 my-6">
              {(data?.typeDistribution || []).map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#242039] dark:text-[#F1EFFF]">
                      {item.name}
                    </span>
                    <span className="text-[#77738B]">{item.value} items</span>
                  </div>
                  <div className="w-full h-2 bg-[#F8F7FF] dark:bg-[#282440] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: item.color,
                        width: `${Math.min(100, (item.value / 10) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7FF] dark:bg-[#1C1A2E] text-xs text-[#77738B] flex items-center justify-between">
            <span>Storage Optimization Score</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">98 / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
