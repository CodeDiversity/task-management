import { Injectable } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { TaskRepository } from './tasks.repository';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(private taskEntityRepository: TaskRepository) {}

  getTasks(filterDto: GetTasksFilterDTO, user: User): Promise<Task[]> {
    return this.taskEntityRepository.findAllByUser(filterDto, user);
  }

  async getTaskById(id: string): Promise<Task> {
    return this.taskEntityRepository.findById(id);
  }

  createTask(createTaskDto: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskEntityRepository.insert(createTaskDto, user);
  }

  async deleteTask(id: string): Promise<void> {
    return this.taskEntityRepository.deleteById(id);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.taskEntityRepository.updateTaskStatus(id, status);
  }
}
