import { GridSettings } from '../entity/GridSettings';
import { EntityManager, Repository } from 'typeorm';
import { CreateGridSettingsDto } from '../dto/create-grid-settings.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GridSettingsService {
    constructor(
        @InjectRepository(GridSettings)
        private readonly gridRepository: Repository<GridSettings>
    ) {}

    async create(
        gridSettings: CreateGridSettingsDto,
        manager?: EntityManager
    ): Promise<GridSettings> {
        const repository: Repository<GridSettings> = manager
            ? manager.getRepository(GridSettings)
            : this.gridRepository;
        const newSettings = repository.create(gridSettings);
        return await repository.save(newSettings);
    }

    async update(
        gridSettingsId: number,
        updateData: CreateGridSettingsDto,
        manager?: EntityManager
    ): Promise<void> {
        const repository: Repository<GridSettings> = manager
            ? manager.getRepository(GridSettings)
            : this.gridRepository;
        await repository.update(gridSettingsId, updateData);
    }
}
