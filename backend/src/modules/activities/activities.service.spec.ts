import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { ActivityTypeDto } from './dtos/activity.dto';
import { PrismaService } from '../../prisma/prisma.service';

describe('ActivitiesService Unit Tests', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: PrismaService,
          useValue: {
            activity: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
  });

  it('should calculate accurate MET calories for running', () => {
    // Running (MET 9.8) for 30 minutes (1800s) by 70kg user: 9.8 * 70 * 0.5 = 343 kcal
    const calories = service.calculateCalories(ActivityTypeDto.RUNNING, 1800, 70);
    expect(calories).toBe(343);
  });

  it('should calculate accurate Haversine distance between two coordinates', () => {
    // Distance between San Francisco Ferry Building and Union Square (~2.1 km)
    const lat1 = 37.7955;
    const lon1 = -122.3937;
    const lat2 = 37.7879;
    const lon2 = -122.4074;

    const distance = service.calculateHaversineDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(1300);
    expect(distance).toBeLessThan(1600);
  });
});
