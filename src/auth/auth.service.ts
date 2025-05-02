// src/auth/auth.service.ts

import {Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity'; // adapte le chemin si nécessaire
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(userData: any, photoFilename?: string) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await this.usersService.create({
            ...userData,
            password: hashedPassword,
            photo: photoFilename ?? null,
        });
        return this.login(user); // facultatif, si tu veux renvoyer un token après inscription
    }

    async login(user: any) {
        const payload = { email: user.email, id: user.id };

         // Test de récupération de la clé du JWT
        const secret = process.env.JWT_SECRET || 'aFg7!wqH#91NbM2z$5t8!ZsA1pX#GkUjzYv9*';  // Log la clé ici pour tester
        
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // throw new Error('Utilisateur introuvable');
            throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
        }
        if (await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersService.findByEmail(email);
    }

}
