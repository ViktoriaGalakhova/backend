import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly endpoint: string;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.endpoint = config.get<string>(
      'S3_ENDPOINT',
      'https://storage.yandexcloud.net',
    );
    this.bucket = config.get<string>('S3_BUCKET', '');

    this.client = new S3Client({
      region: config.get<string>('S3_REGION', 'ru-central1'),
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: config.get<string>('S3_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get<string>('S3_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    if (!this.bucket) {
      throw new ServiceUnavailableException(
        'Объектное хранилище не настроено: задайте переменные окружения S3_*.',
      );
    }

    const key = `${folder}/${randomUUID()}${extname(file.originalname)}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.log(`Файл загружен: ${key}`);

    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async remove(fileUrl: string): Promise<void> {
    const key = this.extractKey(fileUrl);

    if (!key) {
      return;
    }

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    this.logger.log(`Файл удалён: ${key}`);
  }

  private extractKey(fileUrl: string): string | null {
    const prefix = `${this.endpoint}/${this.bucket}/`;

    return fileUrl.startsWith(prefix) ? fileUrl.slice(prefix.length) : null;
  }
}
