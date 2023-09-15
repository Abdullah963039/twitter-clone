import { api } from "~/utils/api";
import InfintiteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import ProfileImage from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import IconHoverEffect from "./IconHoverEffect";

export default function RecentTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  return (
    <InfiniteTweetList
      tweets={tweets?.data?.pages.flatMap((page) => page.tweets)}
      isLoading={tweets.isLoading}
      isError={tweets.isError}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

type InfiniteTweetListProps = {
  tweets?: Tweet[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewTweets: () => Promise<unknown>;
};

type Tweet = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
};

function InfiniteTweetList({
  tweets,
  fetchNewTweets,
  hasMore,
  isError,
  isLoading,
}: InfiniteTweetListProps) {
  if (isLoading) return <h1>Loading ...</h1>;
  if (isError) return <h1>Error ...</h1>;
  if (tweets == null || tweets.length == 0) {
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>
    );
  }

  return (
    <ul>
      <InfintiteScroll
        dataLength={tweets.length}
        next={fetchNewTweets}
        hasMore={hasMore}
        loader={"Loading"}
      >
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </InfintiteScroll>
    </ul>
  );
}

const dateTimeFormatter = Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

function TweetCard({ tweet }: { tweet: Tweet }) {
  const { id, content, createdAt, likeCount, likedByMe, user } = tweet;

  const toggleLike = api.tweet.toggleLike.useMutation({});

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  return (
    <li className="flex gap-4 border-b p-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {user.name}
          </Link>

          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>

        <p className="whitespace-pre-wrap">{content}</p>

        <HeartButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={likedByMe}
          likedCount={likeCount}
        />
      </div>
    </li>
  );
}

type HeartButtonProps = {
  likedByMe: boolean;
  likedCount: number;
  onClick: () => void;
  isLoading: boolean;
};

function HeartButton({
  likedByMe,
  likedCount,
  isLoading,
  onClick,
}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated")
    return (
      <div className="my-1 flex items-center gap-3 self-start text-gray-500 ">
        <HeartIcon />
        <span>{likedCount}</span>
      </div>
    );

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${
            likedByMe
              ? "fill-red-500 "
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{likedCount}</span>
    </button>
  );
}
