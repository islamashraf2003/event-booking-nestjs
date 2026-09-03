import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    allUsers() {
        return "this is coming from user service";
    }
}
