import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateGridSettingsDto {
    @IsString()
    type: string;

    @IsNumber()
    @IsOptional()
    lowerBoundStatic?: number;

    @IsNumber()
    @IsOptional()
    upperBoundStatic?: number;

    @IsString()
    @IsOptional()
    lowerBoundDynamic?: string;

    @IsString()
    @IsOptional()
    upperBoundDynamic?: string;
}
