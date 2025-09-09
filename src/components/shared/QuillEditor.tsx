
'use client';

import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    isLoading: boolean;
}

export default function QuillEditor({ value, onChange, isLoading }: QuillEditorProps) {
    if (isLoading) {
        return null; // Or a skeleton loader
    }
    
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            className="h-full"
            modules={{
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link'],
                    ['clean']
                ],
            }}
        />
    );
}
