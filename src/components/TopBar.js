import React from 'react';
import { useAuth } from '../hooks/useAuth';
import styles from './TopBar.module.css';

export default function TopBar({ project, onReset }) {
  const { user, logout } = useAuth();
  const fileCount = Object.keys(project.files || {}).length;

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#tbLg)" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="tbLg" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f8ef7"/><stop offset="1" stopColor="#22d3ee"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoName}>VibeCode</span>
          <span className={styles.badge}>AI</span>
        </div>

        {fileCount > 0 && (
          <div className={styles.projectInfo}>
            <div className={styles.dot} />
            <span>{fileCount} file{fileCount !== 1 ? 's' : ''} generated</span>
          </div>
        )}
      </div>

      <div className={styles.right}>
        {fileCount > 0 && (
          <button className={styles.resetBtn} onClick={onReset} title="Reset project">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
            Reset
          </button>
        )}

        <div className={styles.userChip}>
          <div className={styles.avatar}>{user?.avatar || 'TU'}</div>
          <span className={styles.userName}>{user?.displayName}</span>
        </div>

        <button className={styles.logoutBtn} onClick={logout} title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
