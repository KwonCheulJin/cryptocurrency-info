import { SAVED_TICKER_LIST_KEY } from '@/domains/home';
import { api_removeTicker, api_saveTicker } from '@/domains/home/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ComponentProps, MouseEventHandler } from 'react';

interface Props extends ComponentProps<'button'> {
  ticker: string;
  is_saved: boolean;
}
export default function Savebutton({
  ticker,
  is_saved,
  onClick,
  ...rest
}: Props) {
  const query_client = useQueryClient();

  const handleSuccess = () => {
    query_client.invalidateQueries({ queryKey: SAVED_TICKER_LIST_KEY });
  };

  const handleError = (error: Error) => {
    console.log(error);
    alert('저장에 실패했습니다.');
  };

  const { mutate: save } = useMutation({
    mutationFn: async () => api_saveTicker(ticker),
    onSuccess: handleSuccess,
    onError: handleError,
  });
  const { mutate: remove } = useMutation({
    mutationFn: async () => api_removeTicker(ticker),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const handleClick: MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    is_saved ? remove() : save();
    onClick?.(e);
  };
  return (
    <button {...rest} onClick={handleClick}>
      <Image
        width={24}
        height={24}
        src={`/${is_saved ? 'star_filled' : 'star_outlined'}.svg`}
        alt={is_saved ? '저장됨' : '저장안됨'}
      />
    </button>
  );
}
