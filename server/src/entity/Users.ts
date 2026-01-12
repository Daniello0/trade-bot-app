import 'reflect-metadata';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Bots } from './Bots';

@Entity('users')
export class Users {
    // todo: replace to uuid
    @PrimaryColumn('text', { nullable: false })
    id: string;

    @Column('timestamp without time zone', {
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    @Column('text', {
        nullable: true,
        name: 'api_key',
    })
    apiKey: string;

    @Column('text', {
        nullable: true,
        name: 'api_secret',
    })
    apiSecret: string;

    @OneToMany(() => Bots, (bot: Bots) => bot.user)
    bots: Bots[];
}
