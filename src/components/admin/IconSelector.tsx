'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Building2,
    MapPin,
    Ruler,
    Zap,
    Users,
    Calendar,
    Clock,
    DollarSign,
    Package,
    Truck,
    Factory,
    Hammer,
    Wrench,
    Settings,
    Target,
    Award,
    Star,
    Heart,
    Shield,
    CheckCircle,
    Flag,
    Globe,
    Home,
    Layers,
    Box,
    Cpu,
    Database,
    Server,
    Sun,
    Battery,
    Wind,
    Droplet,
    Flame,
    ChevronDown,
    X
} from 'lucide-react';

// Available icons mapping
export const AVAILABLE_ICONS = {
    'Building2': Building2,
    'MapPin': MapPin,
    'Ruler': Ruler,
    'Zap': Zap,
    'Users': Users,
    'Calendar': Calendar,
    'Clock': Clock,
    'DollarSign': DollarSign,
    'Package': Package,
    'Truck': Truck,
    'Factory': Factory,
    'Hammer': Hammer,
    'Wrench': Wrench,
    'Settings': Settings,
    'Target': Target,
    'Award': Award,
    'Star': Star,
    'Heart': Heart,
    'Shield': Shield,
    'CheckCircle': CheckCircle,
    'Flag': Flag,
    'Globe': Globe,
    'Home': Home,
    'Layers': Layers,
    'Box': Box,
    'Cpu': Cpu,
    'Database': Database,
    'Server': Server,
    'Sun': Sun,
    'Battery': Battery,
    'Wind': Wind,
    'Droplet': Droplet,
    'Flame': Flame,
} as const;

export type IconName = keyof typeof AVAILABLE_ICONS;

interface IconSelectorProps {
    value: IconName;
    onChange: (icon: IconName) => void;
    label?: string;
}

export function getIconComponent(iconName: string) {
    return AVAILABLE_ICONS[iconName as IconName] || Building2;
}

export default function IconSelector({ value, onChange, label }: IconSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const SelectedIcon = AVAILABLE_ICONS[value] || Building2;

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition bg-white w-full"
            >
                <SelectedIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 flex-1 text-left">{value}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                    <div className="grid grid-cols-5 gap-1">
                        {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    onChange(name as IconName);
                                    setIsOpen(false);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                    value === name
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'hover:bg-gray-100 text-gray-600'
                                }`}
                                title={name}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

