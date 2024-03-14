import { useToast } from '@/hooks/useToast';
import { PostCreationRequest, PostValidator } from '@/lib/validators/post';
import EditorJS from '@editorjs/editorjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { z } from 'zod';
import { getCsrfToken } from '@/lib/utils';
import { useSelector } from 'react-redux'
// import '@/styles/editor.css'

type FormData = z.infer<typeof PostValidator>

interface EditorProps {
  subrabbitId: number;
}




const Editor: React.FC<EditorProps> = ({ subrabbitId }) => {
    const subredditDetail = useSelector((state) => state.userInfo);
    const { user } = subredditDetail;

    const navigate = useNavigate();
    const location = useLocation();
    // const newPost = useSelector((state: RootState) => state.postCreate);
    // const { success, loading, error } = newPost;

    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<FormData>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
          subrabbitId,
          title: '',
          content: null,
        },
      })

      const { toast } = useToast()
      const ref = useRef<EditorJS>()
      const _titleRef = useRef<HTMLTextAreaElement>(null)

      const [isMounted, setIsMounted] = useState<boolean>(false)
      // const dispatch = useDispatch<AppDispatch>()

      const { mutate: createPost } = useMutation({
        mutationFn: async ({
          title,
          content,
          subrabbitId,
        }: PostCreationRequest) => {
          const payload: PostCreationRequest = { title, content, subrabbitId }
          // const config = {
          //   headers: {
          //       'Content-type': 'application/json',
          //       Authorization: `Bearer ${user?.access_token}`
          //   }
          // }

          const { data } = await axios.post(
            '/api/create-post/', 
            payload,
            // config
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                "x-csrftoken": getCsrfToken()
              },
            }
          )
          return data
        },
        onError: () => {
          return toast({
            title: 'Something went wrong.',
            description: 'Your post was not published. Please try again.',
            variant: 'destructive',
          })
        },
        onSuccess: () => {
          // turn pathname /r/mycommunity/submit into /r/mycommunity
          const newPathname = location.pathname.split('/').slice(0, -1).join('/');
          navigate(newPathname);

          // router.push(newPathname)
          // router.refresh()
    
          return toast({
            description: 'Your post has been published.',
          })
        },
      })


      const initializeEditor = useCallback(async () => {

        const EditorJS = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const Table = (await import('@editorjs/table')).default
        const List = (await import('@editorjs/list')).default
        const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const ImageTool = (await import('@editorjs/image')).default
    
        if (!ref.current) {
          const editor = new EditorJS({
            holder: 'editor',
            onReady() {
              ref.current = editor
            },
            placeholder: 'Type here to write your post...',
            inlineToolbar: true,
            data: { blocks: [] },
            tools: {
              header: Header,
              linkTool: {
                class: LinkTool,
                config: {
                  endpoint: '/api/link/',
                },
              },
              image: {
                class: ImageTool,
                config: {
                    endpoints: {
                      byFile: '/api/upload-image/',
                      byUrl: '/api/upload-file/',
                    },
                  },
              },
              list: List,
              code: Code,
              inlineCode: InlineCode,
              table: Table,
              embed: Embed,
            },
          })
        }
      }, [])

      useEffect(() => {
          setIsMounted(true)
      }, [])

    useEffect(() => {
        if (Object.keys(errors).length) {
          
          for (const [_key, value] of Object.entries(errors)) {
            console.log(_key, value)
            value
            toast({
              title: 'Something went wrong.',
              description: (value as { message: string }).message,
              variant: 'destructive',
            })
          }
        }
      }, [errors, toast])

      useEffect(() => {
        const init = async () => {
          await initializeEditor()
    
          setTimeout(() => {
            _titleRef?.current?.focus()
          }, 0)
        }
    
        if (isMounted) {
          init()
    
          return () => {
            ref.current?.destroy()
            ref.current = undefined
          }
        }
      }, [isMounted, initializeEditor])

    const { ref: titleRef, ...rest } = register('title')

    async function onSubmit(data: FormData) {
      console.log('Submit')
        const blocks = await ref.current?.save()
        console.log(blocks)
    
        const payload: PostCreationRequest = {
          title: data.title,
          content: blocks,
          subrabbitId,
        }
        createPost(payload)
      }

      useEffect(() => {}, [])

    //   useEffect(() => {
    //     if (error) {
    //       toast({
    //         title: 'Something went wrong.',
    //         description: 'Your post was not published. Please try again.',
    //         variant: 'destructive',
    //       });
    //     } else if (success) {
    //       toast({
    //         description: 'Your post has been published.',
    //       });
          // turn pathname /r/mycommunity/submit into /r/mycommunity
          // const newPathname = location.pathname.split('/').slice(0, -1).join('/');
          // navigate(newPathname);
    //     //   dispatch(resetState())
    //     }
    //   }, [navigate, location.pathname, toast]);

    return (
    <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
      <form
        id='subrabbit-post-form'
        className='w-fit'
        onSubmit={handleSubmit(onSubmit)}
        >
          <div className='prose prose-stone dark:prose-invert'>
          <TextareaAutosize
            ref={(e) => {
              titleRef(e)
              // @ts-expect-error chill
              _titleRef.current = e
            }}
            {...rest}
            placeholder='Title'
            className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
          />
            <div id='editor' className='min-h-[500px]' />
          </div>
      </form>
    </div>
  );
};

export default Editor;
