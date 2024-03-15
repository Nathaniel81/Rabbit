import { SubrabbitData } from "./subrabbit";

type Votes = {
	type: VoteType;
	user: string;
  }
  
  type VoteType = 'UP' | 'DOWN';
  
  type Author = {
	username: string;
  }

  
  export type Post = {
	id: string;
	title: string;
	author: Author;
	comments: string;
	content: string;
	subrabbit: SubrabbitData;
	votes: Votes[];
	created_at: string;
	members_count: string;
  };
  