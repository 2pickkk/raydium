document.addEventListener('DOMContentLoaded', () => {

    const triggerConfig = {
        'priority-button': '#priority-modal-wrapper',
        'rewards-button': '#rewards-drawer-wrapper',
        'connect-wallet-button': '#connect-wallet-modal-wrapper',
        'connect-wallet-button-2': '#connect-wallet-modal-wrapper',
        'settings-button': '#settings-modal-wrapper',
        'more-button': '#more-menu-wrapper',
    };

    const modalContainer = document.getElementById('modal-container');
    let activeWrapperId = null;
    let modalTemplates = null;

    // Предзагружаем HTML всех модальных окон
    const preloadModals = async () => {
        try {
            const response = await fetch('modals.html');
            if (!response.ok) throw new Error('Failed to load modals.html');
            const text = await response.text();
            const parser = new DOMParser();
            modalTemplates = parser.parseFromString(text, 'text/html');
        } catch (error) {
            console.error(error);
        }
    };
    preloadModals();

    const closeActiveModal = () => {
        const activeElement = modalContainer.firstElementChild;
        if (!activeElement) return;

        activeElement.classList.remove('is-open');

        activeElement.addEventListener('transitionend', () => {
            modalContainer.innerHTML = '';
        }, { once: true });

        setTimeout(() => {
            if(modalContainer.contains(activeElement)) {
                 modalContainer.innerHTML = '';
            }
        }, 500); // Fallback
        
        activeWrapperId = null;
        document.body.removeEventListener('click', handleOutsideClick, true);
    };

    const openModal = (wrapperId, triggerButton) => {
        if (!modalTemplates) {
            console.error("Modals not preloaded yet.");
            return;
        }

        if (activeWrapperId === wrapperId) {
            closeActiveModal();
            return;
        }
        
        if (activeWrapperId) {
            closeActiveModal();
        }

        const modalNode = modalTemplates.querySelector(wrapperId);
        if (!modalNode) return;
        
        modalContainer.innerHTML = modalNode.outerHTML;
        const newModal = modalContainer.firstElementChild;
        activeWrapperId = wrapperId;

        // Позиционирование меню "More"
        if (wrapperId === '#more-menu-wrapper') {
            const menu = newModal.querySelector('.css-1lum4hy');
            const rect = triggerButton.getBoundingClientRect();
            menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
            const menuWidth = menu.offsetWidth;
            const triggerLeft = rect.left + window.scrollX;
            menu.style.left = `${triggerLeft - menuWidth + rect.width}px`;
        }

        // Запуск анимации
        setTimeout(() => {
            newModal.classList.add('is-open');
        }, 10);

        // Навешиваем обработчики закрытия
        newModal.querySelector('.chakra-modal__overlay')?.addEventListener('click', closeActiveModal);
        newModal.querySelectorAll('.chakra-modal__close-btn').forEach(btn => btn.addEventListener('click', closeActiveModal));
        newModal.querySelector('.css-7po3es')?.addEventListener('click', closeActiveModal); // Кнопка "Save"
        
        setTimeout(() => {
            document.body.addEventListener('click', handleOutsideClick, true);
        }, 0);
    };

    const handleOutsideClick = (e) => {
        if (activeWrapperId && !modalContainer.firstElementChild.contains(e.target)) {
            const triggerId = Object.keys(triggerConfig).find(key => triggerConfig[key] === activeWrapperId);
            const triggerButton = document.getElementById(triggerId);
            if(e.target !== triggerButton && !triggerButton.contains(e.target)) {
                closeActiveModal();
            }
        }
    };
    
    // Назначаем события на все кнопки
    for (const [buttonId, wrapperSelector] of Object.entries(triggerConfig)) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(wrapperSelector, button);
            });
        }
    }
});