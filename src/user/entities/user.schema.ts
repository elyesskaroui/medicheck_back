import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';


@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

   @IsString()
    //@MinLength(6)
    prenom: string;

  @Prop({ required: false, type: SchemaTypes.ObjectId })
  roleId: Types.ObjectId;

 // @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Car' }] })
//cars: Types.ObjectId[];

//@Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Car' }] })
//assurances: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
