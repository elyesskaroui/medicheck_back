import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { Post, PostSchema } from '../entity/post.entity';
import { Comment, CommentSchema } from '../entity/comment.entity';
import { Favorite, FavoriteSchema } from '../entity/favorite.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Post.name, schema: PostSchema}, {name: Comment.name, schema: CommentSchema}, {name: Favorite.name, schema: FavoriteSchema}]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}