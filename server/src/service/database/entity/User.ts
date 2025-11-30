import 'reflect-metadata';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryColumn({
        nullable: false,
    })
    id: string;

    @Column('timestamp with time zone')
    created_at: Date;
}
