'use client';

import Editor from 'react-simple-wysiwyg';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    return (
        <Editor
            value={value}
            onChange={(e) => onChange(e.target.value)}
            containerProps={{
                style: {
                    resize: 'vertical',
                    height: '100%',
                    minHeight: '400px',
                    border: 'none',
                }
            }}
        />
    );
}
