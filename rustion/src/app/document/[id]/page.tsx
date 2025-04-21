'use client';

import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const { id } = use(params);
  const utils = api.useUtils();

  const { data: document, isLoading } = api.document.getById.useQuery({ id });
  const updateDocument = api.document.update.useMutation({
    onMutate: async (newData) => {
      await utils.document.getById.cancel({ id });
      const previousData = utils.document.getById.getData({ id });

      utils.document.getById.setData({ id }, (old) => {
        if (!old) return null;
        return {
          ...old,
          title: newData.title ?? old.title,
          content: newData.content ?? old.content,
        };
      });

      return { previousData };
    },
    onError: (err, newData, context) => {
      if (context?.previousData) {
        utils.document.getById.setData({ id }, context.previousData);
      }
    },
    onSettled: () => {
      void utils.document.getById.invalidate({ id });
      void utils.document.getAll.invalidate();
    },
  });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content ?? '');
    }
  }, [document]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    updateDocument.mutate({ id, title });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleContentBlur = () => {
    updateDocument.mutate({ id, content });
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!document) {
    return <div>Документ не найден</div>;
  }

  return (
    <div className="p-6">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        className="text-3xl font-bold bg-transparent border-none outline-none w-full mb-4"
        placeholder="Название документа"
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        onBlur={handleContentBlur}
        className="w-full h-full bg-transparent border-none outline-none resize-none"
        placeholder="Начните писать здесь..."
      />
    </div>
  );
} 