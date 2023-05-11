import { IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class AuthCredentialsDTO {
  @IsString()
  @Min(4)
  @MaxLength(20)
  username: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;
}
