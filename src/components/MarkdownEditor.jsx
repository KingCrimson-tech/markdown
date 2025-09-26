/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownEditor = () => {
  //State initialization
  const [markdown, setMarkdown] = useState(
    '# Welcome to Markdown Editor\n\nStart typing your markdown here...\n\n## Features\n- Live preview\n- Syntax highlighting\n- Dark mode support\n- Local storage persistence\n- Toolbar with formatting buttons\n- Keyboard shortcuts (Ctrl+B, Ctrl+I)\n\n## Example Content\n\n**Bold text** and *italic text*\n\n`Inline code` and code blocks:\n\n```javascript\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n```\n\n> This is a blockquote\n> It can span multiple lines\n\n### Task List\n- [x] Build basic editor\n- [x] Add live preview\n- [ ] Add more features\n- [ ] Polish the UI\n\n---\n\n*Happy writing!*'
  );
  const [viewMode, setViewMode] = useState("split");
  const [theme, setTheme] = useState("auto");
  const textareaRef = useRef(null);

  //Load from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("markdown-editor-theme");
    if (savedTheme === "true") setTheme(true);
    else if (savedTheme === "false") setTheme(false);
    else setTheme("auto");
    // Load markdown as before
    const savedMarkdown = localStorage.getItem("markdown-editor-content");
    if (savedMarkdown) setMarkdown(savedMarkdown);
  }, []);

  //A useEffect to listen to the os theme changes
  useEffect(() => {
    let dark;
    if (theme === "auto") {
      dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      dark = theme === true;
    }
    if (dark) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#111827";
      document.body.style.color = "#f9fafb";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#111827";
    }
    localStorage.setItem("markdown-editor-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "auto") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setTheme("auto"); // triggers re-render
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  //changes to the markdown are saved in the local storage(there has to be a better way to do this)
  useEffect(() => {
    localStorage.setItem("markdown-editor-content", markdown);
  }, [markdown]);

  // //Dark mode thing(could do with following the os current theme)
  // useEffect(() => {
  //   localStorage.setItem(
  //     "markdown-editor-dark-mode",
  //     JSON.stringify(isDarkMode)
  //   );
  //   if (isDarkMode) {
  //     document.documentElement.classList.add("dark");
  //     document.body.style.backgroundColor = "#111827";
  //     document.body.style.color = "#f9fafb";
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //     document.body.style.backgroundColor = "#ffffff";
  //     document.body.style.color = "#111827";
  //   }
  // }, [isDarkMode]);

  //Function to insert markdown formatting at cursor position(uses useRef hook for DOM manipulation instead of the prior direct manipulations)
  const insertFormatting = useCallback((before, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setMarkdown((prev) => {
      const selectedText = prev.substring(start, end);
      const newText =
        prev.substring(0, start) +
        before +
        selectedText +
        after +
        prev.substring(end);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
      return newText;
    });
  }, []);

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

  //Layout of the editor
  return (
    <div
      className={`h-screen flex flex-col ${
        (
          theme === "auto"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
            : theme === true
        )
          ? "dark bg-gray-900 text-white"
          : "bg-white text-gray-900"
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
            </div>

            <button
              onClick={() => {
                if (theme === "auto") setTheme(true);
                else if (theme === true) setTheme(false);
                else setTheme("auto");
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              title="Toggle theme"
            >
              {theme === "auto" ? "Auto" : theme === true ? "Dark" : "Light"}
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
              ref={textareaRef}
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
              <div className="markdown-content max-w-none prose prose-lg dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats and info bar */}
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
