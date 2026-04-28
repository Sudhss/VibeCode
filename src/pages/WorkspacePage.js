import React, { useState, useCallback } from 'react';
import ChatPanel from '../components/ChatPanel';
import PreviewPanel from '../components/PreviewPanel';
import TopBar from '../components/TopBar';
import { useProject } from '../hooks/useProject';
import styles from './WorkspacePage.module.css';

export default function WorkspacePage() {
  const { project, updateFiles, setActiveFile, resetProject, previewKey } = useProject();
  const [isBuilding, setIsBuilding] = useState(false);

  const handleFilesUpdate = useCallback((files) => {
    updateFiles(files);
  }, [updateFiles]);

  return (
    <div className={styles.root}>
      <TopBar project={project} onReset={resetProject} />
      <div className={styles.workspace}>
        <div className={styles.chatPane}>
          <ChatPanel
            project={project}
            onFilesUpdate={handleFilesUpdate}
            isBuilding={isBuilding}
            setIsBuilding={setIsBuilding}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.previewPane}>
          <PreviewPanel
            project={project}
            previewKey={previewKey}
            onFileSelect={setActiveFile}
            isBuilding={isBuilding}
          />
        </div>
      </div>
    </div>
  );
}
