import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { Post } from '@/types/post'
import PostComment from './comments/PostComment';
import CreateComment from './CreateComment';


const CommentsSection = ({ post }: { post: Post }) => {
    const userLogin = useSelector((state: RootState) => state.userInfo);
    const { user } = userLogin;

    return (
        <div className='flex flex-col gap-y-4 mt-4'>
            <hr className='w-full h-px my-6' />
            <CreateComment postId={post?.id ?? ''} />
            <div className='flex flex-col gap-y-6 mt-4'>
                {post?.comments
                    .filter((comment) => !comment.parent_comment)
                    .map((topLevelComment) => {
                        const topLevelCommentVotesAmt = topLevelComment.comment_votes.reduce(
                            (acc, vote) => {
                                if (vote.type === 'UP') return acc + 1;
                                if (vote.type === 'DOWN') return acc - 1;
                                return acc;
                            },
                            0
                        );
                        const topLevelCommentVote = topLevelComment.comment_votes.find(
                            (vote) => vote.user === user?.user_id
                        );

                        return (
                            <div key={topLevelComment.id} className='flex flex-col'>
                                <div className='mb-2'>
                                    <PostComment
                                        comment={topLevelComment}
                                        currentVote={topLevelCommentVote}
                                        votesAmt={topLevelCommentVotesAmt}
                                        postId={post.id}
                                    />
                                </div>
                                {/* Render replies */}
                                {post.comments
                                    .filter((comment) => comment.parent_comment?.id === topLevelComment.id)
                                    .sort((a, b) => b.comment_votes.length - a.comment_votes.length)
                                    .map((reply) => {
                                        const replyVotesAmt = reply.comment_votes.reduce((acc, vote) => {
                                            if (vote.type === 'UP') return acc + 1;
                                            if (vote.type === 'DOWN') return acc - 1;
                                            return acc;
                                        }, 0);
                                        const replyVote = reply.comment_votes.find(
                                            (vote) => vote.user === user?.user_id
                                        );
                                        return (
                                            <div
                                                key={reply.id}
                                                className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'>
                                                <PostComment
                                                    comment={reply}
                                                    currentVote={replyVote}
                                                    votesAmt={replyVotesAmt}
                                                    postId={post.id}
                                                />
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default CommentsSection
