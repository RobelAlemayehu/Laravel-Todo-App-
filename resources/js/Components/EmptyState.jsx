import Button from './Button';
import { PlusIcon, CheckIcon, InboxIcon } from './Icons';

export default function EmptyState({
    type = 'all', // 'all' | 'active' | 'done' | 'search'
    title,
    description,
    actionText,
    onAction,
}) {
    const defaults = {
        all: {
            title: 'No todos yet',
            description: 'Start your day with a clear plan. Add your first task below.',
            actionText: 'Create your first todo',
            icon: <InboxIcon size={36} />,
        },
        active: {
            title: "You're all caught up",
            description: 'No active tasks remaining. Enjoy your break or create a new todo.',
            actionText: 'Create a todo',
            icon: <CheckIcon size={32} style={{ color: 'var(--success)' }} />,
        },
        done: {
            title: 'Nothing completed yet',
            description: 'Check off tasks as you finish them to see your progress here.',
            actionText: 'View active tasks',
            icon: <InboxIcon size={36} />,
        },
        search: {
            title: 'No matching todos',
            description: 'Try adjusting your search terms or clearing the filter.',
            actionText: 'Clear search',
            icon: <InboxIcon size={36} />,
        },
    }[type] || defaults.all;

    const displayTitle = title || defaults.title;
    const displayDesc = description || defaults.description;
    const displayAction = actionText || defaults.actionText;

    return (
        <div
            style={{
                textAlign: 'center',
                padding: '56px 20px',
                backgroundColor: 'var(--surface)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '12px 0 24px',
            }}
        >
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--choc-700)',
                    marginBottom: '16px',
                    border: '1px solid var(--border)',
                }}
            >
                {defaults.icon}
            </div>

            <h3
                style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--choc-900)',
                    marginBottom: '6px',
                }}
            >
                {displayTitle}
            </h3>

            <p
                style={{
                    fontSize: '14px',
                    color: 'var(--choc-500)',
                    maxWidth: '340px',
                    marginBottom: '20px',
                    lineHeight: 1.45,
                }}
            >
                {displayDesc}
            </p>

            {onAction && (
                <Button
                    variant={type === 'done' ? 'secondary' : 'primary'}
                    size="sm"
                    icon={type !== 'done' && type !== 'search' ? <PlusIcon size={14} /> : null}
                    onClick={onAction}
                >
                    {displayAction}
                </Button>
            )}
        </div>
    );
}
