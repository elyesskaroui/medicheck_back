import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Post } from './post.entity';

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class Comment extends Document {
  @Prop({ type: String, default: () => crypto.randomUUID() })
  id: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, default: null })
  userId: string;

  @Prop({ type: String, default: null })
  username: string;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId | Post;

  @Prop()
  createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);