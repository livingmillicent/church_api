import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributionsService } from './contributions.service';
import { Contribution } from './entities/contribution.entity';
import { NotFoundException } from '@nestjs/common';
import { ContributionType } from '../../common/enums';

describe('ContributionsService', () => {
  let service: ContributionsService;
  let repository: Repository<Contribution>;

  const mockContributionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionsService,
        {
          provide: getRepositoryToken(Contribution),
          useValue: mockContributionRepository,
        },
      ],
    }).compile();

    service = module.get<ContributionsService>(ContributionsService);
    repository = module.get<Repository<Contribution>>(getRepositoryToken(Contribution));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contribution', async () => {
      const createDto = {
        memberId: '123',
        contributionType: ContributionType.TITHES,
        amount: 500,
        paymentMethod: 'CASH' as any,
        date: new Date(),
      };

      const mockContribution = { id: '456', ...createDto };

      mockContributionRepository.create.mockReturnValue(mockContribution);
      mockContributionRepository.save.mockResolvedValue(mockContribution);

      const result = await service.create(createDto, '789');

      expect(result).toEqual(mockContribution);
      expect(mockContributionRepository.create).toHaveBeenCalled();
      expect(mockContributionRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a contribution', async () => {
      const mockContribution = { id: '123', amount: 500 };
      mockContributionRepository.findOne.mockResolvedValue(mockContribution);

      const result = await service.findOne('123');

      expect(result).toEqual(mockContribution);
    });

    it('should throw NotFoundException if not found', async () => {
      mockContributionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
