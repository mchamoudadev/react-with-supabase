import { useImperativeHandle, useCallback, useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import './quill.snow.css';

// Remove forwardRef and accept ref as a regular prop
const QuillEditor = ({ value, onChange, placeholder, className, height = 400, ref }) => {
  // Local state to track editor value
  const [editorValue, setEditorValue] = useState(value || '');
  
  // Update local state when prop value changes
  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);
  
  // Create a memoized onChange handler
  const handleChange = useCallback((value) => {
    setEditorValue(value);
    onChange(value);
  }, [onChange]);
  
  // Set up editor modules
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  // Set up editor formats
  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'code-block'
  ];

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    // Get the editor instance
    getEditor: () => ref.current?.editor,
    
    // Set focus
    focus: () => {
      if (ref.current) {
        ref.current.focus();
      }
    },
    
    // Insert text at current cursor position
    insertText: (text) => {
      const editor = ref.current?.editor;
      if (editor) {
        const range = editor.getSelection();
        if (range) {
          editor.insertText(range.index, text);
        }
      }
    },
    
    // Insert link
    insertLink: (text, url) => {
      const editor = ref.current?.editor;
      if (editor) {
        const range = editor.getSelection();
        if (range) {
          editor.insertText(range.index, text, 'link', url);
        }
      }
    }
  }));

  return (
    <div className={className || ''} style={{ height: `${height}px` }}>
      <ReactQuill
        ref={ref}
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your content...'}
        theme="snow"
        style={{ height: `${height - 42}px` }}
      />
    </div>
  );
};

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;