import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    onModuleInit() {
        const serviceAccount =
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require('../../firebase-adminsdk.json') as ServiceAccount;

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    getAuth() {
        return admin.auth();
    }

    getFirestore() {
        return admin.firestore();
    }
}
