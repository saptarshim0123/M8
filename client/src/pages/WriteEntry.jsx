import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDebouncedCallback } from 'use-debounce';
import { getEntry, createEntry, updateEntry } from '../api/entryAPI';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const ToolbarButton = ({ onClick, isActive, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`btn btn-md rounded-lg font-data ${isActive ? 'btn-primary' : 'btn-ghost'}`}
    >
        {label}
    </button>
)

const WriteEntry = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [title, setTitle] = useState('');
    const [entryId, setEntryId] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const autosave = useDebouncedCallback(async (content) => {
        if (!content || content === '<p></p>') return;
        setSaving(true);
        try {
            if (entryId) {
                await updateEntry(entryId, { title, text: content });
            } else {
                const res = await createEntry({ title, text: content });
                setEntryId(res.data._id);
            }
            setLastSaved(new Date());
        } catch (err) {
            console.error('Autosave failed', err);
        } finally {
            setSaving(false);
        }
    }, 2000);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write anything on your mind...',
            }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            autosave(editor.getHTML());
        }
    });

    useEffect(() => {
        if (id) {
            const fetchEntry = async () => {
                try {
                    const res = await getEntry(id);
                    setTitle(res.data.title);
                    setEntryId(id);
                    editor?.commands.setContent(res.data.text);
                } catch (err) {
                    toast.error('Failed to load entry', err)
                }
            }
            fetchEntry()
        }
    }, [id, editor])

    const handleSaveAndAnalyze = async () => {
        // TODO: Move navigate path to analyze
        const content = editor?.getHTML();
        if (!content || content === '<p></p>') {
            toast.error('Write something before saving!');
            return;
        }
        setSubmitting(true);
        try {
            let id = entryId;
            if (id) {
                await updateEntry(entryId, { title, text: content });
            } else {
                const res = await createEntry({ title, text: content });
                id = res.data._id;
                setEntryId(id);
            }
            toast.success('Entry saved!');
            navigate(`/analyze/${id}`);
        } catch (err) {
            toast.error('Failed to save entry', err)
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full px-6 py-6">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-ghost gap-2"
                >
                    ← Back
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-data text-neutral/40">
                        {saving && <span className="loading loading-spinner loading-xs mr-1" />}
                        {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Unsaved'}
                    </span>
                    <button
                        onClick={handleSaveAndAnalyze}
                        disabled={submitting}
                        className="btn btn-primary  font-sans"
                    >
                        {submitting
                            ? <span className="loading loading-spinner loading-xs" />
                            : 'Save & Analyze →'
                        }
                    </button>
                </div>
            </div>

            <input
                type="text"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    autosave(editor?.getHTML());
                }}
                placeholder="Give your entry a title..."
                className="font-heading text-2xl font-bold bg-transparent border-none outline-none w-full mb-4 placeholder:text-neutral/30"
            />

            <div className="bg-base-100 rounded-2xl border border-base-content/10 ">

                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-3 border-b border-base-content/10">
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        isActive={editor?.isActive('bold')}
                        label="B"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor?.isActive('italic')}
                        label="I"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor?.isActive('heading', { level: 1 })}
                        label="H1"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor?.isActive('heading', { level: 2 })}
                        label="H2"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor?.isActive('bulletList')}
                        label="• List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor?.isActive('orderedList')}
                        label="1. List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor?.isActive('blockquote')}
                        label="❝"
                    />
                </div>

                {/* Editor */}
                <div className="p-4 text-neutral">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}

export default WriteEntry;