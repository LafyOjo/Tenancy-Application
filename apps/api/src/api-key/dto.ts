import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ example: ['read', 'write'] })
  scopes: string[];

  @ApiProperty({ example: 1000 })
  quota: number;

  @ApiProperty({ example: 'org_123', required: false })
  orgId?: string;
}
