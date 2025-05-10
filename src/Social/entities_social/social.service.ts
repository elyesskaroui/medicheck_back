import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto, CreatePostDto, UpdatePostDto } from '../DTO/dto';
import { Post } from '../entity/post.entity';
import { Comment } from '../entity/comment.entity';
import { Favorite } from '../entity/favorite.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postModel.find()
      .sort({ createdAt: -1 })
      .populate('commentsList')
      .exec();
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).populate('commentsList').exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel({
      ...createPostDto,
      time: 'À l\'instant',
      likes: 0,
      comments: 0,
      shares: 0,
    });
    return createdPost.save();
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.getPostById(id);
    Object.assign(post, updatePostDto);
    return post.save();
  }

  async deletePost(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    // Related comments and favorites should be deleted via cascading or hooks if needed
  }

  async likePost(id: string): Promise<Post> {
    const post = await this.getPostById(id);
    post.likes += 1;
    return post.save();
  }

  async sharePost(id: string): Promise<Post> {
    const post = await this.getPostById(id);
    post.shares += 1;
    return post.save();
  }

  async addComment(postId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const post = await this.getPostById(postId);

    const comment = new this.commentModel({
      ...createCommentDto,
      post: new Types.ObjectId(postId),
    });
    const savedComment = await comment.save();

    // Increment comments count
    post.comments += 1;
    await post.save();

    return savedComment;
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    await this.getPostById(postId); // Ensure post exists
    return this.commentModel.find({ post: postId }).sort({ createdAt: -1 }).exec();
  }

  async toggleFavorite(postId: string, userId: string): Promise<{ isFavorite: boolean }> {
    const post = await this.getPostById(postId);

    const existing = await this.favoriteModel.findOne({ post: postId, userId }).exec();
    if (existing) {
      await this.favoriteModel.deleteOne({ _id: existing._id }).exec();
      return { isFavorite: false };
    } else {
      const newFavorite = new this.favoriteModel({
        post: new Types.ObjectId(postId),
        userId,
      });
      await newFavorite.save();
      return { isFavorite: true };
    }
  }

  async getFavorites(userId: string): Promise<Post[]> {
    const favorites = await this.favoriteModel
      .find({ userId })
      .populate({
        path: 'post',
        populate: { path: 'commentsList' }
      })
      .sort({ createdAt: -1 })
      .exec();

    return favorites.map(fav => fav.post as Post);
  }
}
