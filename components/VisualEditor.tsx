import React, { useState, useEffect, useRef } from 'react';

interface VisualEditorProps {
    content: string;
    onChange: (html: string) => void;
    variables: { label: string; value: string }[];
    type?: 'Email' | 'SMS' | 'WhatsApp';
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ content, onChange, variables, type = 'Email' }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({ text: '', url: '', isButton: false });
    const hasInitialized = useRef<boolean>(false);
    const savedRangeRef = useRef<Range | null>(null);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
    };

    const restoreSelection = () => {
        if (savedRangeRef.current) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRangeRef.current);
            }
        }
    };

    // Initial content load only. 
    // By only running this once (or when content genuinely changes from outside, not from typing), 
    // we prevent React from forcing a re-render that resets the cursor.
    useEffect(() => {
        if (editorRef.current && (!hasInitialized.current || (content !== editorRef.current.innerHTML && !document.activeElement?.isSameNode(editorRef.current)))) {
            editorRef.current.innerHTML = content || '';
            hasInitialized.current = true;
        }
    }, [content]);

    const exec = (command: string, value?: string) => {
        restoreSelection();
        document.execCommand(command, false, value);
        handleInput();
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const insertHTMLAtCursor = (html: string) => {
        editorRef.current?.focus();
        restoreSelection();
        let sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel && sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                const el = document.createElement("div");
                el.innerHTML = html;
                const frag = document.createDocumentFragment();
                let node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
        handleInput();
    };

    const insertVariable = (variable: string) => {
        if (type === 'Email') {
            // Removing contenteditable="false" so that execCommand (like font-size) can apply to it when highlighted
            const html = `<span class="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold mx-1">${variable}</span>&nbsp;`;
            insertHTMLAtCursor(html);
        } else {
            // SMS is plain text
            exec('insertText', variable);
        }
        setShowPicker(false);
    };

    const handleAddLink = () => {
        saveSelection();
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : '';
        setLinkData({ text: selectedText, url: '', isButton: false });
        setIsLinkModalOpen(true);
    };

    const finalizeLink = () => {
        if (!linkData.url) return;

        // If there was selected text, it might still be selected.
        // The safest way is to insert HTML directly.
        let html = '';
        if (linkData.isButton) {
            html = `<br><br><div style="text-align: center;"><a href="${linkData.url}" style="display: inline-block; background-color: #135bec; color: #ffffff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-family: sans-serif;">${linkData.text || 'Click Here'}</a></div><br>&nbsp;`;
        } else {
            html = `<a href="${linkData.url}" style="color: #135bec; text-decoration: underline; font-weight: bold;">${linkData.text || linkData.url}</a>&nbsp;`;
        }

        insertHTMLAtCursor(html);
        setIsLinkModalOpen(false);
    };

    const getCharCount = (t: string) => {
        const plain = t.replace(/<[^>]*>/g, '');
        const segments = Math.ceil(plain.length / 160) || 1;
        return { length: plain.length, segments };
    };

    const stats = getCharCount(content);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-2xl relative">

            {/* TOOLBAR */}
            <div className="p-3 bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-border-dark flex items-center gap-2 flex-wrap shrink-0">

                {/* Formatting Tools (Always visible for Email, hidden for SMS) */}
                {type === 'Email' && (
                    <>
                        <button onClick={() => exec('bold')} title="Bold" className="p-2 hover:bg-white dark:hover:bg-surface-dark rounded-lg transition-all text-slate-500 hover:text-primary">
                            <span className="material-symbols-outlined text-[18px]">format_bold</span>
                        </button>
                        <button onClick={() => exec('italic')} title="Italic" className="p-2 hover:bg-white dark:hover:bg-surface-dark rounded-lg transition-all text-slate-500 hover:text-primary">
                            <span className="material-symbols-outlined text-[18px]">format_italic</span>
                        </button>
                        <button onClick={() => exec('underline')} title="Underline" className="p-2 hover:bg-white dark:hover:bg-surface-dark rounded-lg transition-all text-slate-500 hover:text-primary">
                            <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                        </button>

                        <div className="h-6 w-px bg-slate-200 dark:bg-border-dark mx-1"></div>

                        {/* Font Size */}
                        <div className="flex items-center gap-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-2">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">text_fields</span>
                            <select
                                onChange={(e) => exec('fontSize', e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 py-1 pl-1 pr-6 cursor-pointer"
                                defaultValue="3"
                            >
                                <option value="1">Small</option>
                                <option value="3">Normal</option>
                                <option value="5">Large</option>
                                <option value="7">Huge</option>
                            </select>
                        </div>

                        {/* Text Color */}
                        <div className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-1 cursor-pointer overflow-hidden relative hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[14px] text-slate-500">palette</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Color</span>
                            <input
                                type="color"
                                onChange={(e) => exec('foreColor', e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Text Color"
                            />
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-border-dark mx-1"></div>
                    </>
                )}

                {/* Variable Picker (Available for both) */}
                <div className="relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[16px]">data_object</span>
                        Insert Variable
                    </button>

                    {showPicker && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl z-[100] overflow-hidden p-2 animate-[zoomIn_0.2s_ease-out]">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Customer Fields</p>
                            {variables.map(v => (
                                <button
                                    key={v.value}
                                    onClick={() => insertVariable(v.value)}
                                    className="w-full text-left px-3 py-2.5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-[11px] font-bold text-slate-700 dark:text-white flex items-center justify-between group"
                                >
                                    {v.label}
                                    <span className="text-[9px] text-slate-400 group-hover:text-primary/70">{v.value}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Aligned Tools */}
                <div className="ml-auto flex items-center gap-2">
                    {type === 'Email' ? (
                        <>
                            <button onClick={handleAddLink} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm" title="Add Button or Link">
                                <span className="material-symbols-outlined text-[16px]">link</span>
                                Link / Button
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 px-4 py-1 bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Chars</span>
                                <span className={`text-xs font-black italic ${stats.length > 160 ? 'text-orange-500' : 'text-primary'}`}>{stats.length}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200 dark:bg-border-dark"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Segments</span>
                                <span className="text-xs font-black italic text-primary">{stats.segments}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CANVAS AREA */}
            <div className="flex-1 overflow-y-auto p-12 bg-white dark:bg-[#0c111d] flex justify-center">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onMouseUp={saveSelection}
                    onKeyUp={saveSelection}
                    onMouseLeave={saveSelection}
                    // Prevent blur from saving constantly and resetting cursor
                    onBlur={() => {
                        saveSelection();
                        handleInput();
                    }}
                    className={`w-full max-w-2xl outline-none text-slate-700 dark:text-slate-300 leading-relaxed text-base prose prose-slate dark:prose-invert ${type !== 'Email' ? 'whitespace-pre-wrap font-medium text-lg' : ''}`}
                    placeholder={type === 'Email' ? "Design your message here..." : "Type your message here..."}
                    style={{ minHeight: '300px' }}
                />
            </div>

            {/* LINK / BUTTON PICKER MODAL */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsLinkModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-[zoomIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-widest">Add Link or Button</h3>
                            <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-1 bg-slate-100 dark:bg-background-dark rounded-2xl flex border border-slate-200 dark:border-border-dark">
                                <button
                                    onClick={() => setLinkData(p => ({ ...p, isButton: false }))}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!linkData.isButton ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                                >Text Link</button>
                                <button
                                    onClick={() => setLinkData(p => ({ ...p, isButton: true }))}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${linkData.isButton ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                                >Visual Button</button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Text content</label>
                                <input
                                    value={linkData.text}
                                    onChange={e => setLinkData(p => ({ ...p, text: e.target.value }))}
                                    className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm font-bold italic outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Get Started Now"
                                />
                                {linkData.text && linkData.isButton === false && (
                                    <p className="text-[9px] text-slate-400 ml-1">If you highlighted text before clicking, it was filled here automatically.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target URL</label>
                                <input
                                    value={linkData.url}
                                    onChange={e => setLinkData(p => ({ ...p, url: e.target.value }))}
                                    className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <button
                            onClick={finalizeLink}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Insert {linkData.isButton ? 'Button' : 'Link'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
