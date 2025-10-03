import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#0A84FF" />
            <path d="M30 45 L50 60 L70 45" stroke="white" strokeWidth="6" fill="none" />
            <path d="M50 60 V35" stroke="white" strokeWidth="6" strokeLinecap="round" />
        </svg>
    );
}
