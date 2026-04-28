import React, { useState } from 'react';
import styles from './MessageBubble.module.css';

function FileTag({ filename }) {
  const ext = filename.split('.').pop();
  const colors = {
    html: '#fb923c', css: '#60a5fa', js: '#fbbf24',
    jsx: '#34d399', ts: '#60a5fa', json: '#a78bfa',
  };
  return (
    <span className={styles.fileTag} style={{ '--tag-color': colors[ext] || '#8892b0' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      {filename}
    </span>
  );
}

function StreamingCursor() {
  return <span className={styles.cursor} />;
}

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isStreaming = message.streaming;

  const copyContent = () => {
    navigator.clipboard.writeText(message.rawResponse || message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Render assistant message content — strip JSON, show clean message
  const displayContent = () => {
    if (isUser) return message.content;
    if (isStreaming) {
      // Try to extract message field while streaming
      try {
        const match = message.content.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') + '...';
      } catch {}
      // Show streaming indicator
      return null;
    }
    return message.content;
  };

  const content = displayContent();

  return (
    <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble} fade-in`}>
      {!isUser && (
        <div className={styles.aiAvatar}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#mbLg)"/>
            <defs>
              <linearGradient id="mbLg" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f8ef7"/><stop offset="1" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      <div className={styles.content}>
        {isStreaming && !content ? (
          <div className={styles.streamingIndicator}>
            <div className={styles.streamDots}>
              <span /><span /><span />
            </div>
            <span className={styles.streamLabel}>Generating...</span>
          </div>
        ) : (
          <div className={`${styles.text} ${message.isError ? styles.errorText : ''}`}>
            {content}
            {isStreaming && <StreamingCursor />}
          </div>
        )}

        {/* File tags for generated files */}
        {message.files && !isStreaming && (
          <div className={styles.fileTags}>
            <span className={styles.fileTagsLabel}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Generated
            </span>
            {Object.keys(message.files).map(f => <FileTag key={f} filename={f} />)}
          </div>
        )}

        {/* Copy button for AI messages */}
        {!isUser && !isStreaming && message.rawResponse && (
          <button className={styles.copyBtn} onClick={copyContent}>
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy raw
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
