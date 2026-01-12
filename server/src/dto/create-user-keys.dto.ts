import { IsString } from 'class-validator';

export class CreateUserKeysDto {
    @IsString()
    apiKey: string;

    @IsString()
    apiSecret: string;
}
