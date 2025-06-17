import { Button } from "@/components/ui/button";
import ROUTES from "@/constant/routes";
import Link from "next/link";

const Home = async () => {
  return (
    <>
      <section className="w-full flex flex-col-reverse sm:flex-row justify-between gap-4 items-center">
        <h1 className="h1-bold text-dark-100_light900">All Question</h1>
        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">Local search</section>
      HomeFilter
      <div className="mt-10 flex w-full flex-col gap-6">
        <p>Questoion Card 1</p>
        <p>Questoion Card 2</p>
        <p>Questoion Card 3</p>
        <p>Questoion Card 4</p>
      </div>
    </>
  );
};

export default Home;
