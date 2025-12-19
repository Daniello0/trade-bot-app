import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { StopLossSettings } from './StopLossSettings';
import { Bots } from './Bots';

@Entity('full_spot_settings')
export class FullSpotSettings {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column('text', {
        nullable: false,
    })
    ignore_list: string;

    @Column('integer', {
        nullable: false,
    })
    max_active_cryptos: number;

    @Column('numeric', {
        nullable: false,
    })
    price_per_bet: number;

    @Column('text', {
        nullable: false,
    })
    crypto_list_type: string;

    @Column('text', {
        nullable: true,
    })
    crypto_list_static: string;

    @Column('text', {
        nullable: false,
    })
    indicators: string;

    @Column('numeric', {
        nullable: false,
    })
    profit_per_crypto: number;

    @OneToOne(
        () => StopLossSettings,
        (settings) => settings.full_spot_settings,
        {
            cascade: true,
        }
    )
    stop_loss_settings: StopLossSettings;

    @OneToOne(() => Bots, (bot: Bots) => bot.full_spot_settings, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'bot_id' })
    bot: Bots;
}
