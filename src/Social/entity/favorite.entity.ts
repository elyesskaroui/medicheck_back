import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Post } from './post.entity';

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class Favorite extends Document {
  @Prop({ type: String, default: () => crypto.randomUUID() })
  id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId | Post;

  @Prop()
  createdAt: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
