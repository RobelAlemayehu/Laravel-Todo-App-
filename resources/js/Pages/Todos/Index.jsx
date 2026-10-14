import { useState, useMemo, useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import Button from '../../Components/Button';
import { Input, Textarea } from '../../Components/Input';
import DatePicker from '../../Components/DatePicker';
import Select from '../../Components/Select';
import TagInput from '../../Components/TagInput';
import Checkbox from '../../Components/Checkbox';
import Badge from '../../Components/Badge';
import Card from '../../Components/Card';
import Modal from '../../Components/Modal';
import BottomSheet from '../../Components/BottomSheet';
import EmptyState from '../../Components/EmptyState';
import Avatar from '../../Components/Avatar';
import ProgressBar from '../../Components/ProgressBar';
import SegmentedControl from '../../Components/SegmentedControl';
import { useConfirm } from '../../Components/ConfirmDialog';
import { useToast, ToastContainer } from '../../Components/Toast';
import Pagination from '../../Components/Pagination';
import {
    LogoMark,
    PlusIcon,
    TrashIcon,
    CalendarIcon,
    FolderIcon,
    LogOutIcon,
    SearchIcon,
    EditIcon,
    ClockIcon,
} from '../../Components/Icons';

const CATEGORY_COLORS = [
    '#B7794A', // Caramel
    '#5F7A3A', // Olive green
    '#B7791F', // Amber
    '#7A5239', // Warm brown
    '#A33A2B', // Terracotta
    '#6B8E23', // Olive
    '#8B5A2B', // Chocolate
];

function getCategoryColor(index) {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

// Relative due date helper
function getDueStatus(dueStr, isCompleted) {
    if (!dueStr) return null;
    const parts = dueStr.split('-');
    if (parts.length !== 3) return { text: dueStr, variant: 'default', status: 'neutral' };
    const due = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (isCompleted) {
        return {
            text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            variant: 'default',
            status: 'done',
        };
    }

    if (diffDays < 0) {
        const days = Math.abs(diffDays);
        return {
            text: days === 1 ? '1 day overdue' : `${days} days overdue`,
            variant: 'overdue',
            status: 'overdue',
        };
    }
    if (diffDays === 0) return { text: 'Today', variant: 'due-soon', status: 'due-soon' };
    if (diffDays === 1) return { text: 'Tomorrow', variant: 'due-soon', status: 'due-soon' };
    if (diffDays <= 7) return { text: `In ${diffDays} days`, variant: 'due-soon', status: 'due-soon' };
    return {
        text: `In ${diffDays} days`,
        variant: 'default',
        status: 'neutral',
    };
}

// Todo Form Modal / BottomSheet content
function TodoFormModal({
    isOpen,
    onClose,
    todo = null,
    categories = [],
    tags = [],
    onSuccessMessage,
    isMobile = false,
}) {
    const form = useForm({
        title: todo?.title ?? '',
        description: todo?.description ?? '',
        due_date: todo?.due_date ?? '',
        category_id: todo?.category?.id ?? '',
        tags: todo?.tags?.map((t) => t.id) ?? [],
    });

    useEffect(() => {
        if (isOpen) {
            form.setData({
                title: todo?.title ?? '',
                description: todo?.description ?? '',
                due_date: todo?.due_date ?? '',
                category_id: todo?.category?.id ?? '',
                tags: todo?.tags?.map((t) => t.id) ?? [],
            });
            form.clearErrors();
        }
    }, [isOpen, todo]);

    const handleCreateTag = (tagName) => {
        return new Promise((resolve) => {
            router.post(
                '/tags',
                { name: tagName },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        onSuccessMessage?.('Tag created');
                        resolve();
                    },
                    onError: () => resolve(),
                }
            );
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = (data) => ({
            ...data,
            description: data.description || null,
            due_date: data.due_date || null,
            category_id: data.category_id || null,
        });
        form.transform(payload);
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
                onSuccessMessage?.(todo ? 'Todo updated' : 'Todo created');
            },
        };
        if (todo) form.put(`/todos/${todo.id}`, options);
        else form.post('/todos', options);
    };

    const categoryOptions = [
        { value: '', label: 'None' },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];

    const content = (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
                label="Title"
                placeholder="What needs to be done?"
                value={form.data.title}
                onChange={(e) => form.setData('title', e.target.value)}
                error={form.errors.title}
                autoFocus
            />

            <Textarea
                label="Description"
                optional
                placeholder="Add notes, details, or steps..."
                value={form.data.description}
                onChange={(e) => form.setData('description', e.target.value)}
                error={form.errors.description}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <DatePicker
                    label="Due date"
                    optional
                    value={form.data.due_date}
                    onChange={(val) => form.setData('due_date', val)}
                    error={form.errors.due_date}
                />

                <Select
                    label="Category"
                    optional
                    value={form.data.category_id}
                    onChange={(val) => form.setData('category_id', val)}
                    options={categoryOptions}
                    error={form.errors.category_id}
                />
            </div>

            <TagInput
                selectedTags={form.data.tags}
                onChange={(newTags) => form.setData('tags', newTags)}
                allTags={tags}
                onAddNewTag={handleCreateTag}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" loading={form.processing} disabled={form.processing}>
                    {todo ? 'Save changes' : 'Add todo'}
                </Button>
            </div>
        </form>
    );

    if (isMobile) {
        return (
            <BottomSheet isOpen={isOpen} onClose={onClose} title={todo ? 'Edit todo' : 'New todo'}>
                {content}
            </BottomSheet>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={todo ? 'Edit todo' : 'New todo'}>
            {content}
        </Modal>
    );
}

// Sidebar Categories and Tags View
function SidebarView({
    categories = [],
    tags = [],
    activeCategory = null,
    onSelectCategory,
    onDeleteCategory,
    onAddCategory,
    onAddTag,
}) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [isSubmittingCat, setIsSubmittingCat] = useState(false);
    const [isSubmittingTag, setIsSubmittingTag] = useState(false);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim() || isSubmittingCat) return;
        setIsSubmittingCat(true);
        try {
            await onAddCategory(newCategoryName.trim());
            setNewCategoryName('');
        } finally {
            setIsSubmittingCat(false);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        if (!newTagName.trim() || isSubmittingTag) return;
        setIsSubmittingTag(true);
        try {
            await onAddTag(newTagName.trim());
            setNewTagName('');
        } finally {
            setIsSubmittingTag(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Categories Card */}
            <div className="sidebar-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="sidebar-label">CATEGORIES</span>
                    {activeCategory !== null && (
                        <button
                            type="button"
                            onClick={() => onSelectCategory(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--caramel)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Clear filter
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {categories.length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--muted)', padding: '6px 0' }}>
                            No categories yet
                        </div>
                    ) : (
                        categories.map((c, idx) => {
                            const isSelected = activeCategory === c.id;
                            const dotColor = getCategoryColor(idx);
                            return (
                                <div
                                    key={c.id}
                                    className={`sidebar-category-item ${isSelected ? 'active' : ''}`}
                                    onClick={() => onSelectCategory(isSelected ? null : c.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                                        <span className="category-dot" style={{ backgroundColor: dotColor }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {c.name}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                            {c.todos_count}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-danger-ghost btn-icon-only"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteCategory(c);
                                            }}
                                            title={`Delete category ${c.name}`}
                                            aria-label={`Delete category ${c.name}`}
                                            style={{ width: '26px', height: '26px', padding: '5px' }}
                                        >
                                            <TrashIcon size={12} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Quick Add Category */}
                <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <input
                        type="text"
                        placeholder="New category..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="form-input"
                        style={{ padding: '7px 10px', fontSize: '13px' }}
                    />
                    <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        disabled={!newCategoryName.trim() || isSubmittingCat}
                        loading={isSubmittingCat}
                    >
                        Add
                    </Button>
                </form>
            </div>

            {/* Tags Card */}
            <div className="sidebar-card">
                <span className="sidebar-label">TAGS</span>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {tags.length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--muted)', padding: '6px 0' }}>
                            No tags yet
                        </div>
                    ) : (
                        tags.map((t) => (
                            <span key={t.id} className="badge">
                                #{t.name}
                            </span>
                        ))
                    )}
                </div>

                {/* Quick Add Tag */}
                <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input
                        type="text"
                        placeholder="New tag..."
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="form-input"
                        style={{ padding: '7px 10px', fontSize: '13px' }}
                    />
                    <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        disabled={!newTagName.trim() || isSubmittingTag}
                        loading={isSubmittingTag}
                    >
                        Add
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function Index({ todos, categories, tags, filters }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { toasts, showToast, dismissToast } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    const categoryList = categories.data || [];
    const tagList = tags.data || [];

    // Track mobile viewport
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Filter status key
    const currentStatus =
        filters.completed === undefined || filters.completed === null
            ? 'all'
            : filters.completed === '1' || filters.completed === 'true'
            ? 'done'
            : 'active';

    const activeCategory = filters.category_id ? Number(filters.category_id) : null;

    // Filter counts fix: maintain last-known true totals across tabs
    const [knownTotals, setKnownTotals] = useState(() => {
        const active = todos.data.filter((t) => !t.is_completed).length;
        const done = todos.data.filter((t) => t.is_completed).length;
        return {
            total: todos.data.length,
            active,
            done,
        };
    });

    useEffect(() => {
        if (filters.completed === undefined || filters.completed === null) {
            const active = todos.data.filter((t) => !t.is_completed).length;
            const done = todos.data.filter((t) => t.is_completed).length;
            setKnownTotals({
                total: todos.data.length,
                active,
                done,
            });
        } else if (filters.completed === '0') {
            setKnownTotals((prev) => ({
                ...prev,
                active: todos.data.length,
                total: todos.data.length + prev.done,
            }));
        } else if (filters.completed === '1' || filters.completed === 'true') {
            setKnownTotals((prev) => ({
                ...prev,
                done: todos.data.length,
                total: prev.active + todos.data.length,
            }));
        }
    }, [todos.data, filters.completed]);

    const activeCount = knownTotals.active;
    const doneCount = knownTotals.done;
    const totalCount = knownTotals.total || (activeCount + doneCount);
    const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

    // Greeting based on user local time
    const greetingText = useMemo(() => {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        return `${timeOfDay}, ${auth.user?.name || 'Rovel'}`;
    }, [auth.user?.name]);

    // Handle filter route change
    const applyFilter = (changes) => {
        const next = { ...filters, ...changes };
        Object.keys(next).forEach((k) => (next[k] === null || next[k] === '') && delete next[k]);
        router.get('/todos', next, { preserveState: true, preserveScroll: true });
    };

    // Toggle todo completed status with Undo support
    const toggle = (t) => {
        const willBeCompleted = !t.is_completed;
        router.put(
            `/todos/${t.id}`,
            { is_completed: willBeCompleted },
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(
                        willBeCompleted ? 'Task marked as completed' : 'Task marked as active',
                        {
                            onUndo: () => {
                                router.put(
                                    `/todos/${t.id}`,
                                    { is_completed: !willBeCompleted },
                                    { preserveScroll: true }
                                );
                            },
                        }
                    );
                },
            }
        );
    };

    // Delete todo with ConfirmDialog
    const removeTodo = (t) => {
        confirm({
            title: 'Delete this todo?',
            message: `Delete "${t.title}"? This can't be undone.`,
            confirmLabel: 'Delete',
            isDestructive: true,
            onConfirm: () =>
                new Promise((resolve) => {
                    router.delete(`/todos/${t.id}`, {
                        preserveScroll: true,
                        onSuccess: () => {
                            showToast('Todo deleted');
                            resolve();
                        },
                        onError: () => resolve(),
                    });
                }),
        });
    };

    // Delete category with ConfirmDialog
    const deleteCategory = (c) => {
        confirm({
            title: 'Delete category?',
            message: `Delete category "${c.name}"? This can't be undone.`,
            confirmLabel: 'Delete',
            isDestructive: true,
            onConfirm: () =>
                new Promise((resolve) => {
                    router.delete(`/categories/${c.id}`, {
                        preserveScroll: true,
                        onSuccess: () => {
                            showToast('Category deleted');
                            resolve();
                        },
                        onError: () => resolve(),
                    });
                }),
        });
    };

    // Add category helper
    const handleAddCategory = (name) => {
        return new Promise((resolve) => {
            router.post(
                '/categories',
                { name },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('Category created');
                        resolve();
                    },
                    onError: () => resolve(),
                }
            );
        });
    };

    // Add tag helper
    const handleAddTag = (name) => {
        return new Promise((resolve) => {
            router.post(
                '/tags',
                { name },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('Tag created');
                        resolve();
                    },
                    onError: () => resolve(),
                }
            );
        });
    };

    // Logout confirmation
    const handleLogout = () => {
        confirm({
            title: 'Log out?',
            message: "You'll need to sign in again to see your todos.",
            confirmLabel: 'Log out',
            isDestructive: false,
            onConfirm: () =>
                new Promise((resolve) => {
                    try {
                        sessionStorage.setItem('toast_message', "You've been signed out");
                    } catch {}
                    router.post(
                        '/logout',
                        {},
                        {
                            onFinish: () => resolve(),
                        }
                    );
                }),
        });
    };

    // Client-side search & status filtering
    const filteredTodos = useMemo(() => {
        let list = todos.data || [];
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            list = list.filter(
                (t) =>
                    t.title.toLowerCase().includes(query) ||
                    (t.description && t.description.toLowerCase().includes(query)) ||
                    (t.category && t.category.name.toLowerCase().includes(query)) ||
                    (t.tags && t.tags.some((tag) => tag.name.toLowerCase().includes(query)))
            );
        }
        return list;
    }, [todos.data, searchTerm]);

    // Grouping: Overdue, Today, Upcoming, No date, Completed
    const groupedTodos = useMemo(() => {
        const groups = {
            overdue: [],
            today: [],
            upcoming: [],
            noDate: [],
            completed: [],
        };

        const now = new Date();
        const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        filteredTodos.forEach((t) => {
            if (t.is_completed) {
                groups.completed.push(t);
                return;
            }
            if (!t.due_date) {
                groups.noDate.push(t);
                return;
            }
            const parts = t.due_date.split('-');
            if (parts.length !== 3) {
                groups.noDate.push(t);
                return;
            }
            const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
            const diffDays = Math.round((dueDate.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) groups.overdue.push(t);
            else if (diffDays === 0) groups.today.push(t);
            else groups.upcoming.push(t);
        });

        return groups;
    }, [filteredTodos]);

    // Segmented tab config
    const segmentedTabs = [
        { key: 'all', label: 'All', count: totalCount },
        { key: 'active', label: 'Active', count: activeCount },
        { key: 'done', label: 'Done', count: doneCount },
    ];

    const renderTodoCard = (t) => {
        const dueInfo = getDueStatus(t.due_date, t.is_completed);
        const statusClass = t.is_completed
            ? 'status-done completed'
            : dueInfo?.status === 'overdue'
            ? 'status-overdue'
            : dueInfo?.status === 'due-soon'
            ? 'status-due-soon'
            : '';

        const catIdx = categoryList.findIndex((c) => c.id === t.category?.id);
        const catDotColor = catIdx >= 0 ? getCategoryColor(catIdx) : '#B7794A';

        return (
            <div key={t.id} className={`todo-card ${statusClass}`}>
                <div className="todo-card-checkbox">
                    <Checkbox
                        checked={Boolean(t.is_completed)}
                        onChange={() => toggle(t)}
                        aria-label={`Mark "${t.title}" as ${t.is_completed ? 'active' : 'completed'}`}
                    />
                </div>

                <div
                    className="todo-card-body"
                    onClick={() => setEditingTodo(t)}
                    title="Click to edit task"
                >
                    <div className={`todo-card-title ${t.is_completed ? 'done' : ''}`}>
                        {t.title}
                    </div>

                    {t.description && (
                        <div className="todo-card-description">
                            {t.description}
                        </div>
                    )}

                    <div className="todo-card-meta">
                        {/* Category */}
                        {t.category && (
                            <Badge dotColor={catDotColor}>
                                {t.category.name}
                            </Badge>
                        )}

                        {/* Due Date */}
                        {dueInfo && (
                            <Badge variant={dueInfo.variant} icon={<CalendarIcon size={12} />}>
                                {dueInfo.text}
                            </Badge>
                        )}

                        {/* Tags */}
                        {t.tags?.map((tag) => (
                            <Badge key={tag.id} variant="tag">
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="todo-card-actions">
                    <button
                        type="button"
                        className="btn btn-ghost btn-icon-only"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingTodo(t);
                        }}
                        title={`Edit "${t.title}"`}
                        aria-label={`Edit "${t.title}"`}
                    >
                        <EditIcon size={14} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger-ghost btn-icon-only"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeTodo(t);
                        }}
                        title={`Delete "${t.title}"`}
                        aria-label={`Delete "${t.title}"`}
                    >
                        <TrashIcon size={14} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="app-shell">
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            {ConfirmDialogComponent}

            {/* Sticky Top Bar */}
            <header className="top-bar">
                <div className="top-bar-inner">
                    <div className="brand-logo-area">
                        <div className="logo-badge">
                            <LogoMark size={20} />
                        </div>
                        <span className="brand-title">
                            {auth.user?.name ? `${auth.user.name}'s todos` : "Rovel's todos"}
                        </span>
                    </div>

                    <div className="top-bar-user">
                        <Avatar name={auth.user?.name} size={34} />
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<LogOutIcon size={14} />}
                            onClick={handleLogout}
                            aria-label="Log out"
                        >
                            Log out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Desktop Two-Column Layout */}
            <main className="layout-container">
                <div className="layout-grid">
                    {/* Main Column */}
                    <div className="main-column">
                        {/* Greeting & Progress Header */}
                        <div className="greeting-header">
                            <h1 className="greeting-title">{greetingText}</h1>
                            <div className="greeting-subtitle">
                                <span>
                                    {activeCount} active · {doneCount} done
                                </span>
                                <span>· {Math.round(progressPercent)}% completed</span>
                            </div>
                            <ProgressBar value={progressPercent} />
                        </div>

                        {/* Actions & Filters Toolbar */}
                        <div className="main-toolbar">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                                <Button
                                    variant="primary"
                                    icon={<PlusIcon size={15} />}
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    New todo
                                </Button>

                                <div className="search-input-wrapper">
                                    <SearchIcon className="search-icon" size={15} />
                                    <input
                                        type="text"
                                        placeholder="Search todos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <SegmentedControl
                                    items={segmentedTabs}
                                    activeKey={currentStatus}
                                    onChange={(key) =>
                                        applyFilter({
                                            completed: key === 'all' ? null : key === 'done' ? '1' : '0',
                                        })
                                    }
                                />

                                {/* Mobile button to open categories/tags sheet */}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={<FolderIcon size={14} />}
                                    className="show-mobile-categories-btn"
                                    style={{ display: isMobile ? 'inline-flex' : 'none' }}
                                    onClick={() => setIsMobileSheetOpen(true)}
                                >
                                    Tags
                                </Button>
                            </div>
                        </div>

                        {/* Active category filter banner */}
                        {activeCategory && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 14px',
                                    backgroundColor: 'var(--surface-2)',
                                    borderRadius: 'var(--radius-input)',
                                    fontSize: '13.5px',
                                    color: 'var(--choc-900)',
                                }}
                            >
                                <span>
                                    Filtered by category:{' '}
                                    <strong>
                                        {categoryList.find((c) => c.id === activeCategory)?.name}
                                    </strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => applyFilter({ category_id: null })}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--caramel)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        )}

                        {/* Todo List or Empty State */}
                        {filteredTodos.length === 0 ? (
                            <EmptyState
                                type={searchTerm ? 'search' : currentStatus}
                                onAction={() => {
                                    if (searchTerm) setSearchTerm('');
                                    else if (currentStatus === 'done') applyFilter({ completed: '0' });
                                    else setIsCreateModalOpen(true);
                                }}
                            />
                        ) : (
                            <div className="todo-list-wrapper">
                                {/* Overdue group */}
                                {groupedTodos.overdue.length > 0 && (
                                    <div>
                                        <div className="todo-group-header" style={{ color: 'var(--danger)' }}>
                                            <ClockIcon size={13} />
                                            <span>OVERDUE ({groupedTodos.overdue.length})</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {groupedTodos.overdue.map(renderTodoCard)}
                                        </div>
                                    </div>
                                )}

                                {/* Today group */}
                                {groupedTodos.today.length > 0 && (
                                    <div>
                                        <div className="todo-group-header" style={{ color: 'var(--due-soon)' }}>
                                            <CalendarIcon size={13} />
                                            <span>TODAY ({groupedTodos.today.length})</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {groupedTodos.today.map(renderTodoCard)}
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming group */}
                                {groupedTodos.upcoming.length > 0 && (
                                    <div>
                                        <div className="todo-group-header">
                                            <span>UPCOMING ({groupedTodos.upcoming.length})</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {groupedTodos.upcoming.map(renderTodoCard)}
                                        </div>
                                    </div>
                                )}

                                {/* No Date group */}
                                {groupedTodos.noDate.length > 0 && (
                                    <div>
                                        <div className="todo-group-header">
                                            <span>NO DATE ({groupedTodos.noDate.length})</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {groupedTodos.noDate.map(renderTodoCard)}
                                        </div>
                                    </div>
                                )}

                                {/* Completed group */}
                                {groupedTodos.completed.length > 0 && (
                                    <div>
                                        <div className="todo-group-header" style={{ color: 'var(--success)' }}>
                                            <span>COMPLETED ({groupedTodos.completed.length})</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {groupedTodos.completed.map(renderTodoCard)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        <Pagination
                            links={todos.meta?.links || todos.links}
                            meta={todos.meta}
                        />
                    </div>

                    {/* Desktop Sidebar Column */}
                    <aside className="sidebar-column">
                        <SidebarView
                            categories={categoryList}
                            tags={tagList}
                            activeCategory={activeCategory}
                            onSelectCategory={(id) => applyFilter({ category_id: id })}
                            onDeleteCategory={deleteCategory}
                            onAddCategory={handleAddCategory}
                            onAddTag={handleAddTag}
                        />
                    </aside>
                </div>
            </main>

            {/* Mobile Categories & Tags BottomSheet */}
            <BottomSheet
                isOpen={isMobileSheetOpen}
                onClose={() => setIsMobileSheetOpen(false)}
                title="Categories & Tags"
            >
                <SidebarView
                    categories={categoryList}
                    tags={tagList}
                    activeCategory={activeCategory}
                    onSelectCategory={(id) => {
                        applyFilter({ category_id: id });
                        setIsMobileSheetOpen(false);
                    }}
                    onDeleteCategory={deleteCategory}
                    onAddCategory={handleAddCategory}
                    onAddTag={handleAddTag}
                />
            </BottomSheet>

            {/* Create Todo Modal / BottomSheet */}
            <TodoFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                categories={categoryList}
                tags={tagList}
                onSuccessMessage={showToast}
                isMobile={isMobile}
            />

            {/* Edit Todo Modal / BottomSheet */}
            {editingTodo && (
                <TodoFormModal
                    isOpen={Boolean(editingTodo)}
                    onClose={() => setEditingTodo(null)}
                    todo={editingTodo}
                    categories={categoryList}
                    tags={tagList}
                    onSuccessMessage={showToast}
                    isMobile={isMobile}
                />
            )}

            {/* Mobile Floating Action Button (FAB) */}
            <button
                type="button"
                className="mobile-fab"
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="Create new todo"
            >
                <PlusIcon size={24} />
            </button>
        </div>
    );
}