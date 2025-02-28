import React from "react";
import "./ProductEditModal.scss";

interface ProductEditModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({ title, onClose, children }) => {
    let mouseDownInside = false;

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest(".product-edit")) {
            mouseDownInside = true;
        } else {
            mouseDownInside = false;
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!mouseDownInside && !(e.target as HTMLElement).closest(".product-edit")) {
            onClose();
        }
    };

    return (
        <div className="product-edit-container" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
            <div className="product-edit" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <img src="images/close.png" alt="Close" className="product-edit-close" onClick={onClose} />
                {children}
            </div>
        </div>
    );
};
