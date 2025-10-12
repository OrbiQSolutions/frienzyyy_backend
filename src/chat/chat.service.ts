import { Injectable } from '@nestjs/common';
import { UpdateChatDto } from './dto/update-chat.dto';
import { MessageDto } from './dto/message.dto';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class ChatService {
  constructor(private readonly jwtService: JwtService) { }

  sendMessage(messageDto: MessageDto, socket: Socket,) {
    const { toUserId } = JSON.parse(String(messageDto));
    console.log("message dto: ", messageDto);
    console.log("message dto: ", toUserId);
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