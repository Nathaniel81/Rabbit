import { SubrabbitData } from "./subrabbit";

type Votes = {
    type: VoteType;
    user: string;
}

type VoteType = 'UP' | 'DOWN';

type Author = {
    username: string;
    profile_picture: string;
}

type Comment = {
    id: string | undefined;
    text: string;
    parent_comment_id?: string;
    comment_votes: Votes[];
    created_at: string;
    content: any;
    author: Author;
}

export type Post = {
    id: string | null | undefined;
    title: string;
    author: Author;
    comments: Comment[];
    comments_count: number;
    content: string;
    subrabbit: SubrabbitData;
    votes: Votes[];
    created_at: string;
    members_count: string;
};
