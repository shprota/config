import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import { ConfigService } from '../../lib';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

describe('Dynamic config', () => {
  let app: INestApplication;
  const jsonPath = join(__dirname, 'dynamic.json');
  const json = `{
  "data": {
    "PORT": 8888
  }
}`;
  const json2 = `{
  "data": {
    "PORT": 9999
  }
}`;

  beforeAll(async () => {
    fs.writeFileSync(jsonPath, json);
    const module = await Test.createTestingModule({
      imports: [AppModule.withDynamicConfig(jsonPath, join(__dirname, '.env.valid'))],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    fs.unlinkSync(jsonPath);
    await app.close();
  });

  it(`should parse loaded env variables`, async () => {
    const configService = app.get(ConfigService);
    expect(configService.get('PORT')).toEqual(8888);
  });
  it(`should update env variables when dynamic file changes`, async () => {
    fs.writeFileSync(jsonPath, json2);
    const configService = app.get(ConfigService);
    await new Promise((r) => setTimeout(r, 200));
    expect(configService.get('PORT')).toEqual(9999);
  });
});
