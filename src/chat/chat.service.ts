import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { MessageDto } from './dto/message.dto';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  sendMessage(messageDto: MessageDto, socket: Socket,) {
    // const { message } = messageDto;
    // console.log(message);
    socket.emit("recieveMessage", 'i got the message');
    return 'This action adds a new chat';
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
}