import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { join } from 'path';
import * as hbs from 'hbs';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser()); // 👈 ici

  // Configurer le moteur de template Handlebars
  app.setViewEngine('hbs');

  // Définir le dossier où les templates sont stockés
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // 👇 Configuration des fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 👉 Dossier des partials
  hbs.registerPartials(join(__dirname, '..', 'views', 'includes'));

  hbs.registerHelper('eq', (a, b) => a === b);

  hbs.registerHelper('formatTime', function (date) {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  // 👉 Ici tu ajoutes ton helper
  hbs.registerHelper('hasMessages', function (messages) {
    return messages && Object.keys(messages).length > 0;
  });

  hbs.registerHelper('uppercaseFirstLetter', function (str: string) {
    if (!str || str.length === 0) return '';
    return str.charAt(0).toUpperCase();
  });

  hbs.registerHelper('and', function (a, b) {
    return a && b;
  });

  hbs.registerHelper('or', function (a, b) {
    return a || b;
  });

  hbs.registerHelper('lt', (a: number, b: number) => a < b);

  hbs.registerHelper('gt', (a: number, b: number) => a > b);

  hbs.registerHelper('subtract', (a: number, b: number) => a - b);

  hbs.registerHelper('concat', (...args) => args.slice(0, -1).join(''));
  hbs.registerHelper('set', function (varName, varValue, options) {
    if (!this._locals) this._locals = {};
    this._locals[varName] = varValue; 
  });

  hbs.registerHelper('startsWith', (str, prefix) => {
    if (typeof str !== 'string' || typeof prefix !== 'string') return false;
    return str.startsWith(prefix);
  });

  hbs.registerHelper('inline-if', (condition, valueTrue, valueFalse) => {
    return condition ? valueTrue : valueFalse;
  });
  // console.log(jwt.sign({ email: 'eliefenohasina', password : '1234@azer' }));


  await app.listen(3000, '0.0.0.0');
}
bootstrap();
