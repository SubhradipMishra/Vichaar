import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined, 
  StrikethroughOutlined,
  UnorderedListOutlined, 
  OrderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons'

const MenuBar = ({ editor }) => {
  if (!editor) return null

  const items = [
    { icon: <BoldOutlined />, action: () => editor.chain().focus().toggleBold().run(), active: 'bold', title: 'Bold' },
    { icon: <ItalicOutlined />, action: () => editor.chain().focus().toggleItalic().run(), active: 'italic', title: 'Italic' },
    { icon: <UnderlineOutlined />, action: () => editor.chain().focus().toggleUnderline().run(), active: 'underline', title: 'Underline' },
    { icon: <StrikethroughOutlined />, action: () => editor.chain().focus().toggleStrike().run(), active: 'strike', title: 'Strike' },
    { type: 'divider' },
    { icon: <UnorderedListOutlined />, action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList', title: 'Bullet List' },
    { icon: <OrderedListOutlined />, action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList', title: 'Ordered List' },
    { type: 'divider' },
    { icon: <UndoOutlined />, action: () => editor.chain().focus().undo().run(), title: 'Undo' },
    { icon: <RedoOutlined />, action: () => editor.chain().focus().redo().run(), title: 'Redo' },
  ]

  return (
    <div className="flex items-center gap-1 p-2 bg-white border border-purple-50 rounded-2xl mb-4 sticky top-0 z-10 shadow-sm overflow-x-auto no-scrollbar">
      {items.map((item, i) => (
        item.type === 'divider' ? (
          <div key={i} className="w-px h-5 bg-gray-100 mx-1" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            title={item.title}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${
              editor.isActive(item.active) ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-400 hover:bg-purple-50 hover:text-primary-600'
            }`}
          >
            {item.icon}
          </button>
        )
      ))}
    </div>
  )
}

const extensions = [
  StarterKit,
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
  Placeholder.configure({
    placeholder: 'The universe is waiting for your story... Start writing here ✨',
  }),
]

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] text-gray-700 leading-relaxed',
      },
    },
  })

  return (
    <div className="tiptap-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
            outline: none !important;
        }
        .tiptap-container .ProseMirror p {
            margin-bottom: 1.5rem;
        }
        .tiptap-container .ProseMirror h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 2rem; color: #111827; }
        .tiptap-container .ProseMirror h2 { font-size: 1.5rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #111827; }
        .tiptap-container .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .tiptap-container .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
      `}</style>
    </div>
  )
}
