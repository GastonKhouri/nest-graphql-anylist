<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Dev

1. Clonar el repositorio

2. Copiar el archivo ```.env.template```, renombrar a ```.env``` y configurar las variables de entorno

3. Ejecutar 
```
yarn install
```

4. Levantar la imagen de postgres (Docker Desktop) 
```
docker-compose up -d
```

5. Levantar la aplicación
```
yarn start:dev
```

6. Ejecutar la __mutation__ ```executeSeed``` para poblar la base de datos

# Docker

## Build
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build

## Run
docker-compose -f docker-compose.prod.yml --env-file .env.prod up

## Nota
Por defecto, __docker-compose__ usa el archivo ```.env```, por lo que si tienen el archivo .env y lo configuran con sus variables de entorno de producción, bastaría con
```
docker-compose -f docker-compose.prod.yml up --build
```