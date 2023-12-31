import NewTweetForm from "~/components/NewTweetForm";
import RecentTweets from "~/components/RecentTweets";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h2 className="mb-2 px-4 text-lg font-bold">Home</h2>
      </header>

      <NewTweetForm />
      <RecentTweets />
    </>
  );
}
