import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Simple S3 helper for generating signed upload URLs. */
@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket = process.env.S3_BUCKET || 'tenancy';

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: !!process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    });
  }

  /** Generate a presigned URL for uploading to the given key. */
  async getSignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });
    return { uploadUrl, url: this.getPublicUrl(key), key };
  }

  /** Directly upload a file buffer to S3. */
  async upload(key: string, body: Buffer, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return { url: this.getPublicUrl(key), key };
  }

  /** Public URL for an object. */
  getPublicUrl(key: string) {
    const base =
      process.env.S3_PUBLIC_URL || `https://${this.bucket}.s3.amazonaws.com`;
    return `${base}/${key}`;
  }
}

