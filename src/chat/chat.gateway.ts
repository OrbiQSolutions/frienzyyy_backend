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
import { Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from './chat.guard';

@WebSocketGateway(6000, { cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) { }

  @UseGuards(WsGuard)
  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    this.logger.log(`HandleConnection called for client: ${JSON.stringify(client.handshake.headers[String(process.env.TOKEN_KEY)])}`);
    const { userId } = await this.chatService.getParsedToken(String(client.handshake.headers[String(process.env.TOKEN_KEY)]));

    if (userId) {
      client.join(userId.toString());
      console.log(`User connected with id: ${client.id}, joined room: ${userId}`);
    } else {
      console.log(`User connected with id: ${client.id}, but no userId found`);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      client.leave(userId.toString()); // Highlight: Leave room on disconnect
      console.log(`User disconnected with id: ${client.id}, left room: ${userId}`);
    } else {
      console.log(`User disconnected with id: ${client.id}`);
    }
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
