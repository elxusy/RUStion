import React, { useState } from 'react';
import Link from 'next/link';

type Document = {
  id: string;
  title: string;
};

type DocumentListProps = {
  documents: Document[];
};

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Link
          key={doc.id}
          href={`/doc/${doc.id}`}
          className="block hover:text-white text-zinc-300"
        >
          {doc.title}
        </Link>
      ))}
    </div>
  );
};


export default DocumentList;