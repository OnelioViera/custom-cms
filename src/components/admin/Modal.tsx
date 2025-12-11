'use client';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    onSubmit?: () => void;
    submitLabel?: string;
    isLoading?: boolean;
}

export default function Modal({
    isOpen,
    title,
    children,
    onClose,
    onSubmit,
    submitLabel = 'Save',
    isLoading = false,
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">{children}</div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    {onSubmit && (
                        <button
                            onClick={onSubmit}
                            disabled={isLoading}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium"
                        >
                            {isLoading ? 'Saving...' : submitLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
