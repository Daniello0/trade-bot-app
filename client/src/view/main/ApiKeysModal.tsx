import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { UserKeys } from '../../api/Types';
import './ApiKeysModal.css';

interface ApiKeysModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (keys: UserKeys) => void;
    initialData?: UserKeys;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKey(initialData?.apiKey || '');
            setApiSecret('');
        }
    }, [isOpen, initialData]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSave({ apiKey, apiSecret });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Настройки API ключей"
            className="modal"
            overlayClassName="overlay"
        >
            <h2 className="modal-title-container">
                Настройки API ключей
                <div className="api-keys-help">
                    ?
                    <div className="api-keys-tooltip">
                        <strong>Инструкция:</strong>
                        <ul>
                            <li>Войдите или зарегистрируйтесь на сайте <a rel="noreferrer noopener" target="_blank" href='https://bybit.com'>bybit.com</a>.</li>
                            <li>Наведите курсор на иконку профиля, перейдите в раздел <a rel="noreferrer noopener" target="_blank" href="https://www.bybit.com/app/user/api-management">API</a>.</li>
                            <li>В правом верхнем углу нажмите "Создать новый ключ" – "API ключ, сгенерированный системой".</li>
                            <li>Настройте права чтения/записи.</li>
                            <li>Важно! Разрешите доступ к торговым операциям ("СПОТ" – "Торговать") и
                                информации об ордерах ("Контракт" – "Ордера").</li>
                            <li>После создания, вставьте ключи в текстовые поля ниже</li>
                        </ul>
                    </div>
                </div>
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="api-key">API Key</label>
                    <input
                        id="api-key"
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Введите ваш API Key"
                        autoComplete="off"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="api-secret">Secret Key</label>
                    <input
                        id="api-secret"
                        type="password"
                        className="input-mask-text"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder={initialData?.apiSecret ? '******** (уже сохранен)' : 'Введите ваш Secret Key'}
                        autoComplete="new-password"
                    />
                </div>
                <div className="modal-actions">
                    <button type="button" className="action-button secondary" onClick={onClose}>
                        Отмена
                    </button>
                    <button type="submit" className="action-button">
                        Сохранить
                    </button>
                </div>
            </form>
        </Modal>
    );
};