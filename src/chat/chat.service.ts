import { Injectable } from '@nestjs/common';
import { UpdateChatDto } from './dto/update-chat.dto';
import { MessageDto } from './dto/message.dto';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { InjectModel } from '@nestjs/sequelize';
import { ChatMessages } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly jwtService: JwtService,

    @InjectModel(ChatMessages)
    private readonly chatMessagesModel: typeof ChatMessages,
  ) { }

  async sendMessage(messageDto: MessageDto, socket: Socket,) {
    const { toUserId, fromUserId, message } = messageDto;
    const savedChat = await this.chatMessagesModel.create({
      fromUser: fromUserId,
      toUser: toUserId,
      textMessage: message
    });
    socket.to(toUserId).emit("recieveMessage", messageDto);
    return;
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }

  async getParsedToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET
        }
      );
      console.log(payload);
      return payload;
    } catch (err) {
      return { userId: undefined };
    }
  }
}