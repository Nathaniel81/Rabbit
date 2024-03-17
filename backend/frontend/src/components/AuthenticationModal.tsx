import { Button } from '@/components/ui/Button'
import { Icons } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { openModal } from '@/redux/slices/modalSlice'
import { closeModal } from '@/redux/slices/modalSlice'
import { useDispatch } from 'react-redux'
import { RootState } from '@/redux/rootReducer'


const AuthenticationModal: FC = () => {
    const isLoading = false;
    const modalState = useSelector((state: RootState) => state.modal);
    const { isOpen, modalType } = modalState;
    const dispatch = useDispatch();

    const hideModal = () => {
        dispatch(closeModal());
    }
    const openSignUp = (type: string) => {
        dispatch(openModal(type));
    }
    const handleLoginWithGithub = () => {
        window.location.assign(`https://github.com/login/oauth/authorize/?client_id=5dcc33b0caf89cf4435d&scope=user:email`)
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className='fixed inset-0 bg-zinc-900/20 z-10'>
            <div className='container flex items-center h-full max-w-lg mx-auto'>
                <div className='relative bg-white w-full h-fit py-20 px-2 rounded-lg'>
                    <div className='absolute top-4 right-4'>
                        <Button variant='subtle' className='h-6 w-6 p-0 rounded-md' onClick={hideModal}>
                            <X aria-label='close modal' className='h-4 w-4' />
                        </Button>
                    </div>
                    
                    <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
                        <div className='flex flex-col space-y-2 text-center'>
                            <Icons.logo className='mx-auto h-10 w-10' />

                            {modalType === 'signin' ? (
                                  <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
                                ) : (
                                  <h1 className='text-2xl font-semibold tracking-tight'>Sign Up</h1>
                                )}
                            <p className='text-sm max-w-xs mx-auto'>
                                By continuing, you are setting up a Rabbit account and agree to our
                                User Agreement and Privacy Policy.
                            </p>
                        </div>
                        <div className={cn('flex justify-center')}>
                            <Button
                                isLoading={isLoading}
                                type='button'
                                size='sm'
                                className='w-full'
                                onClick={handleLoginWithGithub}
                                disabled={isLoading}>
                                {isLoading ? null : <Icons.github className='h-4 w-4 mr-2' />}
                                Github
                            </Button>
                        </div>
                        {modalType === 'signin' ? (
                            <p className='px-8 text-center text-sm text-muted-foreground'>
                                New to Rabbit?{' '}
                                <span
                                    className='hover:text-brand cursor-pointer text-sm underline underline-offset-4'
                                    onClick={() => openSignUp('signup')}
                                    >
                                    Sign Up
                                </span>
                            </p>
                            ) : (
                            <p className='px-8 text-center text-sm text-muted-foreground'>
                              Already a Rabittor?{' '}
                              <span
                                className='hover:text-brand text-sm cursor-pointer underline underline-offset-4'
                                onClick={() => openSignUp('signin')}
                                >
                                Sign in
                              </span>
                            </p>
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthenticationModal;
