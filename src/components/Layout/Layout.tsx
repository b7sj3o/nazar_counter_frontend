import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import "./Layout.scss";
import { LayoutProps } from '../../types/layout';

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [showButton, setShowButton] = useState<boolean>(false);
    const [isButtonSwiped, setIsButtonSwiped] = useState<boolean>(false);
    const [isButtonTouched, setIsButtonTouched] = useState<boolean>(false);
    const [buttonPos, setButtonPos] = useState<number[]>([0, 0]);

    useEffect(() => {
        const handleScroll = () => {
            setShowButton(window.scrollY > 500);
        };

        const handleTouchStart = (e: TouchEvent) => {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            const button = document.querySelector('.move-to-top') as HTMLElement;
            if (button) {
                const rect = button.getBoundingClientRect();
                setButtonPos([rect.x, rect.y]);
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    setIsButtonTouched(true);
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const x = e.changedTouches[0].clientX;
            const y = e.changedTouches[0].clientY;

            // if button is swiped to the right
            if (isButtonTouched && x-buttonPos[0] > 30 && Math.abs(y-buttonPos[1]) < 60) {
                const button = document.querySelector('.move-to-top') as HTMLElement;
                button.style.animation = "moveRight 0.3s forwards";
                setIsButtonSwiped(true);
                setIsButtonTouched(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isButtonTouched, buttonPos]);

    const returnButton = () => {
        const button = document.querySelector('.move-to-top') as HTMLElement;
        button.style.animation = "moveLeft 0.3s forwards";
        setTimeout(() => {
            setIsButtonSwiped(false);
        }, 300);
    }

    const moveToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <div>
            <header>
                <Navbar />
            </header>
            <main>
                {children}
            </main>
            {showButton && (
                <button className='move-to-top' onClick={isButtonSwiped ? returnButton : moveToTop}>
                    <img src="images/arrow-white.png" alt="Scroll to top" />
                </button>
            )}
        </div>
    );
};

export default Layout;
