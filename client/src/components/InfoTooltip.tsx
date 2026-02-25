import React from 'react';

interface InfoTooltipProps {
    text: string;
    children: React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, children }) => {
    return (
        <span className="text-need-help">
            {children}
            <span className="text-tooltip">{text}</span>
        </span>
    );
};