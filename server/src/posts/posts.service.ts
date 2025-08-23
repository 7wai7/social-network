import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePostDto, PostDto } from 'src/dto/create-post.dto';
import { Post } from 'src/models/posts.model';
import { PostFiles } from 'src/models/postFiles.model';
import { User } from 'src/models/users.model';
import { StorageService } from 'src/storage/storage.service';
import { col, fn, literal, Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Files } from 'src/models/files.model';
import { PostViews } from 'src/models/postViews.model';
import { Tags } from 'src/models/tags.model';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { fakerRU as faker } from '@faker-js/faker';


@Injectable()
export class PostsService {
    postInclude: any;

    constructor(
        @InjectModel(Post) private postsModel: typeof Post,
        @InjectModel(Tags) private tagsModel: typeof Tags,
        @InjectModel(Files) private filesModel: typeof Files,
        @InjectModel(PostFiles) private postFilesModel: typeof PostFiles,
        private readonly storageService: StorageService,
        @Inject(Sequelize) private readonly sequelize: Sequelize,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        this.postInclude = [
            { model: User, as: 'user', attributes: ['id', 'login'] },
            { model: Tags, as: 'tags', through: { attributes: [] }, required: false, },
            { model: Files, as: 'files', through: { attributes: [] }, required: false, }
        ]
    }

    async getPost(userId: number, id: number) {
        return await this.postsModel.scope(Post.withOwnership(userId)).findByPk(id, {
            include: this.postInclude,
        })
    }

    async getUserPosts(user_id: number, cursor?: string, limit: number = 20) {
        const where: any = {
            user_id
        };

        if (cursor) {
            where.createdAt = { [Op.lt]: cursor };
        }

        return await this.postsModel.scope(Post.withOwnership(user_id)).findAll({
            where,
            include: this.postInclude,
            order: [['createdAt', 'DESC']],
            limit,
        })

    }

    async generateCandidates(currentUserId: number) {

        const result: any = await this.sequelize.query(`
            WITH
            follow_posts AS (
                SELECT p.id,
                    'following'::text AS source
                FROM posts p
                WHERE p."createdAt" >= now() - interval '70 days'
                    AND p.user_id IN (
                        SELECT following_id FROM follow
                        WHERE follower_id = :currentUserId
                    )
                    AND p.id NOT IN (
                    SELECT post_id FROM post_views WHERE user_id = :currentUserId
                    )
                ORDER BY p."createdAt" DESC
                LIMIT 5000  -- обмежуємо вибірку
            ),
            selected_posts AS (
                SELECT p.id FROM posts p
                WHERE p.user_id != :currentUserId
                    AND p."createdAt" >= now() - interval '70 days'
                    AND p.user_id NOT IN (
                        SELECT following_id FROM follow
                        WHERE follower_id = :currentUserId
                    )
                    AND p.id NOT IN (
                        SELECT post_id FROM post_views WHERE user_id = :currentUserId
                    )
                ORDER BY p."createdAt" DESC
                LIMIT 5000  -- обмежуємо вибірку
            ),
            tag_weights AS (
                SELECT
                    t.id AS tag_id,
                    t.name,
                    COUNT(*)::float AS frequency,
                    SUM(COUNT(*)) OVER ()::float AS total_freq
                FROM posts p
                JOIN post_tags pt ON pt.post_id = p.id
                JOIN tags t ON pt.tag_id = t.id
                JOIN follow f ON f.following_id = p.user_id
                WHERE f.follower_id = :currentUserId
                GROUP BY t.id, t.name
            ),
            tag_limits AS (
                SELECT
                    tag_id,
                    name,
                    (frequency / total_freq) * 0.9 AS weight,   -- 90% під теги
                    CEIL((frequency / total_freq) * 0.9 * :maxPosts)::int AS limit_count
                FROM tag_weights
            ),
            ranked_posts AS (
                SELECT p.*, tw.tag_id,
                    ROW_NUMBER() OVER (PARTITION BY tw.tag_id ORDER BY random()) AS rn,
                    tw.limit_count
                FROM selected_posts p
                JOIN post_tags pt ON pt.post_id = p.id
                JOIN tag_limits tw ON pt.tag_id = tw.tag_id
            ),
            tag_posts AS (
                SELECT id,
                    'tags'::text AS source
                FROM ranked_posts
                WHERE rn <= limit_count
            ),
            no_tag_posts AS (
                SELECT p.id,
                    'no_tags'::text AS source
                FROM selected_posts p
                LEFT JOIN post_tags pt ON pt.post_id = p.id
                WHERE pt.tag_id IS NULL
                ORDER BY random()
                LIMIT :maxPosts * 0.1 -- тут 10%
            ),
            united AS (
                SELECT * FROM follow_posts
                UNION
                SELECT * FROM tag_posts
                UNION
                SELECT * FROM no_tag_posts
            ),
            final_posts AS (
                SELECT DISTINCT ON (id) * FROM united
            )

            SELECT * FROM final_posts
            ORDER BY random()
        `, {
            replacements: {
                currentUserId,
                maxPosts: 1000
            }
        });

        return result[0].map((p: { id: any; }) => p.id) as number[];
    }

    async getCacheRecomendationsIds(currentUserId: number) {
        const cacheKey = `recommendations:${currentUserId}`;

        const cached: number[] | undefined = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('✅ Віддав з кешу');
            return cached;
        }

        const candidatePostIds = await this.generateCandidates(currentUserId);
        await this.cacheManager.set(cacheKey, candidatePostIds);
        console.log('🆕 Згенеровано і закешовано');

        return candidatePostIds;
    }

    async getNewsFeed(currentUserId: number, cursorId = 0, limit: number = 20, refresh = false) {
        if (refresh) this.cacheManager.del(`recommendations:${currentUserId}`);
        const cachePostsIds = await this.getCacheRecomendationsIds(currentUserId);
        const cursor = cachePostsIds.indexOf(cursorId);
        const ids = cursor >= 0 ? cachePostsIds.slice(cursor + 1, cursor + limit + 1) : cachePostsIds.slice(0, limit);

        return await this.postsModel.scope(Post.withOwnership(currentUserId)).findAll({
            where: {
                id: ids,
            },
            include: this.postInclude,
            order: [
                // порядок за масивом id, як у SQL
                [this.sequelize.literal(`array_position(ARRAY[${ids.join(',')}]::bigint[], "Post"."id")`), 'ASC']
            ]
        })
    }


    async getFollowingPosts(currentUserId: number, cursor?: string, limit: number = 20) {
        const where: any = {
            createdAt: { [Op.gte]: literal(`now() - interval '12 days'`), },
            id: {
                [Op.notIn]: literal(`(
                        SELECT post_id
                        FROM post_views
                        WHERE user_id = ${currentUserId}
                    )`),
            },
            user_id: {
                [Op.in]: literal(`(
                        SELECT following_id FROM follow
                        WHERE follower_id = ${currentUserId}
                    )`)
            }
        };

        if (cursor) where.createdAt = { [Op.lt]: cursor };

        return await this.postsModel.findAll({
            where,
            include: this.postInclude,
            order: [['createdAt', 'DESC']],
            limit
        })
    }

    async createPost(postDto: CreatePostDto) {
        const transaction = await this.sequelize.transaction();

        try {
            const post = await this.postsModel.create(postDto, { transaction });

            if (postDto.tags && postDto.tags.length > 0) {
                // Знаходимо вже існуючі теги
                const existingTags = await this.tagsModel.findAll({
                    where: { name: postDto.tags },
                    transaction
                });

                const existingTagNames = existingTags.map(tag => tag.get({ plain: true }).name);

                // Визначаємо нові теги (яких ще немає)
                const newTagNames = postDto.tags.filter(tag => !existingTagNames.includes(tag));

                // Створюємо нові теги
                const newTags = await this.tagsModel.bulkCreate(
                    newTagNames.map(name => ({ name })),
                    { transaction }
                );

                // Об’єднуємо старі та нові теги в один список
                const allTags = [...existingTags, ...newTags];

                // Прив’язуємо теги до поста
                await post.$set('tags', allTags, { transaction });
            }


            if (postDto.files && postDto.files.length > 0) {
                const filesRaws = await this.filesModel.bulkCreate(postDto.files, { transaction });
                await post.$set('files', filesRaws, { transaction });
            }

            await transaction.commit();

            const fullPost = await this.postsModel.scope(Post.withOwnership(postDto.user_id)).findByPk(post.id, {
                include: this.postInclude
            })

            return fullPost?.get({ plain: true })
        } catch (error) {
            console.log(error);

            await transaction.rollback();
            throw new HttpException('Error create post: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async generatePost(currentUserId: number) {
        const data = {
            userId: currentUserId,
            username: faker.internet.username(), // before version 9.1.0, use userName()
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
            password: faker.internet.password(),
            birthdate: faker.date.birthdate(),
            registeredAt: faker.date.past(),
        }

        console.log(data);
        return data
    }

    async deletePost(postId: number) {
        const transaction = await this.sequelize.transaction();

        try {
            const post = await this.postsModel.findByPk(postId, {
                include: [{
                    model: Files,
                    as: 'files',
                    through: { attributes: [] },
                    required: false
                }],
                transaction
            });
            if (!post) {
                throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }

            // Отримуємо всі file_id
            const plainPost = post.get({ plain: true });
            const files = [...plainPost.files];
            const fileIds = files.map(file => file.id);

            // Видаляємо зв’язки в post_files
            await this.postFilesModel.destroy({
                where: { post_id: postId },
                transaction
            });

            // Видаляємо файли (якщо потрібно повністю їх прибрати з БД)
            if (fileIds.length > 0) {
                await this.filesModel.destroy({
                    where: { id: fileIds },
                    transaction
                });
            }

            // Видаляємо сам пост
            await this.postsModel.destroy({
                where: { id: postId },
                transaction
            });

            // Видаляєм файли
            for (const file of files) {
                const filename = file.url.split('/').pop();
                if (filename) await this.storageService.deleteFile(filename);
            }

            await transaction.commit();
            return true;
        } catch (error) {
            console.log(error);

            await transaction.rollback();
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deletePostByOwner(id: number, userId: number) {
        const post = await this.postsModel.findOne({ where: { id } })
        if (!post) throw new HttpException("Post not found", HttpStatus.NOT_FOUND);
        const plainPost = post.get({ plain: true });
        if (plainPost.user_id !== userId) throw new HttpException('Forbidden: not your post', HttpStatus.FORBIDDEN);

        return await this.deletePost(id);
    }



    async getDetailedPostsByIds(currentUserId: number, ids: number[], cursor?: string, limit: number = 20) {
        const where: any = {
            id: ids
        };

        if (cursor) where.createdAt = { [Op.lt]: cursor };

        return await this.postsModel.scope(Post.withOwnership(currentUserId)).findAll({
            where,
            include: this.postInclude,
            order: [
                // порядок за масивом id, як у SQL
                [this.sequelize.literal(`array_position(ARRAY[${ids.join(',')}]::bigint[], "Post"."id")`), 'ASC']
            ],
            limit
        })
    }
}
