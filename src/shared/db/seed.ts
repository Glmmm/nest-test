import 'dotenv/config';
import { hashPassword } from '../../core/security/password';
import { POST_STATUS } from '../enums/post-status.enum';
import { Author } from '../orm/Author';
import { Category } from '../orm/Category';
import { Post } from '../orm/Post';
import { Tag } from '../orm/Tag';
import { User } from '../orm/User';
import { AppDataSource } from './source';

const SEED_EMAIL = process.env.SEED_EMAIL ?? 'author@nuvve.dev';
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'change-me-123';
const SEED_NAME = process.env.SEED_NAME ?? 'Nuvve Author';

const categoriesData = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Tech related posts',
  },
  {
    name: 'NodeJS',
    slug: 'nodejs',
    description: 'Backend development with Node.js',
  },
  {
    name: 'Database',
    slug: 'database',
    description: 'SQL, TypeORM and databases',
  },
];

const tagsData = [
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'TypeORM', slug: 'typeorm' },
  { name: 'Backend', slug: 'backend' },
  { name: 'Tutorial', slug: 'tutorial' },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(User);
    const authorRepository = AppDataSource.getRepository(Author);
    const categoryRepository = AppDataSource.getRepository(Category);
    const tagRepository = AppDataSource.getRepository(Tag);
    const postRepository = AppDataSource.getRepository(Post);

    let user = await userRepository.findOne({ where: { email: SEED_EMAIL } });
    if (!user) {
      user = userRepository.create({
        email: SEED_EMAIL,
        password: await hashPassword(SEED_PASSWORD),
      });
      await userRepository.save(user);
      console.log(`Created seed user: ${user.email}`);
    }

    let author = await authorRepository.findOne({
      where: { userId: user.id },
    });
    if (!author) {
      author = authorRepository.create({
        userId: user.id,
        name: SEED_NAME,
        bio: 'This is the bio for the seeded author.',
      });
      await authorRepository.save(author);
      console.log(`Created seed author: ${author.name}`);
    }

    const categories: Record<string, Category> = {};
    for (const data of categoriesData) {
      let category = await categoryRepository.findOne({
        where: { slug: data.slug },
      });
      if (!category) {
        category = await categoryRepository.save(
          categoryRepository.create(data),
        );
      }
      categories[data.slug] = category;
    }

    const tags: Record<string, Tag> = {};
    for (const data of tagsData) {
      let tag = await tagRepository.findOne({ where: { slug: data.slug } });
      if (!tag) {
        tag = await tagRepository.save(tagRepository.create(data));
      }
      tags[data.slug] = tag;
    }

    const postsData = [
      {
        title: 'Getting Started with TypeORM and NestJS',
        slug: 'getting-started-with-typeorm-and-nestjs',
        excerpt: 'How to wire TypeORM into a NestJS application.',
        content:
          'TypeORM is an ORM that can run in NodeJS, Browser, Cordova, PhoneGap, React Native, Electron, Ionic, and Cordova platforms...',
        status: POST_STATUS.PUBLISHED,
        publishedAt: new Date(),
        category: categories.nodejs,
        tags: [tags.typescript, tags.typeorm, tags.backend],
      },
      {
        title: 'Advanced Database Relations in TypeORM',
        slug: 'advanced-database-relations-in-typeorm',
        excerpt: 'One-to-many, many-to-one and many-to-many done right.',
        content:
          'Learn how to handle One-to-Many, Many-to-One, and Many-to-Many relations efficiently using TypeORM entities...',
        status: POST_STATUS.PUBLISHED,
        publishedAt: new Date(),
        category: categories.database,
        tags: [tags.typeorm, tags.tutorial],
      },
    ];

    for (const data of postsData) {
      const existing = await postRepository.findOne({
        where: { slug: data.slug },
      });
      if (existing) continue;

      const post = postRepository.create({
        ...data,
        authorId: author.id,
        categoryId: data.category.id,
      });
      await postRepository.save(post);
      console.log(`Created seed post: ${post.title}`);
    }

    console.log('Seed completed successfully.');
    console.log(`Login with: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exitCode = 1;
});
