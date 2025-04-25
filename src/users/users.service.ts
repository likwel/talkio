import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(data: Partial<User>): Promise<User> {

        if (!data.photo && !data.avatarColor && data.username) {
            data.avatarColor = await this.generateColorFromUsername(data.username);
        }

        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            // throw new Error('Utilisateur introuvable');  // Gère le cas où l'utilisateur n'est pas trouvé
            throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
            // throw new Error('Utilisateur introuvable');  // Gère le cas où l'utilisateur n'est pas trouvé
        }
        return user;
    }

    async generateColorFromUsername(username: string) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += value.toString(16).padStart(2, '0');
        }

        return color;
    }
}