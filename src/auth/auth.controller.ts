import { Controller, Post, Body, Request, UseGuards, Get, Res, Render,   UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    //   @Post('register')
    //   register(@Body() body: any) {
    //     return this.authService.register(body);
    //   }

    //   @UseGuards(LocalAuthGuard)
    //   @Post('login')
    //   login(@Request() req) {
    //     return this.authService.login(req.user);
    //   }

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Post('login')
    async login(@Body() body, @Res() res: Response) {
        try {
            const user = await this.authService.validateUser(body.email, body.password);

            if (!user) {
                return res.render('login', { error: 'Mot de passe incorrecte !' });
            }

            const token = await this.authService.login(user);

            // Stocke le token en cookie, session ou autre
            res.cookie('access_token', token.access_token, { httpOnly: true });

            return res.redirect('/');

        } catch (error) {
            console.error(error);
            return res.render('login', { error: error.response });
        }
    }


    @Get('login')
    @Render('login') // Rend views/login.hbs
    getLogin() {
        return { title: 'Connexion à Talkio' };
    }

    @Get('register')
    @Render('register') // Rend views/register.hbs
    getRegister() {
        return { title: 'Inscription à Talkio' };
    }

    @Get('reset-password')
    @Render('reset-password') // Rend views/register.hbs
    resetPassword() {
        return { title: 'Réinitialisation du mot de passe' };
    }

    @Post('register')
    @UseInterceptors(
        FileInterceptor('photo', {
        storage: diskStorage({
            destination: './uploads/photos',
            filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `photo-${uniqueSuffix}${ext}`);
            },
        }),
        }),
    )

    @Post('register')
    async register(@UploadedFile() file: Express.Multer.File, @Body() body, @Res() res: Response) {
        const created = await this.authService.register(body, file?.filename);
        if (!created) {
            return res.render('register', { error: 'Email déjà utilisé' });
        }
        return res.redirect('/auth/login');
    }

    @Get('logout')
    logout(@Res() res: Response) {
        // Supprime le cookie si token stocké en cookie
        res.clearCookie('access_token');

        // Redirection vers login
        return res.redirect('/auth/login');
    }

}
