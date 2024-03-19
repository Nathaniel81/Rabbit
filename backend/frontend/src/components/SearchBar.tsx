import { Icons } from '@/components/Icons';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { debounce } from 'lodash';
import { Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/Input';
import { Subrabbit } from '@/types/subrabbit';


const SearchBar = () => {
  const [input, setInput] = useState<string>('')
  const navigate = useNavigate()
  const commandRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(commandRef, () => {
    setInput('')
  })

  const request = debounce(async () => {
    refetch()
  }, 300)

  const debounceRequest = useCallback(() => {
    request()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    isFetching,
    data: queryResults,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return []
      const { data } = await axios.get(`/api/search?q=${input}`)
      return data
    },
    queryKey: ['search-query'],
    enabled: false,
  })

  return (
    <div ref={commandRef} className='relative rounded-lg border max-w-full z-50 overflow-visible'>
      <Input
        onChange={(e) => {
          setInput(e.target.value)
          debounceRequest()
        }}
        value={input}
        className='w-[400px] pl-6'
        placeholder='Search communities...'
      />
      
      {input.length > 0 && (
        <div className='absolute bg-white top-full inset-x-0 shadow rounded-b-md border-t border-gray-300 w-full max-h-48 overflow-hidden'>
          <div className='p-2 flex items-center justify-between border-b border-gray-300'>
            <span className='text-sm font-bold'>Communities</span>
            {isFetching && <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />}
          </div>
          <div className='text-sm'>
            {isFetched && !isFetching && (queryResults?.results?.length === 0) && <div className='p-2'>No results found.</div>}
            {(queryResults?.results?.length ?? 0) > 0 && (
              <>
                {queryResults?.results?.map((subrabbit: Subrabbit, index: number) => (
                  <div
                  onClick={() => {
                    setInput('');
                    navigate(`/r/${subrabbit.name}`);
                  }}
                    key={index}
                    className='flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100'>
                    {<Icons.users className='h-4 w-4 mr-2' />}
                    <div className='text-sm'>
                      r/{subrabbit.name}
                    </div>
                  </div>
                ))}
                <div className='border-t border-gray-300'></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
