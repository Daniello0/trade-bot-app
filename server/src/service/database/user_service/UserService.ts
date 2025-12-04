import { DatabaseService } from '../InitTypeOrm';
import { Users } from '../entity/Users';

export const createUser = async (userId: string) => {
    await DatabaseService.manager.save(Users, {
        id: userId,
    });
};
