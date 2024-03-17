import { SubrabbitData } from "./subrabbit";

type Votes = {
    type: VoteType;
    user: string;
}

type VoteType = 'UP' | 'DOWN';

type Author = {
    username: string;
}

type Comment = {
    id: string;
    text: string;
    parent_comment?: Comment;
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
    content: string;
    subrabbit: SubrabbitData;
    votes: Votes[];
    created_at: string;
    members_count: string;
};
