import '@/Editor.css';
import { useToast } from '@/hooks/useToast';
import { getCsrfToken } from '@/lib/utils';
import { PostCreationRequest, PostValidator } from '@/lib/validators/post';
import { openModal } from '@/redux/state';
import { Subrabbit } from '@/types/subrabbit';
import EditorJS from '@editorjs/editorjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { z } from 'zod';
import { useDispatch } from 'react-redux';

type FormData = z.infer<typeof PostValidator>


const Editor = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const dispatch = useDispatch();
  
    const parts = pathname.split('/');
    const queryClient = useQueryClient();
    const queryKey = [`subrabbitDetail ${parts[2]}`];
    const data = queryClient.getQueryData(queryKey) as Subrabbit;
    const subrabbitId = data?.id;

    const navigate = useNavigate();

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
      });

      const { toast } = useToast();
      const ref = useRef<EditorJS>();
      const _titleRef = useRef<HTMLTextAreaElement>(null);

      const [isMounted, setIsMounted] = useState<boolean>(false);

      const { mutate: createPost } = useMutation({
        mutationFn: async ({
          title,
          content,
          subrabbitId,
        }: PostCreationRequest) => {
          const payload: PostCreationRequest = { title, content, subrabbitId }
          const config = {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "x-csrftoken": getCsrfToken()
            },
          }

          const { data } = await axios.post(
            '/api/create-post/', 
            payload,
            config
          )
          return data;
        },
        //eslint-disable-next-line
        onError: (err: any) => {
          if (err instanceof AxiosError) {
            if (err.response?.status === 401) {
              dispatch(openModal("signin"))
              toast({
                title: 'Log In Required.',
                description: 'Please log in or sign up to create a community.',
                variant: 'destructive',
              })
              return;
            }
          }
    
          toast({
            title: 'There was an error.',
            description: err.message,
            variant: 'destructive',
          })
        },
        onSuccess: () => {
          // turn pathname /r/mycommunity/submit into /r/mycommunity
          const newPathname = location.pathname.split('/').slice(0, -1).join('/');
          navigate(newPathname);
          queryClient.invalidateQueries({ queryKey: queryKey});

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
            console.log(Object.entries(errors))
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
        const blocks = await ref.current?.save()
    
        const payload: PostCreationRequest = {
          title: data.title,
          content: blocks,
          subrabbitId,
        }
        createPost(payload)
      }

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
                  // @ts-expect-error Ignoring TypeScript error due to manual assignment for special case handling.
                  // This is necessary to directly manipulate the ref in a scenario not typically covered by React's ref handling.
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
