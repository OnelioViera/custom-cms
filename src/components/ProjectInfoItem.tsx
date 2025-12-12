'use client';

import { getIconComponent } from '@/components/admin/IconSelector';

interface ProjectInfoItemProps {
    value: string;
    label: string;
    iconName: string;
}

export default function ProjectInfoItem({ value, label, iconName }: ProjectInfoItemProps) {
    const Icon = getIconComponent(iconName);
    
    return (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

