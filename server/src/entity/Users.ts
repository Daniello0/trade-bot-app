import 'reflect-metadata';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Bots } from './Bots';

@Entity('users')
export class Users {
    @PrimaryColumn('uuid', { nullable: false })
    id: string;

    @Column('timestamp without time zone', {
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        name: 'createdAt',
    })
    createdAt: Date;

    @Column('text', {
        nullable: false,
        name: 'apiKey',
        default: '',
    })
    apiKey: string;

    @Column('text', {
        nullable: false,
        name: 'apiSecret',
        default: '',
    })
    apiSecret: string;

    @OneToMany(() => Bots, (bot: Bots) => bot.user)
    bots: Bots[];
}
