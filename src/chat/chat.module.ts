import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatMessages } from './entities/chat.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([ChatMessages])
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule { }
