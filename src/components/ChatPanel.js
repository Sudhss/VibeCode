import React, { useState, useEffect, useRef, useCallback } from 'react';
import { streamAIResponse, parseAIResponse } from '../utils/aiService';
import MessageBubble from './MessageBubble';
import styles from './ChatPanel.module.css';

const WELCOME_SUGGESTIONS = [
  { icon: '🌐', label: 'Landing Page', prompt: 'Build a stunning SaaS landing page with hero, features, pricing, and CTA sections. Dark theme, modern design.' },
  { icon: '📊', label: 'Dashboard', prompt: 'Create an analytics dashboard with charts, KPI cards, a data table, and sidebar navigation. Dark theme.' },
  { icon: '🛒', label: 'CRUD App', prompt: 'Build a task management app with add/edit/delete tasks, priority levels, and filtering. Clean dark UI.' },
  { icon: '🎮', label: 'Mini Game', prompt: 'Build a snake game with score tracking, smooth animations, and a sleek dark arcade-style UI.' },
];

function getStoredMessages() {
  try {
    const s = localStorage.getItem('vibecode_messages');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export default function ChatPanel({ project, onFilesUpdate, isBuilding, setIsBuilding }) {
  const [messages, setMessages] = useState(getStoredMessages);
  const [input, setInput] = useState('');
  const [streamingMsg, setStreamingMsg] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('vibecode_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMsg]);

  const buildContextMessages = useCallback(() => {
    const fileContext = Object.keys(project.files || {}).length > 0
      ? `\n\nCurrent project files:\n${Object.entries(project.files).map(([k, v]) => `### ${k}\n${v}`).join('\n\n')}`
      : '';

    return messages.map((m, i) => ({
      role: m.role,
      content: i === 0 && fileContext ? m.content + fileContext : m.content
    }));
  }, [messages, project.files]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isBuilding) return;
    const userMsg = { id: Date.now(), role: 'user', content: text.trim() };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput('');
    setIsBuilding(true);

    const contextMsgs = buildContextMessages();
    const apiMsgs = [...contextMsgs.slice(0, -1), { role: 'user', content: userMsg.content }];

    let rawFull = '';
    setStreamingMsg({ id: 'streaming', role: 'assistant', content: '', streaming: true });

    await streamAIResponse(
      apiMsgs,
      (partial) => {
        rawFull = partial;
        setStreamingMsg({ id: 'streaming', role: 'assistant', content: partial, streaming: true });
      },
      (final) => {
        rawFull = final;
        const parsed = parseAIResponse(final);
        const assistantMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: parsed.message || final,
          files: parsed.files || null,
          rawResponse: final,
          error: parsed.error || null,
        };
        setMessages(prev => [...prev, assistantMsg]);
        setStreamingMsg(null);
        setIsBuilding(false);
        if (parsed.files) {
          onFilesUpdate(parsed.files);
        }
      },
      (err) => {
        const errMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `❌ Error: ${err}`,
          isError: true,
        };
        setMessages(prev => [...prev, errMsg]);
        setStreamingMsg(null);
        setIsBuilding(false);
      }
    );
  }, [messages, isBuilding, setIsBuilding, buildContextMessages, onFilesUpdate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('vibecode_messages');
  };

  const hasMessages = messages.length > 0 || streamingMsg;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.aiDot} />
          <span>AI Assistant</span>
        </div>
        {hasMessages && (
          <button className={styles.clearBtn} onClick={clearChat} title="Clear chat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {!hasMessages && (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#wLg)" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="wLg" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f8ef7"/><stop offset="1" stopColor="#22d3ee"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2>What are we building?</h2>
            <p>Describe your app and I'll generate the complete code instantly.</p>
            <div className={styles.suggestions}>
              {WELCOME_SUGGESTIONS.map((s) => (
                <button key={s.label} className={styles.suggestion} onClick={() => sendMessage(s.prompt)}>
                  <span className={styles.suggIcon}>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {streamingMsg && (
          <MessageBubble message={streamingMsg} />
        )}

        {isBuilding && !streamingMsg && (
          <div className={styles.thinking}>
            <div className={styles.thinkingDots}>
              <span /><span /><span />
            </div>
            <span>Building your app...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={isBuilding ? 'AI is building...' : 'Describe what you want to build...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBuilding}
            rows={1}
            style={{ height: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
          />
          <button
            className={`${styles.sendBtn} ${isBuilding ? styles.sendBtnBuilding : ''}`}
            onClick={() => sendMessage(input)}
            disabled={isBuilding || !input.trim()}
          >
            {isBuilding ? (
              <span className={styles.sendSpinner} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
        <div className={styles.inputHint}>
          <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for newline
        </div>
      </div>
    </div>
  );
}
