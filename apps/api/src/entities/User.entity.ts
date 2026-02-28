import { Entity, Property, Unique } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity.js";

@Entity({ tableName: "users" })
export class User extends BaseEntity {
    @Property({ type: "string" })
    @Unique()
    nickname!: string;

    @Property({ type: "string" })
    password!: string;
}

export type UserResponse = Omit<User, "password">;

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        nickname: user.nickname,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
