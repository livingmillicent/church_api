import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*.js'],
      synchronize: true,
      logging: !isProduction,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'church_management',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*.js'],
      synchronize: true,
      logging: !isProduction,
    };

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
