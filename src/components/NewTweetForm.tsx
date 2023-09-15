import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import {
  FormEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { api } from "~/utils/api";

export default function NewTweetForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;

  return <Form />;
}

function updateTextAreaSize(textarea: HTMLTextAreaElement) {
  if (!textarea) return;

  textarea.style.height = "0";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function Form() {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>();

  const inputRef = useCallback((textarea: HTMLTextAreaElement) => {
    updateTextAreaSize(textarea);
    textareaRef.current = textarea;
  }, []);

  const session = useSession();

  useLayoutEffect(() => {
    updateTextAreaSize(textareaRef.current);
  }, [inputValue]);

  const createNewTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      console.log(newTweet);
      setInputValue("");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    createNewTweet.mutate({ content: inputValue });
  }

  if (session.status !== "authenticated") return null;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-b px-4 py-2"
      >
        <div className="flex gap-4">
          <ProfileImage src={session.data.user.image} />
          <textarea
            ref={inputRef}
            className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
            placeholder="What's happening"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              height: 0,
            }}
          />
        </div>
        <Button className="self-end">Tweet</Button>
      </form>
    </>
  );
}
