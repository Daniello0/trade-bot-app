import 'reflect-metadata';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Bots } from './Bots';

@Entity('users')
export class Users {
    @PrimaryColumn('text', {
        nullable: false,
    })
    id: string;

    @Column('timestamp without time zone', {
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @OneToMany(() => Bots, (bot: Bots) => bot.user)
    bots: Bots[];
}
