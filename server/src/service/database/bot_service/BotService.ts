import { DatabaseService } from '../InitTypeOrm';
import { Bots } from '../entity/Bots';

type botParams = {
    id?: number;
    user_id: string;
    name: string;
    deposit: number;
    bot_type: string;
};

export const createBot = async (botSettings: botParams) => {
    await DatabaseService.manager.insert(Bots, {
        user_id: botSettings.user_id,
        name: botSettings.name,
        deposit: botSettings.deposit,
        bot_type: botSettings.bot_type,
    });
};
