import { useState, useEffect, useCallback } from "react";
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownEditor = () => {
  //State initialization
  const [markdown, setMarkdown] = useState(
    '# Welcome to Markdown Editor\n\nStart typing your markdown here...\n\n## Features\n- Live preview\n- Syntax highlighting\n- Dark mode support\n- Local storage persistence\n- Toolbar with formatting buttons\n- Keyboard shortcuts (Ctrl+B, Ctrl+I)\n\n## Example Content\n\n**Bold text** and *italic text*\n\n`Inline code` and code blocks:\n\n```javascript\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n```\n\n> This is a blockquote\n> It can span multiple lines\n\n### Task List\n- [x] Build basic editor\n- [x] Add live preview\n- [ ] Add more features\n- [ ] Polish the UI\n\n---\n\n*Happy writing!*'
  );
  const [viewMode, setViewMode] = useState("split");
  const [isDarkMode, setIsDarkMode] = useState(false);

  //Load from local storage on mount
  useEffect(() => {
    const savedMarkdown = localStorage.getItem("markdown-editor-content");
    const savedDarkMode = localStorage.getItem("markdown-editor-dark-mode");

    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    }

    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  //changes to the markdown are saved in the local storage(there has to be a better way to do this)
  useEffect(() => {
    localStorage.setItem("markdown-editor-content", markdown);
  }, [markdown]);

  //Dark mode thing(could do with following the os current theme)
  useEffect(() => {
    localStorage.setItem(
      "markdown-editor-dark-mode",
      JSON.stringify(isDarkMode)
    );
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#111827";
      document.body.style.color = "#f9fafb";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#111827";
    }
  }, [isDarkMode]);

  //Bad code for directly manipulating textarea selection and inserting formatting(change this with useRef or something else)
  //changes needed are remove the markdown dependency from useCallback and use a ref for the textarea
  const insertFormatting = useCallback(
    (before, after = "") => {
      const textarea = document.getElementById("markdown-textarea");
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = markdown.substring(start, end);

      const newText =
        markdown.substring(0, start) +
        before +
        selectedText +
        after +
        markdown.substring(end);
      setMarkdown(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    },
    [markdown]
  );

  //Keyboard shortcuts for bold and italic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            insertFormatting("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertFormatting("*", "*");
            break;
          case "s":
            e.preventDefault();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [insertFormatting]);

  //Toolbar which is good enough for now
  const toolbarButtons = [
    {
      label: "Bold",
      title: "Bold (Ctrl+B)",
      action: () => insertFormatting("**", "**"),
    },
    {
      label: "Italic",
      title: "Italic (Ctrl+I)",
      action: () => insertFormatting("*", "*"),
    },
    { label: "H1", title: "Header 1", action: () => insertFormatting("# ") },
    { label: "H2", title: "Header 2", action: () => insertFormatting("## ") },
    { label: "H3", title: "Header 3", action: () => insertFormatting("### ") },
    { label: "Code", title: "Code", action: () => insertFormatting("`", "`") },
    {
      label: "Link",
      title: "Link",
      action: () => insertFormatting("[", "](https://example.com)"),
    },
    {
      label: "List",
      title: "Bullet List",
      action: () => insertFormatting("- "),
    },
    {
      label: "Quote",
      title: "Blockquote",
      action: () => insertFormatting("> "),
    },
  ];

  //Rendering markdown with regex good enough for now(adding code highlighting and other stuff later)
  //XSS attack possible so use DOMpurify
  const renderMarkdown = (text) => {
    return (
      text
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*\*(.*?)\*\*\*/gim, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/gim, "<em>$1</em>")
        .replace(/```(\w+)?\n([\s\S]*?)```/gim, "<pre><code>$2</code></pre>")
        .replace(/`(.*?)`/gim, "<code>$1</code>")
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/gim,
          '<a href="$2" target="_blank">$1</a>'
        )
        .replace(
          /^\s*- \[x\] (.*$)/gim,
          '<div style="margin: 0.5em 0;"><input type="checkbox" checked disabled style="margin-right: 0.5em;">$1</div>'
        )
        .replace(
          /^\s*- \[ \] (.*$)/gim,
          '<div style="margin: 0.5em 0;"><input type="checkbox" disabled style="margin-right: 0.5em;">$1</div>'
        )
        // unordered list items
        .replace(/(?:^\s*-\s.*\n?)+/gim, (match) => {
          const items = match
            .trim()
            .split("\n")
            .map((line) => line.replace(/^\s*-\s(.*)$/, "<li>$1</li>"))
            .join("");
          return `<ul>${items}</ul>`;
        })
        // ordered list items
        .replace(/(?:^\s*\d+\.\s.*\n?)+/gim, (match) => {
          const items = match
            .trim()
            .split("\n")
            .map((line) => line.replace(/^\s*\d+\.\s(.*)$/, "<li>$1</li>"))
            .join("");
          return `<ol>${items}</ol>`;
        })
        .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
        .replace(/^---$/gim, "<hr>")
        .replace(/\n\n/gim, "</p><p>")
        .replace(/\n/gim, "<br>")
    );
  };

  //Exporting as markdown and html
  const exportAsMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsHTML = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 1em; color: #666; }
  </style>
</head>
<body>
  <div>${renderMarkdown(markdown)}</div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  //Layout of the editor
  return (
    <div
      className={`h-screen flex flex-col ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="border-b border-gray-300 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Markdown Editor</h1>

          <div className="flex items-center gap-4">
            <div className="flex border rounded-lg overflow-hidden">
              {[
                { mode: "write", label: "Write", title: "Editor only" },
                { mode: "split", label: "Split", title: "Editor + Preview" },
                { mode: "preview", label: "Preview", title: "Preview only" },
              ].map(({ mode, label, title }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={title}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportAsMarkdown}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                title="Export as Markdown"
              >
                Export MD
              </button>
              <button
                onClick={exportAsHTML}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                title="Export as HTML"
              >
                Export HTML
              </button>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              title="Toggle dark mode"
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {toolbarButtons.map((button) => (
            <button
              key={button.label}
              onClick={button.action}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono"
              title={button.title}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {(viewMode === "write" || viewMode === "split") && (
          <div
            className={`${
              viewMode === "split" ? "w-1/2" : "w-full"
            } border-r border-gray-300 dark:border-gray-700 flex flex-col`}
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                Editor
              </span>
            </div>
            <textarea
              id="markdown-textarea"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 p-4 resize-none outline-none bg-transparent font-mono text-sm leading-relaxed"
              placeholder="Start typing your markdown here..."
              style={{ tabSize: 2 }}
            />
          </div>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`${
              viewMode === "split" ? "w-1/2" : "w-full"
            } flex flex-col`}
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                Preview
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-900">
              <div
                dangerouslySetInnerHTML={{
                  __html: `<p>${renderMarkdown(markdown)}</p>`,
                }}
                className="markdown-content max-w-none prose prose-lg dark:prose-invert"
              />
            </div>
          </div>
        )}
      </div>

      //Stats and info bar
      <div className="border-t border-gray-300 dark:border-gray-700 p-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <div>
          <span className="mr-4">
            Words:{" "}
            {markdown.split(/\s+/).filter((word) => word.length > 0).length}
          </span>
          <span className="mr-4">Characters: {markdown.length}</span>
          <span>Mode: {viewMode}</span>
        </div>
        <div className="text-gray-500">
          Auto-saved to localStorage | Ctrl+B (Bold) | Ctrl+I (Italic)
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;


//Summary of changes made: Added comments to the code for better understanding of different sections and functionalities.
//Todos: Sanitize HTML output, improve dom manipulation with useRef, dark mode detection from OS, code highlighting, better markdown parsing with a library(like react markdown)