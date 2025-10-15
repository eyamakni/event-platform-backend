import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"
import { AuthService } from "./auth/auth.service"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for Angular frontend
  app.enableCors({
    origin: "http://localhost:4200",
    credentials: true,
  })

  // Enable validation pipes globally
  const authService = app.get(AuthService)
  await authService.createDefaultAdmin()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(3000)
  console.log("Event Management API is running on: http://localhost:3000")
}

bootstrap()
