import { Body, Controller, Get } from '@nestjs/common';
import { LoginDTO } from '../dtos/login.dto';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }
}
