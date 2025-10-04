import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';
import { MessageDto } from './dto/message.dto';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(6000, { cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) { }

  handleConnection(client: any, ...args: any[]) {
    console.log(`The user has been connected with id: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`The user has been disconnected with id: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() messageDto: MessageDto) {
    return this.chatService.sendMessage(messageDto, socket);
  }

  @SubscribeMessage('recieveMessage')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }
}
