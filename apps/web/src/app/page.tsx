import { useViolet } from "sdk";

const Page = () => {
  const {} = useViolet();

  return (
    <main className="flex h-screen justify-center items-center">
      {
        <div className="h-36 w-36">
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              // fill="#9a4cff"
              fill="none"
              stroke="#9a4cff"
              stroke-width="4"
            />
          </svg>
        </div>
      }
    </main>
  );
};

export default Page;
