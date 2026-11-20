import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutTemplate,
  Users,
  FileCode,
  Layers,
  Palette,
  CheckSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const TemplatesView = () => {
  const navigate = useNavigate();
  const { refreshData } = useWorkspace();
  const { showToast } = useToast();

  const templates = [
    {
      id: 'meeting',
      title: 'Team Meeting Notes',
      description: 'Capture attendees, agenda items, key decisions, and follow-up action checklists.',
      icon: <Users className="w-5 h-5 text-[#7657E8]" />,
      category: 'Management',
      content: {
        ops: [
          { insert: 'Team Weekly Sync Notes\n', attributes: { header: 1 } },
          { insert: `Date: ${new Date().toLocaleDateString()} | Facilitator: Team Lead\n`, attributes: { italic: true } },
          { insert: '\nAgenda & Key Discussion Topics\n', attributes: { header: 2 } },
          { insert: 'Review sprint progress against quarterly goals\n', attributes: { list: 'bullet' } },
          { insert: 'Cross-functional dependencies between Design and Engineering\n', attributes: { list: 'bullet' } },
          { insert: 'Customer feedback on the latest release\n', attributes: { list: 'bullet' } },
          { insert: '\nAction Items & Ownership\n', attributes: { header: 2 } },
          { insert: 'Update API schemas and deploy migration test\n', attributes: { list: 'check' } },
          { insert: 'Schedule customer demo for upcoming features\n', attributes: { list: 'check' } },
        ],
      },
    },
    {
      id: 'prd',
      title: 'Product Requirements Document (PRD)',
      description: 'Define problem statement, target audience, user stories, and acceptance criteria.',
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      category: 'Product',
      content: {
        ops: [
          { insert: 'Product Requirements Document (PRD)\n', attributes: { header: 1 } },
          { insert: '1. Problem Statement & Opportunity\n', attributes: { header: 2 } },
          { insert: 'Explain the user pain point and market validation.\n\n' },
          { insert: '2. Goals & Success Metrics\n', attributes: { header: 2 } },
          { insert: 'Increase collaboration engagement by 35%\n', attributes: { list: 'bullet' } },
          { insert: 'Reduce document load latency under 150ms\n', attributes: { list: 'bullet' } },
          { insert: '\n3. User Stories & Acceptance Criteria\n', attributes: { header: 2 } },
          { insert: 'As a workspace collaborator, I want instant presence indicators.\n', attributes: { list: 'check' } },
          { insert: 'As an admin, I want granular role-based permissions.\n', attributes: { list: 'check' } },
        ],
      },
    },
    {
      id: 'arch',
      title: 'Engineering System Architecture',
      description: 'Detailed technical blueprint for services, APIs, data stores, and resilience.',
      icon: <FileCode className="w-5 h-5 text-indigo-500" />,
      category: 'Engineering',
      content: {
        ops: [
          { insert: 'System Architecture Specification\n', attributes: { header: 1 } },
          { insert: 'Architecture Overview\n', attributes: { header: 2 } },
          { insert: 'Unified Express REST API and Socket.IO transport layer.\n\n' },
          { insert: 'Data Models & Schemas\n', attributes: { header: 2 } },
          { insert: 'Document: _id, title, data (Quill Delta), ownerId, workspaceId\n', attributes: { list: 'bullet' } },
          { insert: 'Workspace: id, name, members, plan, storage\n', attributes: { list: 'bullet' } },
        ],
      },
    },
    {
      id: 'brand',
      title: 'Brand Guidelines & Design Tokens',
      description: 'Color palette tokens, typography rules, component styling, and brand positioning.',
      icon: <Palette className="w-5 h-5 text-[#F1A34A]" />,
      category: 'Design',
      content: {
        ops: [
          { insert: 'Brand Guidelines & Design Tokens\n', attributes: { header: 1 } },
          { insert: 'Brand Identity: Intelligent, minimal, collaborative, and fast.\n\n' },
          { insert: 'Color Palette Tokens\n', attributes: { header: 2 } },
          { insert: 'Primary Brand: #7657E8\n', attributes: { list: 'bullet' } },
          { insert: 'Background Canvas: #F8F7FF\n', attributes: { list: 'bullet' } },
          { insert: 'Success Mint: #159B77\n', attributes: { list: 'bullet' } },
          { insert: 'Warm Accent: #F1A34A\n', attributes: { list: 'bullet' } },
        ],
      },
    },
  ];

  const handleUseTemplate = async (template) => {
    try {
      const res = await api.createDocument({
        title: template.title,
        data: template.content,
      });
      await refreshData();
      showToast(`Created document from ${template.title}`, 'success');
      navigate(`/documents/${res.document._id}`);
    } catch (err) {
      showToast('Failed to apply template', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF]">
          Document Template Library
        </h1>
        <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
          Start with battle-tested templates inspired by Notion, Linear, and modern SaaS workflows.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/50 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-[#F8F7FF] dark:bg-[#201D33] border border-[#EAE8F0] dark:border-[#282440]">
                  {tpl.icon}
                </div>
                <Badge variant="default" size="xs">
                  {tpl.category}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
                {tpl.title}
              </h3>
              <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-1.5 leading-relaxed">
                {tpl.description}
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => handleUseTemplate(tpl)}
              className="w-full text-xs"
            >
              Use This Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesView;
