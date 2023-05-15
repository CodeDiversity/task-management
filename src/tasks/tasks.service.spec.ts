import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './tasks.repository';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: TaskRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useValue: {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            insert: jest.fn(),
            deleteById: jest.fn(),
            updateTaskStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('should return an array of tasks', async () => {
      const filterDto: GetTasksFilterDTO = {};
      const user: User = {
        id: 'fd0edd8a-be4b-46b3-8f8f-a888afbc887e',
        username: 'user1',
        password: 'Password123!',
        tasks: [],
      };

      const expectedResult: Task[] = [
        {
          id: 'fd0edd8a-be4b-46b3-8f8f-a888afbc887e',
          title: 'cook dinner',
          description: 'new task ',
          status: TaskStatus.OPEN,
          user: {
            id: 'user1',
            username: 'user1',
            password: 'Password123!',
            tasks: [],
          },
        },
      ];
      (taskRepository.findAllByUser as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await tasksService.getTasks(filterDto, user);

      expect(result).toEqual(expectedResult);
      expect(taskRepository.findAllByUser).toHaveBeenCalledWith(
        filterDto,
        user,
      );
    });
  });
});
