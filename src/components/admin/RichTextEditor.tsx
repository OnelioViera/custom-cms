'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Link as LinkIcon,
    Unlink,
    Heading1,
    Heading2,
    Undo,
    Redo,
    Quote
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export default function RichTextEditor({ 
    value, 
    onChange, 
    placeholder = 'Start typing...',
    minHeight = '120px'
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-yellow-600 underline hover:text-yellow-700',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        immediatelyRender: false, // Prevents SSR hydration mismatch
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[inherit] text-gray-900',
            },
        },
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return (
            <div 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                style={{ minHeight }}
            >
                <div className="animate-pulse h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        );
    }

    const ToolbarButton = ({ 
        onClick, 
        isActive = false, 
        disabled = false,
        children,
        title
    }: { 
        onClick: () => void; 
        isActive?: boolean; 
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded transition-colors ${
                isActive 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-600 focus-within:border-transparent">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    title="Add Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>

                {editor.isActive('link') && (
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="Remove Link"
                    >
                        <Unlink className="w-4 h-4" />
                    </ToolbarButton>
                )}

                <div className="flex-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <div 
                className="px-3 py-2 bg-white"
                style={{ minHeight }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

