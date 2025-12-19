import { IsString } from 'class-validator';

export class CreateUserKeysDto {
    @IsString()
    api_key: string;

    @IsString()
    api_secret: string;
}
