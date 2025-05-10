import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comment } from './comment.entity';
import { Favorite } from './favorite.entity';

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class Post extends Document {
  @Prop({ type: String, default: () => crypto.randomUUID() })
  id: string;

  @Prop({ required: true })
  avatarText: string;

  @Prop({ required: true })
  avatarColor: Number;

  @Prop({ required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ required: true })
  time: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: true })
  tag: string; // 'true', 'doubt', 'false'

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: 0 })
  shares: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
  commentsList: Types.ObjectId[] | Comment[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Favorite' }], default: [] })
  favorites: Types.ObjectId[] | Favorite[];

  @Prop()
  createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
