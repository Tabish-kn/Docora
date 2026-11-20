import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../services/api';

export const FileUploadModal = ({ isOpen, onClose, folderId, documentId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const { showToast } = useToast();
  const { refreshData } = useWorkspace();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files) => {
    // Check max size: 50MB
    const valid = files.filter((f) => f.size <= 50 * 1024 * 1024);
    if (valid.length < files.length) {
      showToast('Some files exceed the 50MB size limit', 'error');
    }
    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setProgress(30);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    if (folderId) formData.append('folderId', folderId);
    if (documentId) formData.append('documentId', documentId);

    try {
      setProgress(75);
      await api.uploadFiles(formData);
      setProgress(100);
      showToast(`Uploaded ${selectedFiles.length} files successfully`, 'success');
      setSelectedFiles([]);
      refreshData();
      onClose();
    } catch (err) {
      showToast(err.message || 'File upload failed', 'error');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Documents & Attachments"
      description="Support for PDFs, Word docs, spreadsheets, slides, images, and text."
    >
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#7657E8] bg-[#F0EDFF]/50 dark:bg-[#7657E8]/10'
              : 'border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/60 bg-[#F8F7FF] dark:bg-[#1C1A2E]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFiles(Array.from(e.target.files))}
            className="hidden"
          />
          <UploadCloud className="w-10 h-10 text-[#7657E8] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#242039] dark:text-[#F1EFFF]">
            Drag & drop files here, or <span className="text-[#7657E8]">browse</span>
          </p>
          <p className="text-[11px] text-[#77738B] dark:text-[#A39EBC] mt-1">
            Max 50MB per file • Up to 10 files at once
          </p>
        </div>

        {/* Selected files list */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <File className="w-4 h-4 text-[#7657E8] flex-shrink-0" />
                  <span className="truncate font-medium text-[#242039] dark:text-[#F1EFFF]">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-[#77738B]">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-gray-400 hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="w-full bg-[#EAE8F0] dark:bg-[#282440] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#7657E8] h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE8F0] dark:border-[#282440]">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUploadSubmit}
            isLoading={uploading}
            disabled={selectedFiles.length === 0}
          >
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FileUploadModal;
