import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateGridSettingsDto {
    @IsString()
    type: string;

    @IsNumber()
    @IsOptional()
    lower_bound_static?: number;

    @IsNumber()
    @IsOptional()
    upper_bound_static?: number;

    @IsString()
    @IsOptional()
    lower_bound_dynamic?: string;

    @IsString()
    @IsOptional()
    upper_bound_dynamic?: string;
}
