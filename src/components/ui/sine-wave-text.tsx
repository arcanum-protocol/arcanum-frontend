import { useEffect, useRef } from 'react';

type SineWaveTextProps = {
    text: string;
    color?: 'emerald' | 'crimson' | 'purple' | 'blue';
    asSpan?: boolean;
    href?: string;
    className?: string;
    rightIcon?: React.ReactNode;
}

function SineWaveText({ text, color, asSpan, href, className, rightIcon }: SineWaveTextProps) {
    const letterRefs = useRef<HTMLSpanElement[]>([]);

    useEffect(() => {
        const amplitude = 0.9;
        const frequency = 0.6;
        let time = 0;

        function animate() {
            time += 0.15;
            letterRefs.current.forEach((letter, index) => {
                if (!letter) {
                    return;
                }
                const y = amplitude * Math.sin(frequency * time + index);
                letter.style.transform = `translateY(${y}px)`;
            });
            requestAnimationFrame(animate);
        }

        function animateColor() {
            letterRefs.current.forEach((letter, index) => {
                if (!letter) {
                    return;
                }
                const y = amplitude * Math.sin(frequency * time + index);
                if (color === 'emerald') {
                    letter.style.color = `hsl(${y * 17.5 + 150}, 100%, 50%)`; // изумрудный
                } else if (color === 'crimson') {
                    letter.style.color = `hsl(${y * 17.5 + 350}, 100%, 50%)`; // алый
                } else if (color === 'purple') {
                    letter.style.color = `hsl(${y * 42.5 + 300}, 100%, 80%)`; // пурпурный
                } else {
                    letter.style.color = `hsl(${y * 17.5 + 200}, 100%, 70%)`; // default blue
                }
            });
            requestAnimationFrame(animateColor);
        }

        animate();
        animateColor();
    }, [color]);

    if (asSpan) {
        if (href) {
            <span onClick={() => window.open(href, '_blank')}>
                {
                    text.split('').map((letter, index) => (
                        <span className={"font-mono text-xs opacity-50 text-blue-500 min-w-[3px] " + className} ref={el => letterRefs.current[index] = el} key={index}>
                            {letter}
                        </span>
                    ))
                }
                {rightIcon}
            </span>
        }
        return (
            <>
                {text.split('').map((letter, index) => (
                    <span className={"font-mono text-xs opacity-50 text-blue-500 min-w-[3px] " + className} ref={el => letterRefs.current[index] = el} key={index}>
                        {letter}
                    </span>
                ))}
                {rightIcon}
            </>
        );
    }

    return (
        <div className="font-mono text-xs opacity-50 text-blue-500 flex">
            {href ? (
                <a href={href}>
                    {text.split('').map((letter, index) => (
                        <span className="min-w-[3px]" ref={el => letterRefs.current[index] = el} key={index}>
                            {letter}
                        </span>
                    ))}
                    {rightIcon}
                </a>
            ) : (
                <>
                    {text.split('').map((letter, index) => (
                        <span className="min-w-[3px]" ref={el => letterRefs.current[index] = el} key={index}>
                            {letter}
                        </span>
                    ))}
                    {rightIcon}
                </>
            )}
        </div>
    );
}

export { SineWaveText }
