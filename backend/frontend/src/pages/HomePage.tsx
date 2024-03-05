import { useQuery } from 'react-query';

interface Rabbit {
  id: string,
  name: string
}

function HomePage() {
  const { isLoading, data } = useQuery<Rabbit[]>('subrabbits', () =>
    fetch('/api/subrabbits/').then(res =>
      res.json()
    )
  );

  // if (error) return 'An error has occurred: ' + error.message;
  
  return (
    <>
      <div className='mt-10'>
        {isLoading ? 'Loading...' : (
          <>
            {data?.map((rabbit: Rabbit) => (
              <h1 key={rabbit.id}>{rabbit.name}</h1>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default HomePage;
