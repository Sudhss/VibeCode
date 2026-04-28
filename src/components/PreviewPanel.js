import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './PreviewPanel.module.css';

const TABS = [
  {
    id: 'preview', label: 'Preview',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  },
  {
    id: 'code', label: 'Code',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  },
];

function buildIframeDoc(files) {
  if (!files || Object.keys(files).length === 0) return null;

  let html = files['index.html'] || '';
  const css = files['style.css'] || files['styles.css'] || '';
  const js = files['app.js'] || files['main.js'] || files['script.js'] || '';

  // If no HTML, wrap in basic document
  if (!html && (css || js)) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head><body><script src="app.js"></script></body></html>`;
  }

  // Inject CSS inline if referenced as external
  if (css && html.includes('style.css')) {
    html = html.replace(/<link[^>]+style\.css[^>]*>/gi, `<style>\n${css}\n</style>`);
  }
  if (css && html.includes('styles.css')) {
    html = html.replace(/<link[^>]+styles\.css[^>]*>/gi, `<style>\n${css}\n</style>`);
  }

  // Inject JS inline if referenced as external
  if (js && html.includes('app.js')) {
    html = html.replace(/<script[^>]+src=["']app\.js["'][^>]*><\/script>/gi, `<script>\n${js}\n</script>`);
  }
  if (js && html.includes('main.js')) {
    html = html.replace(/<script[^>]+src=["']main\.js["'][^>]*><\/script>/gi, `<script>\n${js}\n</script>`);
  }
  if (js && html.includes('script.js')) {
    html = html.replace(/<script[^>]+src=["']script\.js["'][^>]*><\/script>/gi, `<script>\n${js}\n</script>`);
  }

  // Inject remaining files that are still referenced as external
  Object.entries(files).forEach(([name, content]) => {
    if (name === 'index.html') return;
    const ext = name.split('.').pop();
    if (ext === 'css' && html.includes(name)) {
      html = html.replace(new RegExp(`<link[^>]+${name}[^>]*>`, 'gi'), `<style>\n${content}\n</style>`);
    }
    if (ext === 'js' && html.includes(name)) {
      html = html.replace(new RegExp(`<script[^>]+src=["']${name}["'][^>]*></script>`, 'gi'), `<script>\n${content}\n</script>`);
    }
  });

  return html;
}

function SyntaxLine({ line }) {
  const highlighted = line
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // HTML tags
    .replace(/(&lt;\/?)([\w-]+)/g, '<span class="tok-tag">$1<span class="tok-tagname">$2</span></span>')
    // Attributes
    .replace(/(\s)([\w-:]+)(=)/g, '$1<span class="tok-attr">$2</span>$3')
    // Strings
    .replace(/"([^"]*)"/g, '"<span class="tok-str">$1</span>"')
    .replace(/'([^']*)'/g, '\'<span class="tok-str">$1</span>\'')
    // JS keywords
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|from|async|await|new|this|typeof|null|undefined|true|false)\b/g, '<span class="tok-kw">$1</span>')
    // CSS properties
    .replace(/\b(color|background|display|flex|grid|margin|padding|border|font|width|height|position|transform|transition|animation)\b/g, '<span class="tok-prop">$1</span>')
    // Numbers
    .replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?)\b/g, '<span class="tok-num">$1</span>')
    // Comments
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-comment">$1</span>');

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

function CodeViewer({ files, activeFile, onFileSelect }) {
  const fileNames = Object.keys(files || {});
  const current = activeFile && files[activeFile] ? activeFile : fileNames[0];
  const code = files?.[current] || '';
  const lines = code.split('\n');

  return (
    <div className={styles.codeViewer}>
      {/* File tabs */}
      <div className={styles.fileTabs}>
        {fileNames.map(name => {
          const ext = name.split('.').pop();
          const colors = { html: '#fb923c', css: '#60a5fa', js: '#fbbf24', jsx: '#34d399' };
          return (
            <button
              key={name}
              className={`${styles.fileTab} ${name === current ? styles.fileTabActive : ''}`}
              onClick={() => onFileSelect(name)}
              style={{ '--ext-color': colors[ext] || '#8892b0' }}
            >
              <span className={styles.fileTabDot} />
              {name}
            </button>
          );
        })}
      </div>

      {/* Code */}
      <div className={styles.codeBody}>
        <div className={styles.lineNumbers}>
          {lines.map((_, i) => <span key={i}>{i + 1}</span>)}
        </div>
        <pre className={styles.codeContent}>
          <code>
            {lines.map((line, i) => (
              <div key={i} className={styles.codeLine}>
                <SyntaxLine line={line} />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function EmptyState({ isBuilding }) {
  return (
    <div className={styles.emptyState}>
      {isBuilding ? (
        <>
          <div className={styles.buildingAnim}>
            <div className={styles.buildRing} />
            <div className={styles.buildRingInner} />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#esLg)"/>
              <defs>
                <linearGradient id="esLg" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f8ef7"/><stop offset="1" stopColor="#22d3ee"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className={styles.buildingLabel}>Building your app...</p>
          <span className={styles.buildingSubLabel}>AI is writing code</span>
        </>
      ) : (
        <>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <p className={styles.emptyLabel}>No app yet</p>
          <span className={styles.emptySubLabel}>Describe what to build in the chat</span>
        </>
      )}
    </div>
  );
}

export default function PreviewPanel({ project, previewKey, onFileSelect, isBuilding }) {
  const [activeTab, setActiveTab] = useState('preview');
  const iframeRef = useRef(null);
  const hasFiles = Object.keys(project.files || {}).length > 0;

  const iframeDoc = useMemo(() => buildIframeDoc(project.files), [project.files, previewKey]);

  useEffect(() => {
    if (iframeRef.current && iframeDoc) {
      const iframe = iframeRef.current;
      iframe.srcdoc = iframeDoc;
    }
  }, [iframeDoc, previewKey]);

  return (
    <div className={styles.panel}>
      {/* Panel header */}
      <div className={styles.header}>
        <div className={styles.tabRow}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.headerRight}>
          {hasFiles && activeTab === 'preview' && (
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Live
            </div>
          )}
          {hasFiles && activeTab === 'preview' && (
            <button
              className={styles.refreshBtn}
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.srcdoc = iframeRef.current.srcdoc;
                }
              }}
              title="Refresh preview"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'preview' && (
          <>
            {!hasFiles || isBuilding ? (
              <EmptyState isBuilding={isBuilding} />
            ) : (
              <iframe
                ref={iframeRef}
                className={styles.iframe}
                title="App Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                srcdoc={iframeDoc || ''}
              />
            )}
          </>
        )}

        {activeTab === 'code' && (
          <>
            {!hasFiles ? (
              <EmptyState isBuilding={isBuilding} />
            ) : (
              <CodeViewer
                files={project.files}
                activeFile={project.activeFile}
                onFileSelect={onFileSelect}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
