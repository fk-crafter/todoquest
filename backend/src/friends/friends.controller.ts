import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  getFriends(@Req() req: RequestWithUser) {
    return this.friendsService.getFriendsList(req.user.id);
  }

  @Get('requests')
  getPendingRequests(@Req() req: RequestWithUser) {
    return this.friendsService.getPendingRequests(req.user.id);
  }

  @Post('request')
  sendRequest(@Req() req: RequestWithUser, @Body('targetId') targetId: string) {
    return this.friendsService.sendFriendRequest(req.user.id, targetId);
  }

  @Post('accept/:id')
  acceptRequest(
    @Req() req: RequestWithUser,
    @Param('id') friendshipId: string,
  ) {
    return this.friendsService.acceptFriendRequest(req.user.id, friendshipId);
  }

  @Delete('remove/:id')
  removeFriend(@Req() req: RequestWithUser, @Param('id') friendshipId: string) {
    return this.friendsService.removeFriend(req.user.id, friendshipId);
  }
}
