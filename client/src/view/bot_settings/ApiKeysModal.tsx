import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { UserKeys } from '../../api/Types';
import './ApiKeysModal.css';

Modal.setAppElement('#root');

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
            <h2>Настройки API ключей</h2>
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
                    <small>Оставьте поле пустым, чтобы не изменять его.</small>
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