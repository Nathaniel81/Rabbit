import { Loader2 } from "lucide-react";


const Loader = () => {
    return (
      <div className="flex items-center w-full justify-center col-span-2 mx-auto">
        <Loader2 className='h-15 w-15 animate-spin text-zinc-500' />
      </div>
    )
  }

export default Loader;
