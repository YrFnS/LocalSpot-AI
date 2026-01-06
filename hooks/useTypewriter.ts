
import { useState, useEffect } from 'react';

export const useTypewriter = (texts: string[], typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!texts.length) return;

        const handleType = () => {
            const currentFullText = texts[index % texts.length];

            if (isDeleting) {
                setDisplayedText(currentFullText.substring(0, displayedText.length - 1));
            } else {
                setDisplayedText(currentFullText.substring(0, displayedText.length + 1));
            }

            if (!isDeleting && displayedText === currentFullText) {
                setTimeout(() => setIsDeleting(true), pauseTime);
            } else if (isDeleting && displayedText === "") {
                setIsDeleting(false);
                setIndex((prev) => prev + 1);
            }
        };

        const timer = setTimeout(handleType, isDeleting ? deletingSpeed : typingSpeed);
        return () => clearTimeout(timer);
    }, [texts, displayedText, isDeleting, index, typingSpeed, deletingSpeed, pauseTime]);

    return { displayedText, isDeleting };
};
