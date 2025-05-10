import { Controller, Get, Post as HttpPost, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateCommentDto, CreatePostDto, UpdatePostDto } from '../DTO/dto';
import { Post } from '../entity/post.entity';
import { Comment } from '../entity/comment.entity';

@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // Routes originales avec préfixe 'social'
  @Get('social/posts')
  async getAllSocialPosts(): Promise<Post[]> {
    return this.socialService.getAllPosts();
  }

  @Get('social/posts/:id')
  async getPostById(@Param('id') id: string): Promise<Post> {
    return this.socialService.getPostById(id);
  }

  @HttpPost('social/posts')
  async createSocialPost(@Body() createPostDto: CreatePostDto): Promise<Post> {
    return this.socialService.createPost(createPostDto);
  }

  @Put('social/posts/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    return this.socialService.updatePost(id, updatePostDto);
  }

  @Delete('social/posts/:id')
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.socialService.deletePost(id);
  }

  @HttpPost('social/posts/:id/like')
  async likePost(@Param('id') id: string): Promise<Post> {
    return this.socialService.likePost(id);
  }

  @HttpPost('social/posts/:id/share')
  async sharePost(@Param('id') id: string): Promise<Post> {
    return this.socialService.sharePost(id);
  }

  @HttpPost('social/posts/:id/comments')
  async addSocialComment(
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.socialService.addComment(postId, createCommentDto);
  }

  @Get('social/posts/:id/comments')
  async getPostComments(@Param('id') postId: string): Promise<Comment[]> {
    return this.socialService.getPostComments(postId);
  }

  @HttpPost('social/posts/:id/favorite')
  async toggleSocialFavorite(@Param('id') id: string, @Body() data: { userId: string }): Promise<{ isFavorite: boolean }> {
    return this.socialService.toggleFavorite(id, data.userId);
  }

  @Get('social/favorites')
  async getSocialFavorites(@Query('userId') userId: string): Promise<Post[]> {
    return this.socialService.getFavorites(userId);
  }

  // Nouvelles routes basées sur les erreurs
  @Get('publication')
  async getAllPosts(): Promise<Post[]> {
    return this.socialService.getAllPosts();
  }

  @HttpPost('publication')
  async createPost(@Body() createPostDto: CreatePostDto): Promise<Post> {
    return this.socialService.createPost(createPostDto);
  }

  @HttpPost('commentaire')
  async addComment(@Body() data: { postId: string } & CreateCommentDto): Promise<Comment> {
    return this.socialService.addComment(data.postId, {
      content: data.content,
      userId: data.userId,
      username: data.username
    });
  }

  @Get('favorite')
  async getFavorites(@Query('userId') userId: string): Promise<Post[]> {
    return this.socialService.getFavorites(userId);
  }

  @HttpPost('favorite')
  async toggleFavorite(@Body() data: { postId: string, userId: string }): Promise<{ isFavorite: boolean }> {
    return this.socialService.toggleFavorite(data.postId, data.userId);
  }

  // Ajout d'autres routes manquantes si nécessaire
  @Get('publication/:id')
  async getSinglePost(@Param('id') id: string): Promise<Post> {
    return this.socialService.getPostById(id);
  }

  @Get('commentaire/:postId')
  async getComments(@Param('postId') postId: string): Promise<Comment[]> {
    return this.socialService.getPostComments(postId);
  }
}