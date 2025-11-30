import { DatabaseService } from '../InitTypeOrm';
import { User } from '../entity/User';

export const createUser = async (userId: string) => {
    await DatabaseService.manager.save(User, {
        id: userId,
    });
};
