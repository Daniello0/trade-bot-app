import { IsString } from 'class-validator';

// SMELL: Bloaters – Primitive Obsession
export class CreateGridSettingsDto {
    @IsString()
    lowerBoundDynamic: string;

    @IsString()
    upperBoundDynamic: string;
}
