import request from 'supertest';
import path from 'path';
import fs from 'fs';
import express from 'express';
import serverModule from '../server.js';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

const app = serverModule.app; // Access exported app

describe('Image Upload API', () => {
  const testImage = path.join(__dirname, 'test-image.png');
  const testText = path.join(__dirname, 'test.txt');

  beforeAll(() => {
    fs.writeFileSync(testImage, 'fake-image-data');
    fs.writeFileSync(testText, 'not-an-image');
  });

  afterAll(() => {
    fs.unlinkSync(testImage);
    fs.unlinkSync(testText);
  });

  it('should upload an image successfully', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', testImage);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('url');
  });

  it('should reject non-image uploads', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', testText);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
