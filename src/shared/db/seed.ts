import { Post } from '../orm/Post';
import { POST_STATUS } from '../enums/post-status.enum';
import { Author } from '../orm/Author';
import { Category } from '../orm/Category';
import { Tag } from '../orm/Tag';
import { AppDataSource } from './source';

async function seed() {
  try {
    await AppDataSource.initialize();

    const authorRepository = AppDataSource.getRepository(Author);
    const categoryRepository = AppDataSource.getRepository(Category);
    const tagRepository = AppDataSource.getRepository(Tag);
    const postRepository = AppDataSource.getRepository(Post);

    const existingUserId = '575e3872-55f7-4099-bb18-d06be7ec63be';

    let author = await authorRepository.findOne({
      where: { userId: existingUserId },
    });

    if (!author) {
      console.log('Author profile not found for the user. Creating one...');
      author = authorRepository.create({
        userId: existingUserId,
        name: 'Registered Author',
        bio: 'This is the bio for the registered author.',
      });
      await authorRepository.save(author);
    }

    console.log(`Using Author ID: ${author.id}`);

    const categoryData = [
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

    const categories: Category[] = [];
    for (const cat of categoryData) {
      let category = await categoryRepository.findOne({
        where: { slug: cat.slug },
      });
      if (!category) {
        category = categoryRepository.create(cat);
        await categoryRepository.save(category);
      }
      categories.push(category);
    }

    const tagData = [
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'TypeORM', slug: 'typeorm' },
      { name: 'Backend', slug: 'backend' },
      { name: 'Tutorial', slug: 'tutorial' },
    ];

    const tags: Tag[] = [];
    for (const t of tagData) {
      let tag = await tagRepository.findOne({ where: { slug: t.slug } });
      if (!tag) {
        tag = tagRepository.create(t);
        await tagRepository.save(tag);
      }
      tags.push(tag);
    }

    const mockPosts = [
      {
        title: 'Getting Started with TypeORM and NestJS',
        slug: 'getting-started-with-typeorm-and-nestjs',
        content:
          'TypeORM is an ORM that can run in NodeJS, Browser, Cordova, PhoneGap, React Native, Electron, Ionic, and Cordova platforms...',
        status: POST_STATUS.PUBLISHED,
        publishedAt: new Date(),
        category: categories[1],
        tags: [tags[0], tags[1], tags[2]],
      },
      {
        title: 'Advanced Database Relations in TypeORM',
        slug: 'advanced-database-relations-in-typeorm',
        content:
          'Learn how to handle One-to-Many, Many-to-One, and Many-to-Many relations efficiently using TypeORM entities...',
        status: POST_STATUS.PUBLISHED,
        publishedAt: new Date(),
        category: categories[2],
        tags: [tags[1], tags[3]],
      },
    ];

    for (const postData of mockPosts) {
      const existingPost = await postRepository.findOne({
        where: { slug: postData.slug },
      });
      if (!existingPost) {
        const post = postRepository.create({
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          status: postData.status,
          publishedAt: postData.publishedAt,
          authorId: author.id,
          categoryId: postData.category.id,
          tags: postData.tags,
        });
        await postRepository.save(post);
        console.log(`Created post: ${post.title}`);
      }
    }

    console.log('Mock data successfully added!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
