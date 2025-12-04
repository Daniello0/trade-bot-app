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
    })
    created_at: Date;

    @OneToMany(() => Bots, (bot: Bots) => bot.user_id)
    bots: Bots[];
}
