import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserKeys, ReadBotSummary } from '../api/Types';
import { getUserKeys, createUserKeys } from '../service/UserKeysService';
import { toggleBot } from '../service/BotService';
import { ApiKeysModal } from '../view/main/ApiKeysModal';

interface BotActionsContextType {
    handleToggleBot: (botId: number, onSuccess?: (bots: ReadBotSummary[]) => void) => Promise<boolean>;
    openKeysModal: () => void;
    isToggling: boolean;
}

const BotActionsContext = createContext<BotActionsContextType | undefined>(undefined);

export const BotActionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isKeysModalOpen, setKeysModalOpen] = useState(false);
    const [existingKeys, setExistingKeys] = useState<UserKeys | undefined>();
    const [isToggling, setIsToggling] = useState(false);

    const updateKeys = async (): Promise<UserKeys | undefined> => {
        try {
            const keys: UserKeys | undefined = await getUserKeys();
            setExistingKeys(keys);
            return keys;
        } catch (error) {
            console.error('Не удалось загрузить ключи:', error);
            return undefined;
        }
    }

    const handleSaveKeys = async (keys: UserKeys) => {
        try {
            await createUserKeys(keys);
            setKeysModalOpen(false);
        } catch (error) {
            alert('Ошибка! Не удалось сохранить ключи');
        }
    };

    const handleToggleBot = async (
        botId: number,
    ): Promise<boolean> => {
        setIsToggling(true);
        try {
            const keys: UserKeys | undefined = await updateKeys();

            if (!keys || !keys.apiKey || !keys.apiSecret) {
                if (window.confirm('Необходимо ввести API-ключи. Желаете продолжить?')) {
                    setKeysModalOpen(true);
                }
                return false;
            }

            await toggleBot(botId);
            return true;
        } catch (error) {
            console.error(error);
            alert('Ошибка при переключении бота');
            return false;
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <BotActionsContext.Provider value={{
            handleToggleBot,
            openKeysModal: async () => {
                await updateKeys();
                setKeysModalOpen(true);
            },
            isToggling
        }}>
            {children}
            <ApiKeysModal
                isOpen={isKeysModalOpen}
                onClose={() => setKeysModalOpen(false)}
                onSave={handleSaveKeys}
                initialData={existingKeys}
            />
        </BotActionsContext.Provider>
    );
};

export const useBotActions = () => {
    const context = useContext(BotActionsContext);
    if (!context) throw new Error('useBotActions must be used within BotActionsProvider');
    return context;
};