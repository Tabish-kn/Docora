import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState(null);

  const refreshData = useCallback(async () => {
    try {
      const [wsRes, fldRes, docRes] = await Promise.all([
        api.getWorkspace().catch(() => ({ workspace: null })),
        api.getFolders().catch(() => ({ folders: [] })),
        api.getDocuments().catch(() => ({ documents: [] })),
      ]);

      if (wsRes.workspace) setWorkspace(wsRes.workspace);
      setFolders(fldRes.folders || []);
      setDocuments(docRes.documents || []);
    } catch (err) {
      console.warn('Error refreshing workspace data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        folders,
        documents,
        loading,
        activeFolderId,
        setActiveFolderId,
        refreshData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
