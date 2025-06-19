import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'Phone must be exactly 11 digits' })
  phone: string;
}
