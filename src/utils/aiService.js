const SYSTEM_PROMPT = `You are VibeCode — an elite AI software engineer embedded in a live coding environment.

Your job: Build complete, beautiful, working web applications from user descriptions.

## CORE RULES
1. ALWAYS respond with a JSON object in this exact format:
{
  "message": "Brief explanation of what you built/changed",
  "files": {
    "index.html": "...complete file content...",
    "style.css": "...complete file content...",
    "app.js": "...complete file content..."
  },
  "entryFile": "index.html"
}

2. Generate COMPLETE files — never partial snippets. Every file must be production-ready.

3. For simple apps: index.html (with embedded CSS + JS) is fine.
   For complex apps: Split into index.html, style.css, app.js (and more if needed).

4. The preview renders in an iframe. All files are injected. Use relative paths.

5. DESIGN STANDARDS:
   - Beautiful, modern UIs — not generic boilerplate
   - Dark themes preferred unless user specifies
   - Smooth animations, micro-interactions
   - Mobile-responsive
   - Professional typography

6. CODE STANDARDS:
   - Vanilla JS preferred (no build step needed in iframe)
   - Use CDN links for libraries if truly needed (React CDN, Chart.js CDN, etc.)
   - Clean, readable, well-structured code
   - Functional — everything must actually work

7. When user asks to FIX or MODIFY: Include ALL files (unchanged ones too) — not just the modified ones.

8. If user describes an error or problem, debug and fix it autonomously.

## FILE INJECTION SYSTEM
Your files are injected into an iframe like this:
- index.html is the entry point
- Other files (style.css, app.js, etc.) are injected as blob URLs
- Use <link rel="stylesheet" href="style.css"> and <script src="app.js"></script> in your HTML

## RESPOND ONLY WITH VALID JSON. No markdown, no explanation outside the JSON.`;

export async function streamAIResponse(messages, onChunk, onComplete, onError) {
  try {
    const apiMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(fullText);
          }
        } catch {}
      }
    }

    onComplete(fullText);
  } catch (err) {
    onError(err.message || 'Unknown error');
  }
}

export function parseAIResponse(raw) {
  try {
    const cleaned = raw.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');
    return JSON.parse(match[0]);
  } catch (e) {
    return {
      message: raw.length > 200 ? raw.slice(0, 200) + '...' : raw,
      files: null,
      error: 'Could not parse response as structured code output.'
    };
  }
}
