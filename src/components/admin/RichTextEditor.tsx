'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
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
    Quote,
    Palette,
    X
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

// Predefined color palette
const COLOR_PALETTE = [
    { name: 'Default', value: '' },
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#374151' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Yellow', value: '#ca8a04' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Pink', value: '#db2777' },
];

export default function RichTextEditor({ 
    value, 
    onChange, 
    placeholder = 'Start typing...',
    minHeight = '120px'
}: RichTextEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

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
            TextStyle,
            Color,
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

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const setColor = useCallback((color: string) => {
        if (!editor) return;
        
        if (color === '') {
            editor.chain().focus().unsetColor().run();
        } else {
            editor.chain().focus().setColor(color).run();
        }
        setShowColorPicker(false);
    }, [editor]);

    const getCurrentColor = () => {
        if (!editor) return '';
        return editor.getAttributes('textStyle').color || '';
    };

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

                {/* Color Picker */}
                <div className="relative" ref={colorPickerRef}>
                    <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Text Color"
                        className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                            showColorPicker || getCurrentColor()
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <Palette className="w-4 h-4" />
                        <div 
                            className="w-3 h-3 rounded-sm border border-gray-300"
                            style={{ backgroundColor: getCurrentColor() || '#374151' }}
                        />
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                <span className="text-xs font-medium text-gray-700">Text Color</span>
                                <button
                                    type="button"
                                    onClick={() => setShowColorPicker(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                                {COLOR_PALETTE.map((color) => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setColor(color.value)}
                                        title={color.name}
                                        className={`w-7 h-7 rounded border-2 transition-all hover:scale-110 ${
                                            getCurrentColor() === color.value 
                                                ? 'border-yellow-500 ring-2 ring-yellow-200' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        style={{ 
                                            backgroundColor: color.value || '#ffffff',
                                            backgroundImage: color.value === '' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                            backgroundSize: '8px 8px',
                                            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                                        }}
                                    />
                                ))}
                            </div>
                            {/* Custom color input */}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <label className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Custom:</span>
                                    <input
                                        type="color"
                                        value={getCurrentColor() || '#000000'}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

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
