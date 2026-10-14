import { useState } from 'react';
import { XIcon, PlusIcon } from './Icons';
import Button from './Button';

export default function TagInput({
    selectedTags = [], // [tagId, ...]
    onChange,          // (tagIds) => ...
    allTags = [],      // [{ id, name }, ...]
    onAddNewTag,       // (tagName) => Promise/void
    label = 'Tags',
    optional = true,
}) {
    const [newTagName, setNewTagName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleTag = (id) => {
        const has = selectedTags.includes(id);
        const next = has ? selectedTags.filter((x) => x !== id) : [...selectedTags, id];
        onChange?.(next);
    };

    const handleAdd = async () => {
        if (!newTagName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onAddNewTag?.(newTagName.trim());
            setNewTagName('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedTagObjects = allTags.filter((t) => selectedTags.includes(t.id));
    const unselectedTagObjects = allTags.filter((t) => !selectedTags.includes(t.id));

    return (
        <div className="form-group">
            <div className="form-label">
                <span>{label}</span>
                {optional && <span className="form-label-optional">Select or add</span>}
            </div>

            {/* Selected Tags Chips with 'x' */}
            {selectedTagObjects.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {selectedTagObjects.map((t) => (
                        <span
                            key={t.id}
                            className="badge"
                            style={{
                                backgroundColor: 'var(--choc-700)',
                                color: 'var(--surface)',
                                borderColor: 'var(--choc-700)',
                                padding: '4px 8px 4px 10px',
                            }}
                        >
                            <span>#{t.name}</span>
                            <button
                                type="button"
                                onClick={() => toggleTag(t.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--surface)',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '1px',
                                    marginLeft: '2px',
                                }}
                                aria-label={`Remove tag ${t.name}`}
                            >
                                <XIcon size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Suggested Tags (Unselected) */}
            {unselectedTagObjects.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {unselectedTagObjects.map((t) => (
                        <button
                            type="button"
                            key={t.id}
                            onClick={() => toggleTag(t.id)}
                            className="badge"
                            style={{
                                backgroundColor: 'var(--surface)',
                                cursor: 'pointer',
                                transition: 'all 150ms ease-out',
                            }}
                        >
                            <PlusIcon size={10} style={{ color: 'var(--muted)' }} />
                            <span>#{t.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* New tag input */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Create a new tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    className="form-input"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13.5px' }}
                />
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAdd}
                    disabled={!newTagName.trim() || isSubmitting}
                    loading={isSubmitting}
                >
                    Add tag
                </Button>
            </div>
        </div>
    );
}
