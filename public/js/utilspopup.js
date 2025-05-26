export function createPopup({ title, inputs = [], buttons = [], onClose }) {
    // Создаем затемненный фон
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    // Создаем окно попапа
    const popup = document.createElement('div');
    popup.className = 'popup-content';

    // Заголовок
    const h2 = document.createElement('h2');
    h2.textContent = title;
    popup.appendChild(h2);

    // Создаем поля input
    inputs.forEach(({ label, type = 'text', id, value = '' }) => {
        const labelElem = document.createElement('label');
        labelElem.textContent = label;

        const inputElem = document.createElement('input');
        inputElem.type = type;
        inputElem.id = id;
        inputElem.value = value;

        popup.appendChild(labelElem);
        popup.appendChild(inputElem);
    });

    // Создаем кнопки
    buttons.forEach(({ text, className, onClick }) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        if (className) btn.className = className;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            onClick(e, { overlay, popup });
        });
        popup.appendChild(btn);
    });

    // Кнопка закрытия (крестик)
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-popup';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onClose) onClose();
    });
    popup.appendChild(closeBtn);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Обработка клика вне попапа — закрытие
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            if (onClose) onClose();
        }
    });

}