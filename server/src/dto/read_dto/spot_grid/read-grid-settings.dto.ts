export class ReadGridSettingsDto {
    id: number;
    type: string;
    lower_bound_static?: number;
    upper_bound_static?: number;
    lower_bound_dynamic?: string;
    upper_bound_dynamic?: string;
}
