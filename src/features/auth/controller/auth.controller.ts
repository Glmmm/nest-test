import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { Public } from '../../../core/decorators/public.decorator';
import { LoginDTO } from '../dtos/login.dto';
import { RegisterDTO } from '../dtos/register.dto';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@CurrentUser('userId') userId: string) {
    return this.authService.getProfile(userId);
  }
}
