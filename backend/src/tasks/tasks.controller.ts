import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.tasksService.findAll(req.user.id);
  }

  @Put(':id/complete')
  complete(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body('timeSpent') timeSpent?: number,
  ) {
    return this.tasksService.completeTask(req.user.id, id, timeSpent);
  }

  @Delete(':id')
  delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.tasksService.delete(req.user.id, id);
  }

  @Patch(':id')
  async updateTask(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() body: { title?: string; description?: string; difficulty?: string },
  ) {
    return this.tasksService.update(id, req.user.id, body);
  }
}
