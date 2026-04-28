import { useState, useEffect, useCallback } from 'react';

const DEFAULT_PROJECT = {
  files: {},
  activeFile: null,
  entryFile: 'index.html',
};

export function useProject() {
  const [project, setProject] = useState(() => {
    try {
      const stored = localStorage.getItem('vibecode_project');
      return stored ? JSON.parse(stored) : DEFAULT_PROJECT;
    } catch { return DEFAULT_PROJECT; }
  });

  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('vibecode_project', JSON.stringify(project));
  }, [project]);

  const updateFiles = useCallback((newFiles) => {
    setProject(prev => {
      const merged = { ...prev.files, ...newFiles };
      const entry = merged['index.html'] ? 'index.html' : Object.keys(merged)[0] || null;
      return { ...prev, files: merged, activeFile: prev.activeFile || entry, entryFile: entry };
    });
    setPreviewKey(k => k + 1);
  }, []);

  const setActiveFile = useCallback((filename) => {
    setProject(prev => ({ ...prev, activeFile: filename }));
  }, []);

  const resetProject = useCallback(() => {
    setProject(DEFAULT_PROJECT);
    setPreviewKey(k => k + 1);
  }, []);

  return { project, updateFiles, setActiveFile, resetProject, previewKey };
}
