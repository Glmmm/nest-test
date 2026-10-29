import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { AppDataSource } from '../src/shared/db/source';

const TABLES = 'post_tags, posts, tags, categories, authors, users';

describe('Blog API (e2e)', () => {
  let app: INestApplication<App>;
  let authorToken: string;
  let otherToken: string;
  let categoryId: string;
  let tagId: string;
  let postId: string;

  const register = (email: string) =>
    request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'secret-pass-1', name: email.split('@')[0] });

  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    await AppDataSource.query(`TRUNCATE TABLE ${TABLES} CASCADE`);
    await AppDataSource.destroy();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    await AppDataSource.initialize();
    await AppDataSource.query(`TRUNCATE TABLE ${TABLES} CASCADE`);
    await AppDataSource.destroy();
  });

  it('GET /api/health reports the database as up', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('GET /api/read starts empty', async () => {
    const res = await request(app.getHttpServer()).get('/api/read').expect(200);
    expect(res.body).toEqual({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it('rejects protected routes without a token', async () => {
    await request(app.getHttpServer())
      .post('/api/categories')
      .send({ name: 'X', slug: 'x' })
      .expect(401);
  });

  it('registers an author and returns a JWT', async () => {
    const res = await register('author@test.dev').expect(201);

    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.tokenType).toBe('Bearer');
    expect(res.body.author.name).toBe('author');
    authorToken = res.body.accessToken;
  });

  it('rejects duplicated e-mails and wrong passwords', async () => {
    await register('author@test.dev').expect(409);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'author@test.dev', password: 'wrong-password' })
      .expect(401);

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'author@test.dev', password: 'secret-pass-1' })
      .expect(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('returns the authenticated profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authorToken}`)
      .expect(200);

    expect(res.body).toMatchObject({ email: 'author@test.dev' });
    expect(res.body.author).toMatchObject({ name: 'author', postCount: 0 });
    expect(res.body).not.toHaveProperty('password');
  });

  it('creates categories and tags', async () => {
    const category = await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ name: 'Technology', slug: 'technology' })
      .expect(201);
    categoryId = category.body.id;

    await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ name: 'Technology again', slug: 'technology' })
      .expect(409);

    const tag = await request(app.getHttpServer())
      .post('/api/tags')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ name: 'TypeScript', slug: 'typescript' })
      .expect(201);
    tagId = tag.body.id;

    const tags = await request(app.getHttpServer()).get('/api/tags').expect(200);
    expect(tags.body).toHaveLength(1);
  });

  it('creates a published post with category and tags', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/creator/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        title: 'Hello World',
        slug: 'hello-world',
        content: 'First post content',
        excerpt: 'A first post',
        status: 'published',
        categoryId,
        tagIds: [tagId],
      })
      .expect(201);

    postId = res.body.id;
    expect(res.body.publishedAt).toEqual(expect.any(String));
    expect(res.body.tags).toHaveLength(1);
  });

  it('rejects duplicated slugs and unknown tags', async () => {
    await request(app.getHttpServer())
      .post('/api/creator/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ title: 'Hello World', slug: 'hello-world', content: 'dup' })
      .expect(409);

    await request(app.getHttpServer())
      .post('/api/creator/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        title: 'Broken',
        slug: 'broken',
        content: 'x',
        tagIds: ['00000000-0000-4000-8000-000000000000'],
      })
      .expect(400);
  });

  it('lists, filters and searches published posts', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/read')
      .expect(200);
    expect(list.body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(list.body.data[0].author).not.toHaveProperty('userId');

    const search = await request(app.getHttpServer())
      .get('/api/read?search=hello')
      .expect(200);
    expect(search.body.meta.total).toBe(1);

    const byCategory = await request(app.getHttpServer())
      .get('/api/read?category=technology')
      .expect(200);
    expect(byCategory.body.meta.total).toBe(1);

    const byTag = await request(app.getHttpServer())
      .get('/api/read?tag=typescript')
      .expect(200);
    expect(byTag.body.meta.total).toBe(1);

    const noMatch = await request(app.getHttpServer())
      .get('/api/read?search=does-not-exist')
      .expect(200);
    expect(noMatch.body.meta.total).toBe(0);

    const detail = await request(app.getHttpServer())
      .get('/api/read/hello-world')
      .expect(200);
    expect(detail.body.id).toBe(postId);
  });

  it('does not let another author change the post', async () => {
    const other = await register('other@test.dev').expect(201);
    otherToken = other.body.accessToken;

    await request(app.getHttpServer())
      .put(`/api/creator/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hijacked' })
      .expect(404);

    const mine = await request(app.getHttpServer())
      .get('/api/creator/posts')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    expect(mine.body).toEqual([]);
  });

  it('unpublishes a post and removes it from the public API', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/creator/posts/${postId}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ status: 'draft' })
      .expect(200);

    expect(res.body.publishedAt).toBeNull();

    await request(app.getHttpServer())
      .get('/api/read/hello-world')
      .expect(404);
  });

  it('deletes only the author post', async () => {
    await request(app.getHttpServer())
      .delete(`/api/creator/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/creator/posts/${postId}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .expect(204);

    const mine = await request(app.getHttpServer())
      .get('/api/creator/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .expect(200);
    expect(mine.body).toEqual([]);
  });

  it('validates request payloads', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123', name: '' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
    expect(Array.isArray(res.body.message)).toBe(true);
  });
});
