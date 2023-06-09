import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { Repository } from 'typeorm';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@Injectable()
export class TaskRepository {
  private logger = new Logger('TaskRepository');
  constructor(
    @InjectRepository(Task)
    private readonly taskEntityRepository: Repository<Task>,
  ) {}

  async findById(id: string, user: User): Promise<Task> {
    const found = await this.taskEntityRepository.findOneBy({ id, user });
    if (!found) {
      this.logger.error(`Task with ID "${id}" not found`);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async insert(createTaskDto: CreateTaskDTO, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.taskEntityRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.taskEntityRepository.save(task);
    return task;
  }

  async findAllByUser(
    filterDto: GetTasksFilterDTO,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.taskEntityRepository.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}", DTO: ${JSON.stringify(
          filterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async deleteById(id: string, user: User): Promise<void> {
    const result = await this.taskEntityRepository.delete({ id, user });

    if (result.affected === 0) {
      this.logger.error(`Task with ID "${id}" not found`);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.findById(id, user);

    task.status = status;
    await this.taskEntityRepository.save(task);

    return task;
  }
}
