import * as React from 'react';

export function Tooltip({ children }) {
    return <div
        className="tooltip-main"
    >
        <div
            className="tooltip-hint"
        >
            {React.Children.toArray(children)[1]}
        </div>
        <div
            className="tooltip-content"
        >
            {React.Children.toArray(children)[0]}
        </div >
    </div>;
}
