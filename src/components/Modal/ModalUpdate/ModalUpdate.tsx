import { useEffect, useState } from "react";
import "./ModalUpdate.scss";

export const UPDATES = [
    {
        version: "1.0",
        changes: ["🔹 Базовий функціонал"]
    },
    {
        version: "1.1",
        changes: [
            "🔹 Додано можливість зміни даних лінійки товарів (ціна)",
            "🔹 Добавлено кнопку 'Продаж дроп'",
            "🔹 Добавлено можливість переглянути версію"
        ]
    },
    {
        version: "1.2",
        changes: [
            "🔹 Виправлено помилку із закриттям модалки при редагуванні товару",
            "🔹 Виправлено помилку зі зміною порядку товарів при їх продажі",
            "🔹 Добавлено можливість продажу через пошук",
            "🔹 Змінено вигляд аналітики (можна дізнатись деталі продажу, натиснувши на неї)"
        ]
    }
]

const ModalUpdate = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [latestUpdate, setLatestUpdate] = useState<{ version: string; changes: string[] } | null>(null);

    useEffect(() => {
        const seenUpdates = JSON.parse(localStorage.getItem("seen_updates") || "[]");
        const newUpdate = UPDATES.find((update) => !seenUpdates.includes(update.version));

        if (newUpdate) {
            setLatestUpdate(newUpdate);
            setIsOpen(true);
            localStorage.setItem("seen_updates", JSON.stringify([...seenUpdates, newUpdate.version]));
        }
    }, []);

    return isOpen && latestUpdate ? (
        <div className="modal-update__overlay">
            <div className="modal-update__modal">
                <h2>🚀 Оновлення {latestUpdate.version}!</h2>
                <div className="updates">
                    {latestUpdate.changes.map((change, index) => (
                        <p key={index}>{change}</p>
                    ))}
                </div>
                <button onClick={() => setIsOpen(false)} className="modal-update__button">
                    Окей, зрозуміло!
                </button>
            </div>
        </div>
    ) : null;
};

export default ModalUpdate;
