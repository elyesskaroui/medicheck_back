import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyOtpDto {

  @IsEmail()
  email : string

  @ApiProperty({
    description : 'the recovery code',
    example : '123645'
  })
  @IsString()
  recoveryCode: string;

  
}
