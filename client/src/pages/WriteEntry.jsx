import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDebouncedCallback } from 'use-debounce';
import { getEntry, createEntry, updateEntry } from '../api/entryAPI';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { LuImage, LuX, LuMic, LuMicOff } from 'react-icons/lu';

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
    const entryIdRef = useRef(id || null);
    const [lastSaved, setLastSaved] = useState(null);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const handleRemoveImage = async (indexToRemove) => {
        const newImages = existingImages.filter((_, idx) => idx !== indexToRemove);
        setExistingImages(newImages);

        setSaving(true);
        try {
            if (entryIdRef.current) {
                await updateEntry(entryIdRef.current, {
                    title,
                    text: editor?.getHTML() || '<p></p>',
                    existingImages: newImages
                });
                setLastSaved(new Date());
            }
        } catch (err) {
            toast.error('Failed to update images');
        } finally {
            setSaving(false);
        }
    };

    const handleImageSelection = async (e) => {
        const files = Array.from(e.target.files);
        if (existingImages.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
        if (validFiles.length < files.length) toast.error('Some images were skipped (over 5MB)');

        if (validFiles.length === 0) return;

        const previews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('text', editor?.getHTML() || '<p></p>');
            formData.append('existingImages', JSON.stringify(existingImages));
            validFiles.forEach(img => formData.append('images', img));

            let currentId = entryIdRef.current;
            let result;
            if (currentId) {
                const res = await updateEntry(currentId, formData);
                result = res.data;
            } else {
                const res = await createEntry(formData);
                currentId = res.data._id;
                entryIdRef.current = currentId;
                setEntryId(currentId);
                result = res.data;
            }

            setExistingImages(result.images || []);
            setLastSaved(new Date());
            toast.success('Images uploaded securely');
        } catch (err) {
            console.error('Image upload failed', err);
            toast.error('Image upload failed');
        } finally {
            setSaving(false);
            setImagePreviews([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const autosave = useDebouncedCallback(async (content) => {
        if (!content || content === '<p></p>') return;
        setSaving(true);
        try {
            if (entryIdRef.current) {
                await updateEntry(entryIdRef.current, { title, text: content, existingImages });
            } else {
                const res = await createEntry({ title, text: content, existingImages });
                entryIdRef.current = res.data._id;
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
        if (!editor) return;

        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => setIsListening(true);

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    console.log('Transcribed:', finalTranscript);
                    editor.chain().focus().insertContent(finalTranscript.trim() + ' ').run();
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied');
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
        };
    }, [editor]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
                toast.success('Listening... Speak now');
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        if (id) {
            const fetchEntry = async () => {
                try {
                    const res = await getEntry(id);
                    setTitle(res.data.title);
                    entryIdRef.current = id;
                    setEntryId(id);
                    setExistingImages(res.data.images || []);
                    editor?.commands.setContent(res.data.text);
                } catch (err) {
                    toast.error('Failed to load entry', err)
                }
            }
            fetchEntry()
        }
    }, [id, editor])

    const handleSaveAndAnalyze = async () => {
        const content = editor?.getHTML();
        if (!content || content === '<p></p>') {
            toast.error('Write something before saving!');
            return;
        }
        setSubmitting(true);
        try {
            let currentId = entryIdRef.current;
            if (currentId) {
                await updateEntry(currentId, { title, text: content, existingImages });
            } else {
                const res = await createEntry({ title, text: content, existingImages });
                currentId = res.data._id;
                entryIdRef.current = currentId;
                setEntryId(currentId);
            }
            toast.success('Entry saved!');
            navigate(`/entry/${currentId}`);
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

            <div className="bg-base-100 rounded-2xl border border-base-content/10 flex flex-col">

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
                    <div className="divider divider-horizontal mx-0"></div>
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`btn btn-md rounded-lg font-data gap-2 ${isListening ? 'btn-error text-white animate-pulse' : 'btn-ghost text-neutral/70'}`}
                        title="Voice typing"
                    >
                        {isListening ? <LuMic size={18} /> : <LuMicOff size={18} />}
                        <span className="hidden sm:inline">{isListening ? 'Listening' : 'Dictate'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-md btn-ghost rounded-lg font-data gap-2 text-neutral/70"
                    >
                        <LuImage size={18} /> Add Images
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleImageSelection}
                        className="hidden"
                    />
                </div>

                {/* Editor */}
                <div className="p-4 text-neutral min-h-[150px]">
                    <EditorContent editor={editor} />
                </div>

                {/* Bottom Images Gallery */}
                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div className="p-4 border-t border-base-content/10 bg-base-200/20 rounded-b-2xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {existingImages.map((imgUrl, i) => (
                                <div
                                    key={`existing-${i}`}
                                    className="relative aspect-[4/3] group cursor-zoom-in"
                                    onClick={() => setSelectedImage(imgUrl)}
                                >
                                    <img src={imgUrl} alt="uploaded" className="h-full w-full object-cover rounded-xl border border-base-content/10 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }}
                                        className="absolute top-2 right-2 bg-base-100 rounded-full p-2 shadow-md border border-base-content/10 hover:bg-error hover:text-white transition-colors"
                                    ><LuX size={14} /></button>
                                </div>
                            ))}
                            {imagePreviews.map((previewUrl, i) => (
                                <div key={`new-${i}`} className="relative aspect-[4/3] group opacity-60 flex items-center justify-center bg-base-200 rounded-xl border border-base-content/10">
                                    <img src={previewUrl} alt="preview" className="absolute inset-0 h-full w-full object-cover rounded-xl mix-blend-overlay" />
                                    <span className="loading loading-spinner text-primary z-10" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Image Maximize Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out backdrop-blur-sm transition-opacity"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Enlarged"
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                    <button
                        className="absolute top-6 right-6 btn btn-circle btn-ghost text-white"
                        onClick={() => setSelectedImage(null)}
                    >
                        <LuX size={24} />
                    </button>
                </div>
            )}
        </div>
    )
}

export default WriteEntry;