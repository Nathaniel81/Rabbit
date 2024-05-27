import { Button } from "@/components/ui/Button";
import { useParams } from 'react-router-dom';
import SubrabbitActionPanel from "@/components/SubrabbitActionPanel";
import Editor from "@/components/Editor";


const CreatePostPage = () => {
  const { slug } = useParams();

  return (
    <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
        <div className='flex flex-col col-span-2 space-y-6 items-start gap-6'>
          {/* heading */}
          <div className='border-b border-gray-200 pb-5'>
            <div className='-ml-2 -mt-2 flex flex-wrap items-baseline'>
              <h3 className='ml-2 mt-4 text-base font-semibold leading-6 text-gray-900'>
                Create Post
              </h3>
              <p className='ml-2 mt-1 truncate text-sm text-gray-500'>
                in r/{slug}
              </p>
            </div>
          </div>
  
          <Editor />
    
          <div className='w-full flex justify-end'>
            <Button type='submit' className='w-full' form='subrabbit-post-form'>
              Post
            </Button>
          </div>
        </div>
        <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
          <SubrabbitActionPanel />
        </div>
      </div>
    </div>
  )
}

export default CreatePostPage;
